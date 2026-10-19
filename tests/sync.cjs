// Real synchronization module with a deterministic in-memory Firebase transport.
// Tests protocol behavior, not deployed Firebase permissions or real-device networking.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const { build } = require('esbuild');

let bundle;
async function source() {
  if (bundle) return bundle;
  const modules = {
    'firebase/app': 'export const initializeApp=()=>({});',
    'firebase/auth': `export const browserSessionPersistence='session',inMemoryPersistence='memory';
      export const getAuth=()=>({});
      export async function setPersistence(a,p){harness.persist.push(p);if(p==='session'&&harness.noStorage)throw Error('storage unavailable')}
      export async function signInAnonymously(){if(harness.authFailures-->0)throw Object.assign(Error('offline'),{code:'auth/network-request-failed'});return {user:{uid:harness.uid}}}`,
    'firebase/database': `export const getDatabase=()=>({});export const ref=(d,path)=>path;
      export const serverTimestamp=()=>Date.now();
      export const onValue=(path,fn)=>harness.subscribe(path,fn);
      export const onDisconnect=path=>({remove:async()=>{harness.disconnectPath=path}});
      export const set=(path,value)=>harness.write(path,value,false);
      export const update=(path,value)=>harness.write(path,value,true);`
  };
  const result = await build({entryPoints:['multiplayer.js'],bundle:true,format:'iife',write:false,plugins:[{
    name:'test-transport', setup(b) {
      b.onResolve({filter:/^firebase\//},a=>({path:a.path,namespace:'fixture'}));
      b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:modules[a.path],loader:'js'}));
    }
  }]});
  return bundle = result.outputFiles[0].text;
}
function fixture() {
  const data = {};
  const clients = [];
  const snapshot = value => ({val:()=>structuredClone(value)});
  const broadcast = () => clients.forEach(c=>c.callbacks['rooms/campus/players']?.(snapshot(data)));
  async function client(uid, options={}) {
    const timers = new Set();
    const events = new EventTarget();
    const harness = {uid,callbacks:{},persist:[],clock:0,authFailures:0,...options,
      subscribe(path,fn) {
        this.callbacks[path]=fn;
        fn(snapshot(path==='.info/connected'?true:path==='.info/serverTimeOffset'?0:data));
      },
      async write(path,value,merge) {
        if(this.blockWrites)await new Promise(resolve=>this.release=resolve);
        const [,,,owner,id]=path.split('/');
        assert.equal(owner,uid,'client must write only its own identity');
        data[owner]??={};
        data[owner][id]=merge?{...data[owner][id],...value}:value;
        broadcast();
      },
      connected(value) { this.callbacks['.info/connected']?.(snapshot(value)); }
    };
    const document={createElement:()=>({setAttribute(){},append(){},textContent:'',title:''}),body:{appendChild(){}},getElementById:()=>null};
    const context={PUBLIC_MAP_CONFIG:{firebase:{}},document,location:{search:''},URLSearchParams,URL,CustomEvent,
      crypto:{getRandomValues:webcrypto.getRandomValues.bind(webcrypto)},
      performance:{now:()=>harness.clock},harness,console,
      setTimeout(fn,ms){const id=setTimeout(()=>{timers.delete(id);fn()},ms);timers.add(id);return id},
      clearTimeout(id){clearTimeout(id);timers.delete(id)},
      dispatchEvent:events.dispatchEvent.bind(events)};
    context.window=context;
    vm.createContext(context);clients.push(harness);
    vm.runInContext(await source(),context);
    await new Promise(r=>setImmediate(r));
    return {network:context.mapNetwork,harness,stop:()=>timers.forEach(clearTimeout)};
  }
  return {client,data,broadcast};
}
async function until(check,timeout=6000) {
  const end=Date.now()+timeout;
  while(!check()){if(Date.now()>end)throw Error('condition timed out');await new Promise(r=>setTimeout(r,10))}
}

test('two independent players see joins, movement and messages in both directions',async()=>{
 const f=fixture();const a=await f.client('alice',{noStorage:true});const b=await f.client('bob');
 try {
  await a.network.join('Alice',0,800,900);await b.network.join('Bob',1,1000,900);
  await until(()=>a.network.state.joined&&b.network.state.joined);
  assert.equal(Object.keys(a.network.state.players).length,2);assert.equal(Object.keys(b.network.state.players).length,2);
  assert.notEqual(a.network.ownKey,b.network.ownKey);assert.ok(a.harness.persist.includes('memory'));
  a.harness.clock=2000;a.network.move(850,920);b.harness.clock=2000;b.network.move(1080,950);
  await until(()=>b.network.state.players[a.network.ownKey].x===850&&a.network.state.players[b.network.ownKey].x===1080);
  await a.network.sendChat('你好 👋');assert.equal(b.network.state.players[a.network.ownKey].speech.text,'你好 👋');
  await b.network.sendChat('Hello Alice');assert.equal(a.network.state.players[b.network.ownKey].speech.text,'Hello Alice');
  await assert.rejects(()=>a.network.sendChat('too soon'),/wait a moment/);
  a.harness.clock+=1600;await a.network.sendChat('😊');assert.equal(b.network.state.players[a.network.ownKey].speech.text,'😊');
  assert.equal(a.network.state.players[a.network.ownKey].speech.id.length,36);
  for(let index=0;index<3;index++){
   b.harness.connected(false);delete f.data.bob;f.broadcast();assert.equal(Object.keys(a.network.state.players).length,1);
   b.harness.connected(true);await until(()=>b.network.state.joined);assert.equal(Object.keys(a.network.state.players).length,2);
  }
 }finally{a.stop();b.stop()}
});

test('join during authentication failure recovers, including disconnect during pending join',async()=>{
 const f=fixture();const a=await f.client('alice',{authFailures:1,noStorage:true});
 try{
  await a.network.join('Alice',0,800,900);await until(()=>a.network.state.joined);
  a.harness.connected(false);a.harness.blockWrites=true;a.harness.connected(true);await until(()=>!!a.harness.release);
  a.harness.connected(false);a.harness.connected(true);a.harness.blockWrites=false;a.harness.release();await until(()=>a.network.state.joined);
  assert.equal(Object.keys(a.network.state.players).length,1);
 }finally{a.stop()}
});

test('a missing own record is restored instead of leaving an invisible player',async()=>{
 const f=fixture();const a=await f.client('alice');
 try{await a.network.join('Alice',0,800,900);delete f.data.alice;f.broadcast();assert.equal(a.network.state.joined,false);await until(()=>a.network.state.joined);assert.equal(Object.keys(a.network.state.players).length,1)}finally{a.stop()}
});
