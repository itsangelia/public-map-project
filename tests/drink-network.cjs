// Deterministic transport test; does not assert deployed Firebase rule behavior.
const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const {buildSync}=require('esbuild');const {webcrypto}=require('node:crypto');
const shim=`export const ref=(d,p)=>p;export const onValue=(p,cb)=>h.listen(p,cb);export const onDisconnect=p=>({remove:async()=>{},cancel:async()=>{}});export const set=(p,v)=>h.set(p,v);export const remove=p=>h.set(p,null);export const get=async p=>({val:()=>h.read(p)});export const runTransaction=async(p,f)=>h.transaction(p,f);`;
async function bundle(){return (await require('esbuild').build({stdin:{contents:"import {installDrinkNetwork} from './drink-network.js';installDrinkNetwork(()=>({database:{},user:{uid:uid},room:'test',connectionId:'conn',state:{joined:true,connected:true}}));",resolveDir:process.cwd()},bundle:true,format:'iife',write:false,plugins:[{name:'fake',setup(b){b.onResolve({filter:/^firebase\/database$/},()=>({path:'db',namespace:'fake'}));b.onLoad({filter:/.*/,namespace:'fake'},()=>({contents:shim}));}}]})).outputFiles[0].text;}
test('two independent drink clients share turns, reject third seat and preserve completion',async()=>{
 const code=await bundle(),data={},listeners=new Map();
 const copy=x=>x==null?null:JSON.parse(JSON.stringify(x));
 const h={read(p){if(p==='.info/connected')return true;return copy(p.split('/').reduce((v,k)=>v?.[k],data));},listen(p,cb){if(!listeners.has(p))listeners.set(p,new Set());listeners.get(p).add(cb);cb({val:()=>h.read(p)});return()=>listeners.get(p).delete(cb);},async set(p,v){const keys=p.split('/');let obj=data;for(const k of keys.slice(0,-1))obj=obj[k]??={};if(v===null)delete obj[keys.at(-1)];else obj[keys.at(-1)]=copy(v);for(const [path,cbs] of listeners)if(p.startsWith(path)||path.startsWith(p))for(const cb of cbs)cb({val:()=>h.read(path)});},async transaction(p,f){const val=f(h.read(p));if(val===undefined)return {committed:false,snapshot:{val:()=>h.read(p)}};await h.set(p,val);return {committed:true,snapshot:{val:()=>copy(val)}};}};
 function client(uid){const context={window:{},uid,h,crypto:webcrypto};vm.runInNewContext(code,context);return context.window.drinkNetwork;}
 const a=client('a'),b=client('b'),c=client('c');let sa,sb;const errors=[];
 const ca=await a.open(v=>sa=v,e=>errors.push(e));assert.equal(sa.table.a,'a');assert.equal(sa.table.b,undefined);
 const cb=await b.open(v=>sb=v,e=>errors.push(e));assert.equal(sa.table.b,'b');assert.equal(sb.table.a,'a');
 await assert.rejects(c.open(()=>{},()=>{}),/busy/);
 await assert.rejects(cb.choose(sa.table.round,0,'sparkling'),/turn changed/);
 const round=sa.table.round;
 for(const [i,option] of ['sparkling','mango','jelly','lemon'].entries()){await (i%2?cb:ca).choose(round,i,option);assert.equal(sa.table.step,i+1);assert.equal(sb.table.step,i+1);}
 await assert.rejects(ca.choose(round,0,'milk-tea'),/turn changed/);
 assert.equal(sa.table.c3,'lemon');await ca.close();assert.equal(sb.visitors.a,undefined);await cb.close();assert.deepEqual(errors,[]);
 const cc=await c.open(()=>{},()=>{});assert.equal(h.read('rooms/test/drinkTable').a,'c');assert.equal(h.read('rooms/test/drinkTable').step,0);await cc.close();
});
