// Presentation only: never advances progress, chooses targets or decides outcomes.
(() => {
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 class FishingPresentation {
  constructor(){this.round=null;this.game=null;this.key=null;this.receivedAt=0;this.cadence=.1;this.direction=0;this.releaseUntil=0;this.visual=null;}
  sample(game,time,round){
   if(!game)return;
   const key=game.seq+':'+game.updatedAt;
   if(this.round!==round||!this.visual){this.round=round;this.key=null;this.cadence=.1;this.direction=0;this.releaseUntil=0;this.visual={x:game.x,y:game.y,fishX:game.fishX,fishY:game.fishY};}
   if(this.key===key)return;
   if(this.key!==null){const gap=clamp((time-this.receivedAt)/1000,.03,.35);this.cadence=this.cadence*.8+gap*.2;}
   this.game=game;this.key=key;this.receivedAt=time;
  }
  frame(dt,time,role,direction,enabled,vertical=0,horizontal=0){
   if(!this.game||!this.visual)return null;
   dt=clamp(dt,0,.05);const g=this.game,v=this.visual;
   const playing=enabled&&g.phase==='playing';
   const ahead=playing?clamp((time-this.receivedAt)/1000+this.cadence*.5,0,.3):0;
   const fishAhead=Math.min(ahead,Math.max(0,g.moveIn));
   const blend=1-Math.exp(-dt/.065);
   const target={x:clamp(g.x+horizontal*115*ahead,45,305),y:clamp(g.y+vertical*115*ahead,45,390)};
   const fishX=g.targetX+(g.fishX-g.targetX)*Math.exp(-8*fishAhead);
   const fishY=g.targetY+(g.fishY-g.targetY)*Math.exp(-8*fishAhead);
   v.fishX+=(fishX-v.fishX)*blend;v.fishY+=(fishY-v.fishY)*blend;
   const own=role==='a'?'y':'x',other=role==='a'?'x':'y';
   v[other]+=(target[other]-v[other])*blend;
   if(!playing){this.releaseUntil=0;direction=0;}
   if(direction!==this.direction){if(!direction&&playing)this.releaseUntil=time+350;else this.releaseUntil=0;this.direction=direction;}
   if(playing&&direction)v[own]=clamp(v[own]+direction*115*dt,45,own==='x'?305:390);
   const error=target[own]-v[own];
   // Avoid pulling a locally held key backwards for every delayed packet.
   // Limit prediction lead, then gently reconcile after release/acknowledgment.
   if(playing&&direction){const excess=Math.max(0,Math.abs(error)-28);v[own]+=Math.sign(error)*excess*(1-Math.exp(-dt/.15));}
   else if(time>=this.releaseUntil)v[own]+=error*(1-Math.exp(-dt/.15));
   return {...v};
  }
 }
 if(typeof module==='object'&&module.exports)module.exports={FishingPresentation};
 else globalThis.FishingPresentation=FishingPresentation;
})();
