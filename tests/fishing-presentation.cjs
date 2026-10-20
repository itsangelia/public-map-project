const {test}=require('node:test');const assert=require('node:assert/strict');const {FishingPresentation}=require('../fishing-presentation.js');
test('local axis responds during packet gaps without changing shared progress or results',()=>{
 const g={x:180,y:265,fishX:180,fishY:180,targetX:240,targetY:240,moveIn:2,progress:.2,phase:'playing',seq:1,updatedAt:1000};
 for(const role of ['a','b']){const p=new FishingPresentation();p.sample(g,0,'round');let v;for(let i=1;i<=12;i++)v=p.frame(1/60,i*1000/60,role,1,true);assert.ok(v[role==='a'?'y':'x']>(role==='a'?265:180)+15);assert.equal(v[role==='a'?'x':'y'],role==='a'?180:265);assert.ok(v.fishX>180);assert.equal(g.progress,.2);assert.equal(g.phase,'playing');
 p.sample({...g,x:90,y:100,seq:0},300,'new-round');assert.deepEqual(p.visual,{x:90,y:100,fishX:180,fishY:180});}
});
test('prediction is bounded and pause cannot keep moving away from shared state',()=>{
 const p=new FishingPresentation(),g={x:300,y:385,fishX:180,fishY:180,targetX:180,targetY:180,moveIn:2,phase:'playing',seq:1,updatedAt:0};p.sample(g,0,'round');for(let i=0;i<60;i++){const v=p.frame(1/60,i*1000/60,'b',1,true,1,1);assert.ok(v.x<=305&&v.y<=390);}
 for(let i=0;i<120;i++)p.frame(1/60,1000+i*1000/60,'b',1,false,1,1);assert.ok(Math.abs(p.visual.x-g.x)<.01);assert.ok(Math.abs(p.visual.y-g.y)<.01);
});
