// Same-origin shop panel: the parent owns Firebase auth and the map connection.
(() => {
 const host=window.parent;
 const originalRender=render;
 let controller=null,snapshot=null,sending=false,disposed=false,previousRound='',previousStep=-1;
 const wait=document.createElement('section');wait.id='drink-match';
 wait.innerHTML='<h2>Make a drink together</h2><div class="match-pair"><article><h3 id="match-a-name">You</h3><div class="match-square" id="match-a-avatar">?</div></article><span class="match-plus">＋</span><article><h3 id="match-b-name">Waiting…</h3><div class="match-square" id="match-b-avatar">?</div></article></div><p id="match-status" role="status">Finding a partner…</p><button id="match-retry" hidden>Try again</button>';
 document.querySelector('.steps').after(wait);
 const feedback=document.createElement('p');feedback.id='drink-online-status';feedback.setAttribute('role','status');document.getElementById('app').append(feedback);
 const style=document.createElement('style');style.textContent=`#drink-match{margin:auto 16px;padding:24px 12px;background:#f3e7d2;border:3px solid #654936;border-radius:15px;text-align:center}#drink-match h2{font:700 21px Georgia;color:#59452e;margin:0 0 25px}.match-pair{display:grid;grid-template-columns:minmax(0,1fr) 26px minmax(0,1fr);gap:7px;align-items:center}.match-pair article{min-width:0}.match-pair h3{font:700 15px Georgia;margin:0 0 9px;overflow-wrap:anywhere}.match-square{aspect-ratio:1;border:3px solid #75583f;border-radius:10px;background:#e7d8bd;display:grid;place-items:center;font:45px Georgia;color:#a58a78}.match-square img{width:90%;height:90%;object-fit:contain}.match-plus{font-size:25px;margin-top:24px}#match-status{font:14px Georgia;line-height:1.5;margin:24px 0 5px}#match-retry{border:2px solid #654936;background:#c78e85;color:#fff7e7;border-radius:12px;padding:10px 20px;font:16px Georgia}#drink-online-status{position:absolute;bottom:0;left:6px;right:6px;margin:0;text-align:center;font:11px Georgia;color:#654936;background:#f5e8d1}.option:disabled{cursor:default}.option:disabled:not([aria-pressed="true"]){opacity:.7}`;document.head.append(style);
 const report=error=>{feedback.textContent=/permission/i.test(error.code||error.message)?'Drink shop rules need to be published by the host.':error.message||'Connection interrupted. Please try again.';document.getElementById('match-status').textContent=feedback.textContent;document.getElementById('match-retry').hidden=false;};
 function person(uid){return Object.entries(host.mapNetwork?.state.players||{}).find(([key])=>key.startsWith(uid+'/'))?.[1];}
 function drawMatch(id,uid){const player=uid?person(uid):null;document.getElementById('match-'+id+'-name').textContent=player?.nickname||(uid===snapshot?.uid?'You':'Waiting…');const box=document.getElementById('match-'+id+'-avatar');box.replaceChildren();if(player){const img=document.createElement('img');img.src=new URL(['男角色.png','女角色.png','购物袋.png'][player.avatar],host.document.baseURI).href;img.alt='';box.append(img);}else box.textContent='?';}
 render=()=>{
  originalRender();
  const table=snapshot?.table;
  const paired=snapshot?.ready&&table?.b;
  const member=table&&(table.a===snapshot?.uid||table.b===snapshot?.uid);
  const waiting=!paired||!member;
  wait.hidden=!waiting;
  document.querySelector('.stage').hidden=waiting;document.getElementById('choose').hidden=waiting||finished;document.getElementById('bottom').hidden=waiting||finished;document.getElementById('result').hidden=waiting||!finished;
  document.querySelector('.steps').hidden=waiting;
  drawMatch('a',table?.a||snapshot?.uid);drawMatch('b',table?.b);
  const alive=table&&snapshot?.visitors[table.a]&&snapshot?.visitors[table.b];
  const ownTurn=member&&table?.b&&(table.step%2===0?table.a:table.b)===snapshot?.uid;
  document.querySelectorAll('.player').forEach((el,i)=>{el.querySelector('.player-name').textContent=person(i===0?table?.a:table?.b)?.nickname||'Player '+(i===0?'A':'B');el.querySelector('.player-status').textContent=finished?'Made together':table&&table.step%2===i?(ownTurn?'Your turn':'Choosing…'):'Waiting';});
  document.querySelectorAll('.option').forEach(el=>{el.disabled=!ownTurn||!alive||!snapshot?.online||sending;});
  document.getElementById('next').disabled=!ownTurn||!alive||!snapshot?.online||sending||!choices[step];
  if(!snapshot?.online&&snapshot){feedback.textContent='Reconnecting…';}
  else if(!waiting&&!finished&&!alive){feedback.textContent='Your partner left. Return to the map and try again.';}
  else if(!waiting&&!finished){feedback.textContent=sending?'Adding…':ownTurn?'Your turn':'Your partner is choosing…';}
  else if(finished){feedback.textContent='';}
  if(!waiting&&!finished)document.getElementById('turn-caption').textContent=ownTurn?'Choose one, then add.':'Your partner is choosing…';
  if(finished){const a=person(table.a)?.nickname||'Player A',b=person(table.b)?.nickname||'Player B';document.querySelector('.makers').textContent=`A creation by ${a} + ${b}`;}
 };
 function receive(next){
  if(disposed)return;snapshot=next;const t=next.table;
  if(t&&next.ready){const changed=t.round!==previousRound||t.step!==previousStep;for(let i=0;i<4;i++)if(i<t.step||changed)choices[i]=t['c'+i]||null;previousRound=t.round;previousStep=t.step;step=Math.min(t.step,3);finished=t.step===4;}
  render();
 }
 async function connect(){document.getElementById('match-retry').hidden=true;feedback.textContent='';try{await controller?.close();controller=null;const next=await host.drinkNetwork.open(receive,report);if(disposed)await next.close();else{controller=next;render();}}catch(error){report(error);}}
 document.getElementById('next').onclick=async()=>{if(!controller||sending||!snapshot?.table||!choices[step])return;sending=true;render();try{await controller.choose(snapshot.table.round,step,choices[step]);}catch(error){report(error);}finally{sending=false;render();}};
 const close=()=>{host.drinkShop.close();};
 document.querySelector('.exit').onclick=e=>{e.preventDefault();close();};document.getElementById('back-to-map').onclick=e=>{e.preventDefault();close();};
 document.getElementById('match-retry').onclick=connect;
 window.disposeDrinkMaker=()=>{disposed=true;controller?.close();};
 window.addEventListener('pagehide',()=>window.disposeDrinkMaker());
 render();connect();
})();
