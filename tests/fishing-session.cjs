const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const {buildSync}=require('esbuild');
const scope={};vm.runInNewContext(buildSync({entryPoints:['fishing-session.js'],bundle:true,format:'iife',globalName:'model',write:false}).outputFiles[0].text,scope);const {createFishingGame,advanceFishing}=scope.model;
test('shared fishing opening, split axes and bounded deterministic movement',()=>{
 const start=createFishingGame(1000,7);assert.equal(start.progress,.2);assert.equal(start.startsAt,4000);
 let next=advanceFishing(start,1,-1,.1);assert.equal(next.x,168.5);assert.equal(next.y,276.5);assert.equal(start.x,180);
 for(let i=0;i<200;i++)next=advanceFishing({...next,phase:'playing',progress:.8},1,-1,.1);
 assert.equal(next.x,45);assert.equal(next.y,390);assert.ok(next.targetX>=55&&next.targetX<=285);assert.ok(next.targetY>=60&&next.targetY<=380);
 assert.equal(JSON.stringify(advanceFishing(start,0,0,.1)),JSON.stringify(advanceFishing(start,0,0,.1)));
});
test('eight seconds aligned succeeds, five seconds missed fails, terminal state freezes',()=>{
 const aligned=()=>({...createFishingGame(0),x:180,y:180,moveIn:100});let g=aligned();
 for(let i=0;i<79;i++)g=advanceFishing(g,0,0,.1);assert.equal(g.phase,'playing');g=advanceFishing(g,0,0,.1);assert.equal(g.phase,'caught');assert.equal(g.progress,1);assert.equal(advanceFishing(g,1,1,.1),g);
 g=createFishingGame(0);g.moveIn=100;for(let i=0;i<50;i++)g=advanceFishing(g,0,0,.1);assert.equal(g.phase,'escaped');assert.equal(g.progress,0);assert.equal(advanceFishing(g,-1,-1,.1),g);
 g=aligned();g=advanceFishing(g,0,0,.1);g={...g,x:45};g=advanceFishing(g,0,0,.1);assert.ok(Math.abs(g.progress-.206)<1e-8);
});

test('requested 10 percent wider target and 3.5 second relocation retain deployed wire bounds',()=>{
 let g={...createFishingGame(0),x:219,y:180};
 let next=advanceFishing(g,0,0,.1);assert.ok(next.progress>g.progress,'39-unit offset is inside widened 39.6 radius');
 next=advanceFishing({...g,x:220},0,0,.1);assert.ok(next.progress<g.progress,'40-unit offset remains outside');
 g={...createFishingGame(0),progress:1};for(let i=0;i<34;i++){g=advanceFishing(g,0,0,.1);assert.equal(g.targetX,180);assert.ok(g.moveIn>=0&&g.moveIn<=2.8);}
 g=advanceFishing(g,0,0,.101);assert.notEqual(g.targetX,180);assert.equal(g.moveIn,2.8);
});
