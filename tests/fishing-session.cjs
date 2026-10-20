const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const {buildSync}=require('esbuild');
const scope={};vm.runInNewContext(buildSync({entryPoints:['fishing-session.js'],bundle:true,format:'iife',globalName:'model',write:false}).outputFiles[0].text,scope);const {createFishingGame,advanceFishing}=scope.model;
test('shared fishing opening, split axes and bounded deterministic movement',()=>{
 const start=createFishingGame(1000,7);assert.equal(start.progress,.2);assert.equal(start.startsAt,4000);
 let next=advanceFishing(start,1,-1,.1);assert.equal(next.x,168.5);assert.equal(next.y,276.5);assert.equal(start.x,180);
 for(let i=0;i<200;i++)next=advanceFishing({...next,phase:'playing',progress:.8},1,-1,.1);
 assert.equal(next.x,45);assert.equal(next.y,390);assert.ok(next.targetX>=55&&next.targetX<=285);assert.ok(next.targetY>=60&&next.targetY<=380);
 assert.equal(JSON.stringify(advanceFishing(start,0,0,.1)),JSON.stringify(advanceFishing(start,0,0,.1)));
});
test('eight seconds aligned succeeds, four seconds missed fails, terminal state freezes',()=>{
 const aligned=()=>({...createFishingGame(0),x:180,y:180,moveIn:100});let g=aligned();
 for(let i=0;i<79;i++)g=advanceFishing(g,0,0,.1);assert.equal(g.phase,'playing');g=advanceFishing(g,0,0,.1);assert.equal(g.phase,'caught');assert.equal(g.progress,1);assert.equal(advanceFishing(g,1,1,.1),g);
 g=createFishingGame(0);g.moveIn=100;for(let i=0;i<40;i++)g=advanceFishing(g,0,0,.1);assert.equal(g.phase,'escaped');assert.equal(g.progress,0);assert.equal(advanceFishing(g,-1,-1,.1),g);
 g=aligned();g=advanceFishing(g,0,0,.1);g={...g,x:45};g=advanceFishing(g,0,0,.1);assert.ok(Math.abs(g.progress-.205)<1e-8);
});
