import {ref,get,onValue,onDisconnect,set,remove,runTransaction,serverTimestamp} from 'firebase/database';
import {seatTable} from './drink-session.js';
import {createFishingGame,advanceFishing} from './fishing-session.js';
export function installFishingNetwork(context){
 let active=null;
 window.fishingNetwork={async open(receive,report,signal){
  if(signal?.aborted)throw Error('Fishing closed.');if(active)throw Error('Fishing is already open.');
  const ctx=context();if(!ctx.database||!ctx.user||!ctx.state.joined||!ctx.state.connected)throw Error('Reconnect to the map first.');
  const {database,user,room,connectionId}=ctx,uid=user.uid,clock=ctx.now;
  const path=`rooms/${room}`,visitor=ref(database,`${path}/fishingVisitors/${uid}`),tableRef=ref(database,`${path}/fishingTable`),disconnect=onDisconnect(visitor);
  const session={table:null,visitors:{},game:null,inputs:{},ready:false,online:true,closed:false,dir:0,round:null,stops:[],roundStops:[],busy:false,pendingWrites:0,lastInput:0,lastDir:null,lastReady:null,lastStep:performance.now(),error:null};active=session;
  let timer;
  const emit=()=>{if(!session.closed)receive({table:session.table,visitors:session.visitors,game:session.game,inputs:session.inputs,uid,ready:session.ready,online:session.online,now:clock()});};
  const fail=error=>{if(session.closed)return;session.error=error;session.dir=0;report(error);};
  const close=async()=>{if(session.closed)return;session.closed=true;session.dir=0;clearInterval(timer);signal?.removeEventListener('abort',abort);document.removeEventListener('visibilitychange',visibility);session.stops.forEach(f=>f());session.roundStops.forEach(f=>f());if(active===session)active=null;try{await Promise.all([disconnect.cancel(),remove(visitor)]);}catch{}};
  const abort=()=>{void close();};signal?.addEventListener('abort',abort,{once:true});
  const check=()=>{if(session.closed)throw Error('Fishing closed.');};
  const alive=()=>session.table?.b&&session.visitors[session.table.a]&&session.visitors[session.table.b];
  function watchRound(table){
   if(session.closed||!table?.b||![table.a,table.b].includes(uid)||session.round===table.round)return;
   session.roundStops.forEach(f=>f());session.roundStops=[];session.round=table.round;session.game=null;session.inputs={};session.error=null;session.dir=0;session.lastInput=0;session.lastDir=null;session.lastStep=performance.now();
   const round=table.round;
   session.roundStops.push(onValue(ref(database,`${path}/fishingGames/${round}/sim`),snap=>{if(session.closed||session.round!==round)return;session.game=snap.val();emit();},fail));
   session.roundStops.push(onValue(ref(database,`${path}/fishingGames/${round}/inputs`),snap=>{if(session.closed||session.round!==round)return;session.inputs=snap.val()||{};emit();},fail));
  }
  async function writeInput(force=false){
   const t=session.table;if(session.closed||!session.online||!session.ready||!t?.b||![t.a,t.b].includes(uid)||session.error)return;
   const ready=!document.hidden&&!!alive(),dir=ready?session.dir:0;
   if(!force&&session.lastDir===dir&&session.lastReady===ready&&clock()-session.lastInput<500)return;
   const round=t.round;session.lastInput=clock();session.lastDir=dir;session.lastReady=ready;
   try{await set(ref(database,`${path}/fishingGames/${round}/inputs/${uid}`),{dir,ready,at:serverTimestamp()});}catch(error){if(session.round===round)fail(error);}
  }
  const visibility=()=>{session.dir=0;session.lastStep=performance.now();void writeInput(true);};document.addEventListener('visibilitychange',visibility);
  async function pump(){
   if(session.closed)return;const at=performance.now();
   void writeInput();
   const t=session.table;
   if(!session.ready||!session.online||session.error||document.hidden||!alive()||t.a!==uid){session.lastStep=at;return;}
   if(session.busy||session.pendingWrites>=3)return;
   const round=t.round,sim=ref(database,`${path}/fishingGames/${round}/sim`);
   const a=session.inputs[t.a],b=session.inputs[t.b];
   if(!a?.ready||!b?.ready||!Number.isFinite(a.at)||!Number.isFinite(b.at)||clock()-a.at>2500||clock()-b.at>2500){session.lastStep=at;return;}
   if(!session.game){
    session.busy=true;session.lastStep=at;
    try{await runTransaction(sim,game=>game||createFishingGame(clock(),Math.floor(Math.random()*1000000)),{applyLocally:false});}
    catch(error){if(session.round===round)fail(error);}finally{session.busy=false;}
    return;
   }
   const game=session.game;
   if(game.phase!=='playing'||clock()<game.startsAt){session.lastStep=at;return;}
   const dt=Math.min(.2,(at-session.lastStep)/1000);session.lastStep=at;
   const next={...advanceFishing(game,a.dir,b.dir,dt),updatedAt:clock()};
   // Only A writes this state. Firebase preserves write order, so a transaction
   // round trip is unnecessary for every frame. Cap in-flight writes to avoid
   // building an unbounded queue on a slow or interrupted connection.
   session.game=next;session.pendingWrites++;emit();
   void set(sim,{...next,updatedAt:serverTimestamp()})
    .catch(error=>{if(session.round===round)fail(error);})
    .finally(()=>{session.pendingWrites--;});
  }

  try{
   await disconnect.remove();check();await set(visitor,{connection:connectionId});check();
   session.stops.push(onValue(ref(database,`${path}/fishingVisitors`),snap=>{session.visitors=snap.val()||{};emit();},fail));
   session.stops.push(onValue(tableRef,snap=>{session.table=snap.val();watchRound(session.table);emit();},fail));
   session.stops.push(onValue(ref(database,'.info/connected'),async snap=>{session.online=snap.val()===true;session.dir=0;session.lastStep=performance.now();emit();if(session.online&&!session.closed)try{await disconnect.remove();check();await set(visitor,{connection:connectionId});void writeInput(true);}catch(error){if(!session.closed)fail(error);}},fail));
   let result;const proposedRound=crypto.randomUUID();
   for(let attempt=0;attempt<3;attempt++){
    session.visitors=(await get(ref(database,`${path}/fishingVisitors`))).val()||{};check();
    try{result=await runTransaction(tableRef,table=>seatTable(table,uid,proposedRound,session.visitors),{applyLocally:false});break;}
    catch(error){
     // A newly registered peer may have been absent from the preceding presence
     // snapshot. Server rules reject replacing that live peer: refresh and retry.
     if(attempt===2||!String(error.code||'').toLowerCase().includes('permission'))throw error;
     await get(tableRef);check();
    }
   }
   check();const t=result.snapshot.val();if(!result.committed&&t?.a!==uid&&t?.b!==uid)throw Error('This pond is busy. Please try again shortly.');
   session.table=t;session.ready=true;watchRound(t);emit();timer=setInterval(pump,50);
   return {setDirection(value){session.dir=session.online&&[-1,0,1].includes(value)?value:0;void writeInput();},
    async retry(){const t=session.table;if(!session.online||!alive()||!['caught','escaped'].includes(session.game?.phase))throw Error('Both players need to be connected to retry.');const round=crypto.randomUUID();await runTransaction(tableRef,current=>current?.round===t.round?{...current,round}:undefined,{applyLocally:false});},close};
  }catch(error){await close();throw error;}
 }};
}
