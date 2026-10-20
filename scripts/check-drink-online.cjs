// Browser UI contract with a controlled parent transport, not a live Firebase/device test.
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const {readFileSync}=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const server=spawn('python3',['-m','http.server','8195','--bind','127.0.0.1'],{stdio:'ignore'});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const errors=[];try{
 const release=readFileSync('generated/site/index.html','utf8').match(/PUBLIC_MAP_RELEASE="([a-f0-9]+)"/)[1];
 for(const viewport of [{width:320,height:568},{width:390,height:844}]){
 const page=await browser.newPage({viewport,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__drink-parent.html',route=>route.fulfill({contentType:'text/html',body:`<meta name="viewport" content="width=device-width,initial-scale=1"><script>
 window.mapNetwork={state:{players:{'a/conn':{nickname:'Angelia',avatar:1},'b/conn':{nickname:'Friend',avatar:0}}}};
 window.current={uid:'a',ready:true,online:true,visitors:{a:true},table:{round:'round',a:'a',step:0}};
 window.drinkShop={close(){window.closedShop=true}};
 window.drinkNetwork={async open(receive){window.receive=receive;receive(current);return {close:async()=>{},choose:async(round,step,option)=>{if(current.table.step!==step||step%2)throw Error('wrong turn');current.table={...current.table,['c'+step]:option,step:step+1};receive(current);}}}};
 </script><iframe style="position:fixed;inset:0;width:100%;height:100%;border:0" src="/generated/site/releases/${release}/drink-maker.html"></iframe>`}));
 await page.goto('http://127.0.0.1:8195/__drink-parent.html');const frame=page.frameLocator('iframe');await frame.locator('#drink-match').waitFor();
 assert.equal(await frame.locator('#match-a-name').textContent(),'Angelia');assert.equal(await frame.locator('#match-b-avatar').textContent(),'?');assert.equal(await frame.locator('#match-a-avatar img').count(),1);
 if(viewport.width===390)await page.screenshot({path:'previews/drink-maker-matching.png'});
 await page.evaluate(()=>{current.table.b='b';current.visitors.b=true;receive(current)});
 assert.equal(await frame.locator('#drink-turn-toast').textContent(),'Your turn');
 assert.equal(await frame.locator('#drink-turn-toast').isVisible(),true);
 assert.equal(await frame.locator('#drink-turn-toast').getAttribute('data-turn'),'round:0');
 if(viewport.width===390)await page.screenshot({path:'previews/drink-maker-your-turn.png'});
 if(viewport.width===320){await frame.locator('#drink-turn-toast').waitFor({state:'hidden'});await page.evaluate(()=>receive(current));assert.equal(await frame.locator('#drink-turn-toast').isVisible(),false,'same turn does not repeat notification');}
 await frame.locator('[data-option="milk-tea"]').click();await frame.locator('#next').click();assert.equal(await frame.locator('#next').isDisabled(),true);assert.equal(await frame.locator('.option:enabled').count(),0);assert.equal(await frame.locator('#drink-turn-toast').isVisible(),false);
 await page.evaluate(()=>{current.table.c1='strawberry';current.table.step=2;receive(current)});
 assert.equal(await frame.locator('#drink-turn-toast').getAttribute('data-turn'),'round:2');
 await frame.locator('[data-option="pearls"]').click();await frame.locator('#next').click();
 await page.evaluate(()=>{current.table.c3='foam';current.table.step=4;receive(current)});
 assert.equal(await frame.locator('#result-title').textContent(),'Strawberry Milk Tea');assert.equal(await frame.locator('.makers').textContent(),'A creation by Angelia + Friend');assert.equal(await frame.locator('#recipe').count(),0);assert.equal(await frame.locator('#drink-turn-toast').isVisible(),false);
 if(viewport.width===390)await page.screenshot({path:'previews/drink-maker-online-finished.png'});
 await frame.locator('#back-to-map').click();assert.equal(await page.evaluate(()=>closedShop),true);await page.close();
 }assert.deepEqual(errors,[]);console.log('PASS square matching portraits/nicknames, waiting, peer turn lock, shared completion, return-to-map contract at 320/390px. Controlled transport only.');
 }finally{await browser.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
