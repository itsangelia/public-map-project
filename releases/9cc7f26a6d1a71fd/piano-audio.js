// Short synthesized piano tones; no samples, permissions, or external audio files.
(() => {
 const midi=Array.from({length:21},(_,i)=>[48,50,52,53,55,57,59][i%7]+12*Math.floor(i/7));
 let ctx=null,master=null,muted=new URLSearchParams(location.search).get('mode')==='display';
 try{const saved=localStorage.getItem('campus-piano-muted');if(saved!==null&&new URLSearchParams(location.search).get('mode')!=='display')muted=saved==='true';}catch{}
 const seen=new Set(),voices=new Set();
 const button=document.createElement('button');button.id='piano-sound';button.type='button';button.textContent='♫';button.hidden=true;
 button.setAttribute('aria-label','Enable map piano sound');
 Object.assign(button.style,{position:'fixed',right:'14px',top:'max(14px,env(safe-area-inset-top))',width:'42px',height:'42px',borderRadius:'50%',border:'2px solid #826449',background:'#fff8e9e8',color:'#594834',zIndex:'110',fontSize:'23px',touchAction:'manipulation'});document.body.append(button);
 function sync(){button.textContent=muted?'♫̸':'♫';button.setAttribute('aria-label',muted?'Enable map piano sound':'Mute map piano sound');button.setAttribute('aria-pressed',String(!muted));if(master)master.gain.setTargetAtTime(muted?0:.35,ctx.currentTime,.03);}
 async function unlock(){
  if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ctx=new Audio();master=ctx.createGain();master.connect(ctx.destination);sync();}
  if(ctx.state==='suspended')await ctx.resume();
 }
 button.onclick=async()=>{muted=!muted;try{localStorage.setItem('campus-piano-muted',String(muted));}catch{}await unlock().catch(()=>{});sync();};
 document.addEventListener('pointerdown',()=>{void unlock().catch(()=>{});},{capture:true});
 document.addEventListener('keydown',()=>{void unlock().catch(()=>{});},{capture:true});
 window.addEventListener('piano-note',event=>{
  const note=event.detail;
  if(seen.has(note.id))return;seen.add(note.id);if(seen.size>200)seen.delete(seen.values().next().value);
  if(!Number.isInteger(note.key)||note.key<0||note.key>20)return;
  document.dispatchEvent(new CustomEvent('piano-flash',{detail:note.key}));
  if(muted||!ctx||ctx.state!=='running'||document.hidden)return;
  // A lost page must not continue to accumulate an unbounded audio graph.
  if(voices.size>=36)return;
  let level=1;
  if(typeof playerX==='number'&&window.pianoSpot&&!window.sharedPiano?.isOpen()){
   const s=window.pianoSpot.position;level=.14+.86*Math.max(0,1-Math.hypot(playerX-s.x,playerY-s.y)/1200);
  }
  const t=ctx.currentTime,f=440*2**((midi[note.key]-69)/12),gain=ctx.createGain();gain.connect(master);voices.add(gain);
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.23*level,t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+1.25);
  const nodes=[];
  for(const [multiple,weight]of [[1,1],[2,.25],[3,.1]]){const osc=ctx.createOscillator(),amp=ctx.createGain();osc.type='sine';osc.frequency.value=f*multiple;amp.gain.value=weight;osc.connect(amp);amp.connect(gain);osc.start(t);osc.stop(t+1.3);nodes.push(osc,amp);}
  setTimeout(()=>{nodes.forEach(n=>n.disconnect());gain.disconnect();voices.delete(gain);},1450);
 });
 setInterval(()=>{button.hidden=typeof page!=='string'||page!=='map';sync();},500);
 window.mapPianoAudio={unlock,isMuted:()=>muted};sync();
})();
