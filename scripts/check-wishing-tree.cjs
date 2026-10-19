// Browser integration checks with an explicit shared transport fixture.
// These checks do not certify deployed Firebase rules or real-device networking.
const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const fixture=`
window.wishSubscribers=new Set();
window.mapNetwork={state:{players:{},joined:true,connected:true,readReady:true},ownKey:'fixture/player',
 async join(name,avatar,x,y){this.state.players[this.ownKey]={nickname:name,avatar,x,y}},async waitForJoined(){},move(){},now:()=>Date.now(),
 createWishId:()=>crypto.randomUUID(),subscribeWishes(fn){wishSubscribers.add(fn);window.getSharedWishes().then(fn);return ()=>wishSubscribers.delete(fn)},
 async sendWish(text,id){await window.saveSharedWish({id,text,name:this.state.players[this.ownKey].nickname,createdAt:Date.now()})},async sendChat(){}
};`;
(async()=>{
 const server=spawn('python3',['-m','http.server','8176','--bind','127.0.0.1','--directory','generated/site'],{stdio:'ignore'});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const pages=[],wishes=[],errors=[];
 try{
  for(let n=0;n<30;n++){try{if((await fetch('http://127.0.0.1:8176/')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
  for(const [index,viewport] of [{width:375,height:812},{width:390,height:844}].entries()){
   const context=await browser.newContext({viewport,isMobile:true,hasTouch:true});
   await context.exposeFunction('getSharedWishes',()=>wishes);
   await context.exposeFunction('saveSharedWish',async wish=>{wishes.unshift(wish);for(const page of pages)await page.evaluate(values=>{for(const fn of window.wishSubscribers)fn(values)},wishes)});
   const page=await context.newPage();pages.push(page);page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/multiplayer.js*',route=>route.fulfill({contentType:'application/javascript',body:fixture}));
   await page.goto('http://127.0.0.1:8176/?room=wish-test');
   await page.waitForFunction(()=>typeof nameInput!=='undefined'&&nameInput);
   await page.evaluate(async name=>{nameInput.value(name);await enterMap()},index?'Bob':'Alice');
   await page.waitForTimeout(250);
   assert.equal(await page.locator('#wishing-tree-entry').isEnabled(),false,'tree requires approach');
   await page.evaluate(()=>{playerX=724*1.6;playerY=417*1.6+150;updateCamera()});
   await page.waitForFunction(()=>!document.getElementById('wishing-tree-entry').disabled);
   await page.waitForTimeout(600);
   await page.screenshot({path:`/tmp/wish-near-${viewport.width}.png`});
   // Real touch input does not wait for a breathing target to stop animating.
   const target=await page.locator('#wishing-tree-entry').boundingBox();
   await page.touchscreen.tap(target.x+target.width/2,target.y+target.height/2);
   const board=page.frameLocator('#wishing-tree-panel');
   await board.locator('#write').click();
   assert.equal(await board.locator('#nickname').inputValue(),index?'Bob':'Alice');
   assert.equal(await board.locator('#nickname').getAttribute('readonly'),'');
   await board.locator('#message').fill(index?'I hope to meet new friends on campus.':'希望交到新朋友 🌳 <script>alert(1)</script>');
   await board.locator('button[type=submit]').click();
   await board.locator('#compose').waitFor({state:'hidden'});
   assert.equal(await board.locator('.wish-note').first().locator('.excerpt').textContent(),index?'I hope to…':'希望交到新朋友…');
   assert.match(await board.locator('.wish-note').first().evaluate(el=>getComputedStyle(el).animationName),/wish-sway/);
   assert.equal(await page.locator('#movement-controls').isVisible(),false);
  }
  for(const page of pages){
   const board=page.frameLocator('#wishing-tree-panel');
   await board.locator('#wish-count').filter({hasText:'2 wishes'}).waitFor();
   await board.locator('.wish-note').last().click();
   assert.equal(await board.locator('#wish-author').textContent(),'Alice');
   assert.match(await board.locator('#wish-text').textContent(),/<script>/,'message remains literal text');
   const box=await board.locator('#read-paper').boundingBox();
   assert.ok(box.x>=0&&box.width<=page.viewportSize().width);
   await page.screenshot({path:`/tmp/wish-card-${page.viewportSize().width}.png`});
   await board.locator('[data-close=read-paper]').click();
   await page.screenshot({path:`/tmp/wish-board-${page.viewportSize().width}.png`});
   await board.locator('.back').click();
   await page.locator('#wishing-tree-panel').waitFor({state:'detached'});
   assert.equal(await page.locator('#movement-controls').isVisible(),true);
   await page.screenshot({path:`/tmp/wish-map-${page.viewportSize().width}.png`});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS 375px/390px map approach, nickname inheritance, shared wishes, safe text, cards, return to map and restored controls (mock transport).');
 }finally{await browser.close();server.kill()}
})().catch(error=>{console.error(error);process.exitCode=1});
