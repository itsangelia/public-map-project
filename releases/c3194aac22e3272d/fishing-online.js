// Parent-owned Firebase session; no local simulation or role switching online.
(() => {
 const host=window.parent,app=document.querySelector('.app');
 let controller=null,snapshot=null,abort=new AbortController(),disposed=false,lastError='',round=null,lastOutcome=null,sentDirection=0;
 const waiting=document.createElement('section');waiting.id='fishing-match';waiting.innerHTML='<h2>Fish together</h2><div class="match-pair"><article><h3 id="fish-a-name">You</h3><div class="match-square" id="fish-a-avatar">?</div></article><span>＋</span><article><h3 id="fish-b-name">Waiting…</h3><div class="match-square" id="fish-b-avatar">?</div></article></div><p id="fish-match-status" role="status">Finding a partner…</p><button id="fish-match-retry" hidden>Try again</button>';
 document.querySelector('.roles').after(waiting);
 const style=document.createElement('style');style.textContent=`#fishing-match{margin:auto 0;padding:24px 12px;background:#f3e7d2;border:3px solid #654936;border-radius:15px;text-align:center}#fishing-match h2{font:700 22px Georgia;margin:0 0 24px}.match-pair{display:grid;grid-template-columns:minmax(0,1fr) 24px minmax(0,1fr);gap:8px;align-items:center}.match-pair h3{font:700 15px Georgia;margin:0 0 9px;overflow-wrap:anywhere}.match-square{aspect-ratio:1;border:3px solid #75583f;border-radius:10px;background:#e7d8bd;display:grid;place-items:center;overflow:hidden;font:45px Georgia;color:#a58a78}.match-square img{width:90%;height:90%;object-fit:contain;transform:scale(1.8)}#fish-match-status{font-size:14px;margin:22px 0 4px}#fish-match-retry{padding:10px 20px;border:2px solid #654936;border-radius:10px;background:#c8998c}.role:disabled{cursor:default;opacity:1}.arrow:disabled{opacity:.6;cursor:default}`;document.head.append(style);
 document.querySelector('.preview').hidden=true;
 const player=uid=>Object.entries(host.mapNetwork?.state.players||{}).find(([key])=>key.startsWith(uid+'/'))?.[1];
 function portrait(seat,uid){const p=uid?player(uid):null;document.getElementById('fish-'+seat+'-name').textContent=p?.nickname||(uid===snapshot?.uid?'You':'Waiting…');const box=document.getElementById('fish-'+seat+'-avatar');box.replaceChildren();if(p){const image=document.createElement('img');image.src=new URL(['男角色.png','女角色.png','购物袋.png'][p.avatar],host.document.baseURI).href;image.alt='';box.append(image);}else box.textContent='?';}
 function report(error){if(disposed)return;lastError=/permission/i.test(error.code||error.message)?'Ask the host to publish the fishing rules.':error.message||'Connection interrupted.';document.getElementById('fish-match-status').textContent=lastError;document.getElementById('fish-match-retry').hidden=false;release();}
 const now=()=>host.mapNetwork?.now?.()||Date.now();
 function view(){
  if(disposed)return;
  const t=snapshot?.table,g=snapshot?.game,uid=snapshot?.uid,member=t&&(t.a===uid||t.b===uid),paired=snapshot?.ready&&member&&!!t.b;
  waiting.hidden=!!paired;document.querySelector('.board').hidden=!paired;document.querySelector('.controls').hidden=!paired;document.querySelector('.roles').hidden=!paired;
  portrait('a',member?t.a:uid);portrait('b',member?t.b:null);
  const ready=!!(t?.b&&snapshot.visitors[t.a]&&snapshot.visitors[t.b]),inputs=snapshot?.inputs||{};
  const fresh=t&&inputs[t.a]?.ready&&inputs[t.b]?.ready&&now()-inputs[t.a].at<1500&&now()-inputs[t.b].at<1500;
  const countdown=g?Math.max(0,Math.ceil((g.startsAt-now())/1000)):0;
  const enabled=paired&&snapshot.online&&ready&&fresh&&g?.phase==='playing'&&!countdown&&now()-g.updatedAt<1600&&!lastError;
  document.querySelectorAll('.role').forEach(button=>{button.disabled=true;const seat=button.dataset.role;button.firstChild.textContent=(player(seat==='a'?t?.a:t?.b)?.nickname||'Player '+seat.toUpperCase())+' · '+(seat==='a'?'↕':'↔');});
  document.querySelectorAll('.arrow').forEach(button=>{button.disabled=!enabled;});
  if(!enabled){release();if(sentDirection!==0){controller?.setDirection(0);sentDirection=0;}}
  let message='Finding a partner…';
  if(lastError)message=lastError;
  else if(!snapshot?.online&&snapshot)message='Reconnecting…';
  else if(!paired)message='Waiting for a partner…';
  else if(!ready)message='Your partner left. Return to the map to match again.';
  else if(!g)message='Getting the pond ready…';
  else if(countdown)message='Starting in '+countdown+'…';
  else if(g.phase==='caught')message='Caught together!';
  else if(g.phase==='escaped')message='The fish got away';
  else if(!enabled)message='Waiting for your partner to reconnect…';
  else message=Math.hypot(g.x-g.fishX,g.y-g.fishY)<=settings.catchRadius?'Stay together…':'Keep the float over the fish.';
  document.getElementById('status').textContent=message;
  if(snapshot?.ready&&!member){document.getElementById('fish-match-status').textContent='This pond is busy. Please try again.';document.getElementById('fish-match-retry').hidden=false;}
  if(paired){const role=t.a===uid?'a':'b';if(state.role!==role)setRole(role);document.getElementById('role-label').textContent=(player(uid)?.nickname||'You')+' · '+(role==='a'?'Up & down':'Left & right');}
  if(!paired)document.querySelector('.result').hidden=true;
  if(g&&paired&&g.phase!=='playing'&&lastOutcome!==t.round+':'+g.phase){lastOutcome=t.round+':'+g.phase;finish(g.phase);}
  document.querySelector('.again').disabled=!snapshot?.online||!ready;
  return enabled;
 }
 function receive(next){
  if(disposed)return;snapshot=next;const t=next.table,g=next.game;
  if(t?.round!==round){round=t?.round;lastError='';lastOutcome=null;release();state.complete=false;state.outcome=null;state.progress=settings.initialProgress;document.querySelector('.result').hidden=true;}
  if(g){state.progress=g.progress;state.target={x:g.targetX,y:g.targetY};}
  view();
 }
 let frameId;
 function paint(){if(disposed)return;const g=snapshot?.game;if(g){for(const [key,target]of [['float',{x:g.x,y:g.y}],['fish',{x:g.fishX,y:g.fishY}]]){state[key].x+=(target.x-state[key].x)*.35;state[key].y+=(target.y-state[key].y)*.35;}draw(Math.hypot(g.x-g.fishX,g.y-g.fishY)<=settings.catchRadius);}view();const next=view()?(direction||0):0;if(next!==sentDirection){controller?.setDirection(next);sentDirection=next;}frameId=requestAnimationFrame(paint);}
 async function connect(){lastError='';document.getElementById('fish-match-retry').hidden=true;try{abort.abort();await controller?.close();controller=null;abort=new AbortController();const next=await host.fishingNetwork.open(receive,report,abort.signal);if(disposed)await next.close();else controller=next;}catch(error){report(error);}}
 document.getElementById('fish-match-retry').onclick=connect;
 const close=e=>{e.preventDefault();host.fishingSpot.close();};document.querySelector('.back').onclick=close;document.querySelector('.map').onclick=close;
 document.querySelector('.again').onclick=async()=>{release();lastError='';try{await controller?.retry();}catch(error){report(error);}};
 window.disposeFishing=()=>{if(disposed)return;disposed=true;release();cancelAnimationFrame(frameId);abort.abort();controller?.close();};window.addEventListener('pagehide',()=>window.disposeFishing());
 view();connect();frameId=requestAnimationFrame(paint);
})();
