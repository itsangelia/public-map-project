import {ref,onValue,onDisconnect,set,remove,runTransaction} from 'firebase/database';
import {seatTable,chooseDrink} from './drink-session.js';
// Reuses map authentication and connection; never starts a second Firebase app.
export function installDrinkNetwork(context) {
 let active=null;
 window.drinkNetwork={
  async open(receive,report,signal) {
   if(signal?.aborted)throw Error('Drink shop closed.');
   if(active)throw Error('Drink shop is already open.');
   const ctx=context();
   if(!ctx.database||!ctx.user||!ctx.state.joined||!ctx.state.connected)throw Error('Reconnect to the map first.');
   const {database,user,room,connectionId}=ctx, uid=user.uid;
   const visitor=ref(database,`rooms/${room}/drinkVisitors/${uid}`);
   const tableRef=ref(database,`rooms/${room}/drinkTable`);
   const session={closed:false,stops:[],visitors:{},table:null,online:true,ready:false,busy:false};active=session;
   const disconnect=onDisconnect(visitor);
   const emit=()=>{if(!session.closed)receive({table:session.table,visitors:session.visitors,uid,online:session.online,ready:session.ready});};
   const close=async()=>{
    if(session.closed)return;session.closed=true;signal?.removeEventListener('abort',abort);session.stops.forEach(stop=>stop());if(active===session)active=null;
    // Keep queued disconnect cleanup if removing presence cannot reach the server.
    try{await Promise.all([disconnect.cancel(),remove(visitor)]);}catch{/* Does not affect map presence. */}
   };
   const abort=()=>{void close();};
   signal?.addEventListener('abort',abort,{once:true});
   const check=()=>{if(session.closed)throw Error('Drink shop closed.');};
   try{
    await disconnect.remove();check();
    await set(visitor,{connection:connectionId});check();
    session.stops.push(onValue(ref(database,`rooms/${room}/drinkVisitors`),snap=>{session.visitors=snap.val()||{};emit();},report));
    session.stops.push(onValue(tableRef,snap=>{session.table=snap.val();emit();},report));
    session.stops.push(onValue(ref(database,'.info/connected'),async snap=>{
     session.online=snap.val()===true;emit();
     if(session.online&&!session.closed){try{await disconnect.remove();if(!session.closed)await set(visitor,{connection:connectionId});}catch(error){report(error);}}
    },report));
    // A read is needed for transactional matching; no optimistic local seat/turn changes.
    const {get}=await import('firebase/database');
    session.visitors=(await get(ref(database,`rooms/${room}/drinkVisitors`))).val()||{};check();
    const round=crypto.randomUUID();
    const result=await runTransaction(tableRef,table=>seatTable(table,uid,round,session.visitors),{applyLocally:false});
    check();
    if(!result.committed && result.snapshot.val()?.a!==uid && result.snapshot.val()?.b!==uid)throw Error('This counter is busy. Please try again shortly.');
    session.table=result.snapshot.val();session.ready=true;emit();
    return {
     async choose(round,step,option){
      if(session.closed||session.busy||!session.online)throw Error('Reconnect before choosing.');
      const t=session.table;if(!t||!session.visitors[t.a]||!session.visitors[t.b])throw Error('Your partner left. Return to the map and try again.');
      session.busy=true;
      try{const result=await runTransaction(tableRef,table=>chooseDrink(table,uid,round,step,option),{applyLocally:false});if(!result.committed)throw Error('The turn changed. Please try again.');}finally{session.busy=false;}
     },close
    };
   }catch(error){await close();throw error;}
  }
 };
}
