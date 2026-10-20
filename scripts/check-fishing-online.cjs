// Browser contract with controlled parent state, not physical-device networking.
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const {readFileSync}=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const server=spawn('python3',['-m','http.server','8191','--bind','127.0.0.1'],{stdio:'ignore'});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const errors=[];try{
 const release=readFileSync('generated/site/index.html','utf8').match(/PUBLIC_MAP_RELEASE="([a-f0-9]+)"/)[1];
 for(const [uid,viewport]of [['a',{width:390,height:844}],['b',{width:320,height:568}]]){
 const page=await browser.newPage({viewport,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__fish-parent.html',route=>route.fulfill({contentType:'text/html',body:`<meta name="viewport" content="width=device-width,initial-scale=1"><script>
 window.clock=Date.now();window.directions=[];window.mapNetwork={now:()=>clock,state:{players:{'a/conn':{nickname:'Angelia',avatar:1},'b/conn':{nickname:'Friend',avatar:0}}}};
 window.current={uid:'${uid}',ready:true,online:true,visitors:{a:true},table:{round:'first',a:'a',step:0},inputs:{},game:null};
 window.fishingSpot={close(){window.closedFishing=true}};
 window.fishingNetwork={async open(receive){window.receive=receive;receive(current);return {close:async()=>{},setDirection:dir=>directions.push(dir),retry:async()=>{current.table={...current.table,round:'second'};current.game={...current.game,progress:.2,phase:'playing',seq:0,startsAt:clock+3000};receive(current)}}}};
 </script><iframe style="position:fixed;inset:0;width:100%;height:100%;border:0" src="/generated/site/releases/${release}/fishing-game.html"></iframe>`}));
 await page.goto('http://127.0.0.1:8191/__fish-parent.html');const frame=page.frameLocator('iframe');await frame.locator('#fishing-match').waitFor();
 if(uid==='a')await page.screenshot({path:'previews/fishing-online-matching.png'});
 await page.evaluate(()=>{current.table.b='b';current.visitors.b=true;current.inputs={a:{dir:0,ready:true,at:clock},b:{dir:0,ready:true,at:clock}};current.game={x:180,y:265,fishX:180,fishY:180,targetX:180,targetY:180,progress:.2,phase:'playing',seq:0,startsAt:clock+3000,updatedAt:clock};receive(current)});
 assert.equal(await frame.locator('.arrow').first().isDisabled(),true,'countdown blocks input');
 assert.equal(await frame.locator('#fishing-countdown').isVisible(),true);assert.match(await frame.locator('#fishing-countdown').textContent(),/3$/);
 if(uid==='a')await page.screenshot({path:'previews/fishing-online-countdown.png'});
 await page.evaluate(()=>{clock+=1000;receive(current)});assert.match(await frame.locator('#fishing-countdown').textContent(),/2$/);
 await page.evaluate(()=>{clock+=1000;receive(current)});assert.match(await frame.locator('#fishing-countdown').textContent(),/1$/);
 await page.evaluate(()=>{clock+=1100;current.game.updatedAt=clock;current.inputs.a.at=clock;current.inputs.b.at=clock;receive(current)});
 await frame.locator('.arrow:enabled').first().waitFor();assert.equal(await frame.locator('.arrow').first().textContent(),uid==='a'?'↑':'←');assert.equal(await frame.locator('.role:enabled').count(),0,'cannot swap axes');
 await frame.locator('.arrow').last().focus();const beforeMove=await frame.locator('#float').getAttribute('transform');await page.keyboard.down(uid==='a'?'ArrowDown':'ArrowRight');await page.waitForFunction(()=>directions.at(-1)===1);await page.waitForTimeout(150);assert.notEqual(await frame.locator('#float').getAttribute('transform'),beforeMove,'own axis responds without receiving a server snapshot');assert.equal(await frame.locator('.meter').getAttribute('aria-valuenow'),'20','prediction cannot award progress');await page.keyboard.up(uid==='a'?'ArrowDown':'ArrowRight');await page.waitForFunction(()=>directions.at(-1)===0);
 if(uid==='a')await page.screenshot({path:'previews/fishing-online-a.png'});else await page.screenshot({path:'previews/fishing-online-b.png'});
 await page.evaluate(()=>{clock+=2000;receive(current)});assert.equal(await frame.locator('.arrow').first().isDisabled(),false,'ordinary latency does not release held controls');
 await page.evaluate(()=>{clock+=2000;receive(current)});assert.equal(await frame.locator('.arrow').first().isDisabled(),true,'stale shared state pauses controls');
 await page.evaluate(()=>{current.game.phase='escaped';current.game.progress=0;current.game.updatedAt=clock;current.inputs.a.at=clock;current.inputs.b.at=clock;receive(current)});
 assert.equal(await frame.locator('.result').isVisible(),true);assert.equal(await frame.locator('.result h2').textContent(),'The fish got away!');
 await frame.locator('.again').click();assert.equal(await frame.locator('.result').isVisible(),false);assert.equal(await frame.locator('.meter').getAttribute('aria-valuenow'),'20');
 await frame.locator('.back').click();assert.equal(await page.evaluate(()=>closedFishing),true);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.close();
 }assert.deepEqual(errors,[]);console.log('PASS square matching, countdown, assigned vertical/horizontal controls, hold/release, pause, shared failure/retry and map return at 320/390px. Controlled transport only.');
 }finally{await browser.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
