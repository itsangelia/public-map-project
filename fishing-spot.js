// Approved fishing entrance artwork; isolated cooperative fishing panel.
(() => {
 const base=new URL('.',document.currentScript.src);
 const sprite=new Image();
 const spot={x:350*1.6,y:690*1.6,width:252*1.6,height:209.7*1.6};
 let frame=null;
 const entry=document.createElement('button');entry.id='fishing-spot-entry';entry.hidden=true;entry.setAttribute('aria-label','Open Fish Together');
 Object.assign(entry.style,{position:'fixed',zIndex:'11',background:'transparent',border:'0',padding:'0',borderRadius:'30%',touchAction:'manipulation'});
 entry.onclick=()=>{if(!near||frame||page!=='map'||window.wishingTree?.isOpen()||(window.drinkShop?.isOpen()||window.sharedPiano?.isOpen()))return;near=false;entry.hidden=true;stopMovement();frame=document.createElement('iframe');frame.title='Fish Together';frame.src=new URL('fishing-game.html',base).href;Object.assign(frame.style,{position:'fixed',inset:'0',width:'100%',height:'100dvh',border:'0',zIndex:'100',background:'#eee5d2'});document.body.append(frame);updateTouchControls();};
 document.body.append(entry);
 let glow=null,emphasis=0,lastFrame=performance.now(),near=false;
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 sprite.onload=()=>{
  const silhouette=document.createElement('canvas');
  silhouette.width=Math.ceil(spot.width);silhouette.height=Math.ceil(spot.height);
  const ink=silhouette.getContext('2d');ink.drawImage(sprite,0,0,silhouette.width,silhouette.height);
  ink.globalCompositeOperation='source-in';ink.fillStyle='#ffe79a';ink.fillRect(0,0,silhouette.width,silhouette.height);
  glow=document.createElement('canvas');glow.width=silhouette.width+80;glow.height=silhouette.height+80;
  const context=glow.getContext('2d');context.shadowColor='#ffdc77';context.shadowBlur=22;
  for(const [dx,dy]of [[-3,0],[3,0],[0,-3],[0,3]])context.drawImage(silhouette,40+dx,40+dy);
 };
 sprite.src=new URL('fishing-spot.png',base).href;
 window.fishingSpot={
  isOpen:()=>!!frame,
  close(){frame?.contentWindow?.disposeFishing?.();frame?.remove();frame=null;stopMovement();updateTouchControls();},
  position:Object.freeze({...spot}),isNear:()=>near,
  draw(){
   if(!sprite.complete||!sprite.naturalWidth)return;
   const x=spot.x-cameraX,y=spot.y-cameraY;
   near=!displayMode&&page==='map'&&!window.wishingTree?.isOpen()&&!(window.drinkShop?.isOpen()||window.sharedPiano?.isOpen())&&!frame
    &&Math.hypot(playerX-spot.x,playerY-(spot.y+spot.height/2-55))<=230;
   const now=performance.now(),elapsed=Math.min(100,now-lastFrame);lastFrame=now;
   emphasis+=((near?1:0)-emphasis)*(1-Math.exp(-elapsed/160));
   const pulse=reducedMotion.matches?0:Math.sin(now/430),scale=1+emphasis*(.035+pulse*.008);
   const drawWidth=spot.width*scale,drawHeight=spot.height*scale,left=x-drawWidth/2,top=y+spot.height/2-drawHeight;
   const context=drawingContext;context.save();
   if(glow&&emphasis>.01){context.globalAlpha=emphasis*(reducedMotion.matches?.85:.8+pulse*.15);context.drawImage(glow,left-40*scale,top-40*scale,glow.width*scale,glow.height*scale);context.globalAlpha=1;}
   context.shadowColor='rgba(255,245,188,.6)';context.shadowBlur=5;
   context.drawImage(sprite,left,top,drawWidth,drawHeight);context.restore();
   entry.hidden=displayMode||page!=='map'||!!frame||!!window.wishingTree?.isOpen()||!!(window.drinkShop?.isOpen()||window.sharedPiano?.isOpen());
   if(!entry.hidden){const bounds=document.querySelector('main canvas')?.getBoundingClientRect();if(bounds){Object.assign(entry.style,{left:`${bounds.left+left*bounds.width/width}px`,top:`${bounds.top+top*bounds.height/height}px`,width:`${drawWidth*bounds.width/width}px`,height:`${drawHeight*bounds.height/height}px`});entry.disabled=!near;}}

  }
 };
})();
