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
      export const initializeAuth=(a,options)=>{harness.persist.push(options.persistence);return {}};
      export async function setPersistence(a,p){harness.persist.push(p);if(p==='session'&&harness.noStorage)throw Error('storage unavailable')}
      export async function signInAnonymously(){if(harness.authFailures-->0)throw Object.assign(Error('offline'),{code:'auth/network-request-failed'});return {user:{uid:harness.uid}}}`,
    'firebase/database': `export const getDatabase=()=>({});export const ref=(d,path)=>path;
      export const serverTimestamp=()=>Date.now();
      export const query=(path,...constraints)=>path;export const orderByChild=key=>key;export const limitToLast=count=>count;
      export const onValue=(path,fn,error)=>harness.subscribe(path,fn,error);
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
  const wishes = {};
  const blessings = {};
  const clients = [];
  const snapshot = value => ({val:()=>structuredClone(value)});
  const broadcast = () => clients.forEach(c=>{c.callbacks['rooms/campus/players']?.(snapshot(data));c.callbacks['rooms/campus/wishes']?.(snapshot(wishes));for(const [path,callback] of Object.entries(c.callbacks)){if(path.startsWith('rooms/campus/wishBlessings/'))callback(snapshot(blessings[path.split('/').at(-1)]||{}))}});
  async function client(uid, options={}) {
    const timers = new Set();
    const events = new EventTarget();
    const harness = {uid,callbacks:{},persist:[],clock:0,authFailures:0,...options,
      subscribe(path,fn,error) {
        if(this.denyRead && path==='rooms/campus/players') { error({code:'PERMISSION_DENIED'}); return; }
        if(this.denyWishes && path==='rooms/campus/wishes'){error({code:'PERMISSION_DENIED'});return ()=>{}}
        if(this.denyBlessings&&path.includes('/wishBlessings/')){error({code:'PERMISSION_DENIED'});return ()=>{}}
        this.callbacks[path]=fn;
        fn(snapshot(path==='.info/connected'?true:path==='.info/serverTimeOffset'?0:path.endsWith('/wishes')?wishes:path.includes('/wishBlessings/')?(blessings[path.split('/').at(-1)]||{}):data));
        return ()=>{delete this.callbacks[path]};
      },
      async write(path,value,merge) {
        if(this.blockWrites)await new Promise(resolve=>this.release=resolve);
        if(path.includes('/wishBlessings/')){
          const [,,,wishId,owner]=path.split('/');assert.equal(owner,uid);
          if(this.denyBlessings||!wishes[wishId]||blessings[wishId]?.[owner])throw Object.assign(Error('denied'),{code:'PERMISSION_DENIED'});
          assert.equal(value,true);blessings[wishId]??={};blessings[wishId][owner]=value;broadcast();return;
        }
        if(path.includes('/wishes/')){if(this.denyWishes)throw Object.assign(Error('denied'),{code:'PERMISSION_DENIED'});assert.equal(value.owner,uid);wishes[path.split('/').at(-1)]=value;broadcast();return}
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
  return {client,data,wishes,blessings,broadcast};
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


test('joining requires a confirmed record and readable room, not merely a local map', async()=>{
 const f=fixture();const a=await f.client('alice');
 try{
  a.harness.blockWrites=true;
  const pending=a.network.join('Alice',0,800,900);
  await until(()=>!!a.harness.release);
  let ready=false;
  const gate=a.network.waitForJoined().then(()=>{ready=true});
  await new Promise(r=>setTimeout(r,150));
  assert.equal(ready,false);
  assert.equal(a.network.state.joined,false);
  a.harness.blockWrites=false;a.harness.release();await pending;await gate;
  assert.equal(ready,true);assert.equal(a.network.state.readReady,true);
 }finally{a.stop()}
});


test('a successful write cannot hide room read permission failure',async()=>{
 const f=fixture();const a=await f.client('alice',{denyRead:true});
 try{await a.network.join('Alice',0,800,900);assert.equal(a.network.state.readReady,false);await assert.rejects(()=>a.network.waitForJoined(),/PERMISSION_DENIED/)}finally{a.stop()}
});


test('wishes are shared, retain the real nickname and survive author departure',async()=>{
 const f=fixture(),a=await f.client('alice'),b=await f.client('bob');
 try{
  await a.network.join('Alice',0,800,900);await b.network.join('Bob',1,1000,900);
  let received=[];const unsubscribe=b.network.subscribeWishes(values=>received=values,()=>assert.fail('unexpected error'));
  const id=a.network.createWishId();await a.network.sendWish('愿大家顺利毕业 🌿',id);
  assert.equal(received.length,1);assert.equal(received[0].name,'Alice');assert.equal(received[0].text,'愿大家顺利毕业 🌿');
  a.harness.connected(false);delete f.data.alice;f.broadcast();
  assert.equal(received.length,1);assert.equal(Object.keys(b.network.state.players).length,1);
  await assert.rejects(()=>a.network.sendWish('offline',a.network.createWishId()),/Reconnect/);
  unsubscribe();assert.equal(b.harness.callbacks['rooms/campus/wishes'],undefined);
 }finally{a.stop();b.stop()}
});
test('wish permission failures do not break presence or chat',async()=>{
 const f=fixture(),a=await f.client('alice',{denyWishes:true}),b=await f.client('bob');
 try{
  await a.network.join('Alice',0,800,900);await b.network.join('Bob',1,1000,900);
  let error;a.network.subscribeWishes(()=>assert.fail('read should be denied'),value=>error=value);
  assert.match(error.message,/wishing-tree database rules/);
  await assert.rejects(()=>a.network.sendWish('test',a.network.createWishId()),/rules/);
  assert.equal(a.network.state.joined,true);assert.equal(a.network.state.readReady,true);
  assert.equal(Object.keys(a.network.state.players).length,2);
  await a.network.sendChat('Still here');assert.equal(b.network.state.players[a.network.ownKey].speech.text,'Still here');
 }finally{a.stop();b.stop()}
});
test('wish inputs reject empty, oversized and invalid identifiers',async()=>{
 const f=fixture(),a=await f.client('alice');try{await a.network.join('Alice',0,800,900);
 await assert.rejects(()=>a.network.sendWish('   ',a.network.createWishId()),/1–160/);
 await assert.rejects(()=>a.network.sendWish('a'.repeat(161),a.network.createWishId()),/1–160/);
 await assert.rejects(()=>a.network.sendWish('valid','../../players'),/identifier/);
 assert.equal(Object.keys(f.wishes).length,0);
 }finally{a.stop()}
});

test('adding wishing rules preserves the stable player and chat permissions',()=>{
 const {readFileSync}=require('node:fs'),{execFileSync}=require('node:child_process');
 const stable=JSON.parse(execFileSync('git',['show','stable-2026-10-19-v1:database.rules.json'],{encoding:'utf8'}));
 const current=JSON.parse(readFileSync('database.rules.json','utf8'));
 assert.deepEqual(current.rules.rooms.$room.players,stable.rules.rooms.$room.players);
 assert.equal(current.rules['.read'],false);assert.equal(current.rules['.write'],false);
 const wishes=current.rules.rooms.$room.wishes;
 assert.match(wishes['.read'],/query.limitToLast <= 100/);
 assert.match(wishes.$wish['.write'],/!data.exists\(\)/);
});


test('simultaneous blessings are shared, counted once per player and persist after leaving',async()=>{
 const f=fixture(),a=await f.client('alice'),b=await f.client('bob');
 try{
  await a.network.join('Alice',0,800,900);await b.network.join('Bob',1,1000,900);
  const id=a.network.createWishId();await a.network.sendWish('Make new friends',id);
  let alice,bob;
  const stopA=a.network.subscribeBlessings(id,value=>alice=value,()=>assert.fail('unexpected read error'));
  b.network.subscribeBlessings(id,value=>bob=value,()=>assert.fail('unexpected read error'));
  assert.equal(alice.count,0);assert.equal(bob.blessed,false);
  await Promise.all([a.network.blessWish(id),b.network.blessWish(id)]);
  assert.equal(alice.count,2);assert.equal(bob.count,2);assert.equal(alice.blessed,true);assert.equal(bob.blessed,true);
  await assert.rejects(()=>a.network.blessWish(id),/already/);assert.equal(Object.keys(f.blessings[id]).length,2);
  stopA();assert.equal(a.harness.callbacks['rooms/campus/wishBlessings/'+id],undefined);
  a.network.subscribeBlessings(id,value=>alice=value,()=>assert.fail('unexpected read error'));assert.equal(alice.blessed,true);
  b.harness.connected(false);delete f.data.bob;f.broadcast();assert.equal(alice.count,2);
  await a.network.sendChat('Still here');assert.equal(a.network.state.joined,true);
 }finally{a.stop();b.stop()}
});
test('pending double-taps and offline blessings cannot add votes',async()=>{
 const f=fixture(),a=await f.client('alice');
 try{
  await a.network.join('Alice',0,800,900);const id=a.network.createWishId();await a.network.sendWish('Good luck',id);
  a.harness.blockWrites=true;const pending=a.network.blessWish(id);await until(()=>!!a.harness.release);
  await assert.rejects(()=>a.network.blessWish(id),/already/);
  a.harness.blockWrites=false;a.harness.release();await pending;assert.equal(Object.keys(f.blessings[id]).length,1);
  a.harness.connected(false);await assert.rejects(()=>a.network.blessWish(a.network.createWishId()),/Reconnect/);
  await assert.rejects(()=>a.network.blessWish('../../players'),/identifier/);
 }finally{a.stop()}
});
test('blessing permission failures leave wishes, presence and chat working',async()=>{
 const f=fixture(),a=await f.client('alice',{denyBlessings:true}),b=await f.client('bob');
 try{
  await a.network.join('Alice',0,800,900);await b.network.join('Bob',1,1000,900);
  const id=a.network.createWishId();await a.network.sendWish('Good luck to everyone',id);
  let error;a.network.subscribeBlessings(id,()=>assert.fail('read should fail'),value=>error=value);
  assert.match(error.message,/blessing rules/);
  await assert.rejects(()=>a.network.blessWish(id),/blessing rules/);
  assert.equal(a.network.state.joined,true);assert.equal(a.network.state.readReady,true);assert.equal(Object.keys(a.network.state.players).length,2);
  await a.network.sendChat('Hello again');assert.equal(b.network.state.players[a.network.ownKey].speech.text,'Hello again');
  let wishes;a.network.subscribeWishes(value=>wishes=value,()=>assert.fail('wishes should remain readable'));assert.equal(wishes.length,1);
  await assert.rejects(()=>b.network.blessWish(b.network.createWishId()),/rules/);
 }finally{a.stop();b.stop()}
});
test('blessing rules are additive and retain the approved wish and player permissions',()=>{
 const {readFileSync}=require('node:fs'),{execFileSync}=require('node:child_process');
 const stable=JSON.parse(execFileSync('git',['show','af6de6f:database.rules.json'],{encoding:'utf8'}));
 const current=JSON.parse(readFileSync('database.rules.json','utf8'));
 assert.deepEqual(current.rules.rooms.$room.players,stable.rules.rooms.$room.players);
 assert.deepEqual(current.rules.rooms.$room.wishes,stable.rules.rooms.$room.wishes);
 const rule=current.rules.rooms.$room.wishBlessings.$wish.$uid;
 assert.match(rule['.write'],/auth.uid === \$uid/);assert.match(rule['.write'],/!data.exists\(\)/);
 assert.match(rule['.validate'],/newData.isBoolean/);
});
