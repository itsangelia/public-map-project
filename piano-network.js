import {ref,onValue,onChildAdded,query,limitToLast,push,set,remove,runTransaction,get,serverTimestamp} from 'firebase/database';
import {claimPiano} from './piano-session.js';
// Uses the existing map Firebase app, room and anonymous identity.
export function installPianoNetwork(context){
 let seat=null,stop=null,lastError=null,releaseReason=null,expiring=false;const listeners=new Set(),errors=new Set();
 let lastLocal=0;
 const emit=()=>{for(const cb of listeners)cb({seat,now:context().now()});};
 const report=e=>{lastError=e;for(const cb of errors)cb(e);};
 const ready=()=>{const c=context();if(!c.database||!c.user||!c.state.connected)throw Error('Reconnect to the map first.');return c;};
 const seatRef=c=>ref(c.database,`rooms/${c.room}/pianoSeat`);
 const own=(c,s=seat)=>s?.uid===c.user?.uid&&s?.connection===c.connectionId;
 const api=window.pianoNetwork={
  get seat(){return seat;},
  get releaseReason(){return releaseReason;},
  get isOwner(){const c=context();return own(c)&&seat.until>c.now()&&c.state.joined&&c.state.connected;},
  subscribe(receive,onError=()=>{}){
   listeners.add(receive);errors.add(onError);emit();if(lastError)onError(lastError);
   return()=>{listeners.delete(receive);errors.delete(onError);};
  },
  async claim(){
   const c=ready();if(!c.state.joined)throw Error('Join the map before playing.');
   const players=(await get(ref(c.database,`rooms/${c.room}/players`))).val()||{};
   const nickname=players[c.user.uid]?.[c.connectionId]?.nickname||'Guest';
   const token=crypto.randomUUID();
   const result=await runTransaction(seatRef(c),current=>claimPiano(current,c.user.uid,c.connectionId,nickname,token,c.now(),players),{applyLocally:false});
   if(!result.committed)throw Error('Someone is playing. Listen for a while.');
   releaseReason=null;seat=result.snapshot.val();emit();
  },
  async release(){
   releaseReason=null;const c=context(),token=seat?.token;if(!own(c)||!c.database)return;
   await runTransaction(seatRef(c),current=>current?.token===token&&own(c,current)?null:undefined,{applyLocally:false});
  },
  async note(key){
   const c=ready();if(!api.isOwner||!Number.isInteger(key)||key<0||key>20)return;
   if(performance.now()-lastLocal<18)return;lastLocal=performance.now();
   const target=push(ref(c.database,`rooms/${c.room}/pianoNotes`));
   const event={uid:c.user.uid,token:seat.token,key,at:serverTimestamp()};
   // Local sound is immediate. The echoed event ID must not sound a second time.
   window.dispatchEvent(new CustomEvent('piano-note',{detail:{...event,id:target.key,local:true}}));
   // Only an actual accepted key extends the eight-second seat window.
   const token=seat.token,activeUntil=c.now()+8000;
   const renewal=runTransaction(seatRef(c),current=>own(c,current)&&current.token===token&&current.until>c.now()?{...current,until:Math.max(current.until,activeUntil)}:undefined,{applyLocally:false});
   await Promise.all([set(target,event),renewal]);
   setTimeout(()=>remove(target).catch(()=>{}),10000);
  }
 };
 function connect(){
  const c=context();if(!c.database||!c.user||!c.state.connected||stop)return;
  const listeningSince=c.now();const stops=[];stop=()=>{stops.forEach(fn=>fn());stop=null;};
  stops.push(onValue(seatRef(c),snap=>{seat=snap.val();emit();},report));
  stops.push(onChildAdded(query(ref(c.database,`rooms/${c.room}/pianoNotes`),limitToLast(32)),snap=>{
   const event=snap.val();if(!event||event.at<listeningSince||event.at>c.now()+1000||c.now()-event.at>1500)return;
   window.dispatchEvent(new CustomEvent('piano-note',{detail:{...event,id:snap.key,local:false}}));
  },report));
 }
 setInterval(()=>{
  connect();emit();const c=context();
  if(!own(c)||!seat||seat.until>c.now()||expiring)return;
  const token=seat.token;expiring=true;
  // Check the shared deadline inside the transaction: a last-moment key or
  // another performer's claim must never be erased by a stale expiry callback.
  void runTransaction(seatRef(c),current=>own(c,current)&&current.token===token&&current.until<=c.now()?null:undefined,{applyLocally:false})
   .then(result=>{if(result.committed){releaseReason='idle';emit();}}).catch(report).finally(()=>{expiring=false;});
 },250);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)void api.release().catch(()=>{});});
 window.addEventListener('pagehide',()=>{void api.release().catch(()=>{});});
}
