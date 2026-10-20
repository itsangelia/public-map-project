// Pure authoritative fishing model; all clients render the host's committed state.
export const FISHING_SETTINGS={speed:115,radius:36,gain:.1,decay:.05,opening:.2,moveSeconds:2.8};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createFishingGame(now,seed=1){return {x:180,y:265,fishX:180,fishY:180,targetX:180,targetY:180,progress:.2,moveIn:2.8,phase:'playing',startsAt:now+3000,updatedAt:now,seq:0,seed:Math.abs(seed)%2147483646+1};}
export function advanceFishing(game,vertical,horizontal,dt){
 if(game.phase!=='playing')return game;
 const next={...game},s=FISHING_SETTINGS;dt=clamp(dt,0,.2);
 next.x=clamp(next.x+horizontal*s.speed*dt,45,305);next.y=clamp(next.y+vertical*s.speed*dt,45,390);
 next.moveIn-=dt;
 if(next.moveIn<=0){const random=()=>{next.seed=next.seed*16807%2147483647;return(next.seed-1)/2147483646;};next.targetX=55+random()*230;next.targetY=60+random()*320;next.moveIn=s.moveSeconds;}
 const amount=1-Math.exp(-dt*8);next.fishX+=(next.targetX-next.fishX)*amount;next.fishY+=(next.targetY-next.fishY)*amount;
 const aligned=Math.hypot(next.x-next.fishX,next.y-next.fishY)<=s.radius;
 next.progress=clamp(next.progress+(aligned?s.gain:-s.decay)*dt,0,1);
 if(next.progress>=1-1e-9){next.progress=1;next.phase='caught';}else if(next.progress<=1e-9){next.progress=0;next.phase='escaped';}
 next.seq++;return next;
}
