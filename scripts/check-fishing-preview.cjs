// Local mechanics/UI validation only, not shared-device networking.
const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
(async()=>{
 const server=spawn('python3',['-m','http.server','8193','--bind','127.0.0.1'],{stdio:'ignore'});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const errors=[];
 try{
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:430,height:932}]){
   const page=await browser.newPage({viewport,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
   await page.goto('http://127.0.0.1:8193/fishing-preview.html');
   assert.equal(await page.locator('.meter').getAttribute('aria-valuenow'),'20');
   assert.ok(await page.locator('.controls').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));
   assert.equal(await page.locator('.arrow').count(),2);
   await page.keyboard.down('ArrowUp');await page.evaluate(()=>tick(.2));await page.keyboard.up('ArrowUp');
   assert.equal(await page.evaluate(()=>state.float.x),180);assert.ok(await page.evaluate(()=>state.float.y<265));
   await page.locator('[data-role=b]').click();assert.equal(await page.locator('.arrow').first().textContent(),'←');
   await page.keyboard.down('ArrowRight');await page.evaluate(()=>tick(.2));await page.keyboard.up('ArrowRight');
   assert.ok(await page.evaluate(()=>state.float.x>180));assert.equal(await page.evaluate(()=>direction),0);
   await page.evaluate(()=>{state.float.x=304;direction=1;tick(.05);release()});
   assert.ok(await page.evaluate(()=>state.float.x<=305));
   // Eight aligned seconds from the 20% opening progress, no earlier completion.
   await page.evaluate(()=>{state.progress=.2;state.float={x:150,y:210};state.fish={x:150,y:210};state.target={x:150,y:210};state.untilMove=99;for(let i=0;i<159;i++)tick(.05)});
   assert.equal(await page.evaluate(()=>state.complete),false);
   await page.evaluate(()=>tick(.05));assert.equal(await page.evaluate(()=>state.outcome),'caught');
   assert.equal(await page.locator('.meter').getAttribute('aria-valuenow'),'100');
   await page.locator('.again').click();assert.equal(await page.evaluate(()=>state.progress),.2);
   // Misalignment loses 5% per second. At zero the round must end and freeze.
   await page.evaluate(()=>{state.fish={x:55,y:60};state.target={x:55,y:60};state.untilMove=99;for(let i=0;i<20;i++)tick(.05)});
   assert.ok(Math.abs(await page.evaluate(()=>state.progress)-.15)<1e-8);
   await page.evaluate(()=>{for(let i=0;i<60;i++)tick(.05)});
   assert.equal(await page.evaluate(()=>state.progress),0);assert.equal(await page.evaluate(()=>state.outcome),'escaped');
   assert.equal(await page.locator('.result h2').textContent(),'The fish got away');
   assert.ok(await page.locator('.again').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));
   const frozen=await page.evaluate(()=>JSON.stringify(state));await page.evaluate(()=>tick(1));assert.equal(await page.evaluate(()=>JSON.stringify(state)),frozen);
   if(viewport.width===390)await page.screenshot({path:'previews/fishing-failed.png'});
   await page.locator('.again').click();assert.equal(await page.locator('.result').isVisible(),false);assert.equal(await page.evaluate(()=>state.outcome),null);
   // Accumulated gains and losses can be recovered; failure is not triggered above zero.
   await page.evaluate(()=>{state.float={x:150,y:210};state.fish={x:150,y:210};state.target={x:150,y:210};state.untilMove=99;tick(1);state.float.x=45;tick(1)});
   assert.ok(Math.abs(await page.evaluate(()=>state.progress)-.25)<1e-8);assert.equal(await page.evaluate(()=>state.complete),false);
   if(viewport.width===390){await page.evaluate(()=>{state.float={x:180,y:250};state.fish={x:175,y:230};state.target={x:175,y:230};state.progress=.4;setRole('a');document.activeElement.blur();draw(true)});await page.screenshot({path:'previews/fishing-phone-a.png'});await page.evaluate(()=>setRole('b'));await page.screenshot({path:'previews/fishing-phone-b.png'});}
   await page.evaluate(()=>{state.untilMove=0;tick(.05)});assert.ok(await page.evaluate(()=>state.target.x>=55&&state.target.x<=285&&state.target.y>=60&&state.target.y<=380));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS 320/390/430px, split controls/release/bounds, opening 20%, gain 10%/s, loss 5%/s, eight-second minimum catch, zero-progress failure/freeze/retry, recovery and runtime checks. Local only.');
 }finally{await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
