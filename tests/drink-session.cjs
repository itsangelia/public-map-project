const {test}=require('node:test');const assert=require('node:assert/strict');const {buildSync}=require('esbuild');const vm=require('node:vm');
const context={};vm.runInNewContext(buildSync({entryPoints:['drink-session.js'],bundle:true,format:'iife',globalName:'model',write:false}).outputFiles[0].text,context);const {seatTable,chooseDrink,DRINK_OPTIONS}=context.model;
test('two seats, exclusive alternating turns and immutable round guards',()=>{
 const visitors={a:true,b:true,c:true};let table=seatTable(null,'a','round',visitors);table=seatTable(table,'b','ignored',visitors);
 assert.equal(seatTable(table,'c','ignored',visitors),undefined);
 assert.equal(chooseDrink(table,'b','round',0,'sparkling'),undefined);
 for(const [step,option]of ['milk-tea','matcha','pearls','foam'].entries()){
  const old=table;table=chooseDrink(table,step%2?'b':'a','round',step,option);assert.equal(table.step,step+1);assert.equal(old.step,step);
  assert.equal(chooseDrink(table,step%2?'b':'a','round',step,option),undefined);
 }
 assert.equal(chooseDrink(table,'a','round',4,'foam'),undefined);
 assert.equal(chooseDrink(table,'a','old-round',0,'sparkling'),undefined);
 assert.equal(seatTable(table,'c','new',{b:true,c:true}).a,'c');
});
test('all 81 recipes retain earlier choices and reject cross-stage options',()=>{
 let count=0;for(const a of DRINK_OPTIONS[0])for(const b of DRINK_OPTIONS[1])for(const c of DRINK_OPTIONS[2])for(const d of DRINK_OPTIONS[3]){
 let t={round:'r',a:'a',b:'b',step:0};for(const [i,option]of [a,b,c,d].entries()){assert.equal(chooseDrink(t,i%2?'b':'a','r',i,'invalid'),undefined);t=chooseDrink(t,i%2?'b':'a','r',i,option);}assert.equal(t.c0,a);assert.equal(t.c3,d);count++;}assert.equal(count,81);
});
