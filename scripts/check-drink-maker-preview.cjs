// Local UI preview only: no Firebase or simulated multiplayer networking.
const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
(async()=>{
 const server=spawn('python3',['-m','http.server','8196','--bind','127.0.0.1'],{stdio:'ignore'});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const errors=[];
 try{
  for(let i=0;i<30;i++){try{if((await fetch('http://127.0.0.1:8196/drink-maker-preview.html')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
  for(const viewport of [{width:320,height:568},{width:375,height:667},{width:390,height:844},{width:430,height:932}]){
   const page=await browser.newPage({viewport,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8196/drink-maker-preview.html');
   assert.equal(await page.locator('#options button').count(),3);
   assert.equal(await page.locator('#next').isDisabled(),true);
   assert.ok(await page.locator('#next').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight), 'confirm button fits phone viewport');
   assert.equal(await page.locator('#drink-illustration circle[cx="150"][cy="200"]').count(),0,'cup has no logo');
   if(viewport.width===390)await page.screenshot({path:'/tmp/drink-maker-base.png',fullPage:true});
   let beforeFinishHeight=0;
   for(const [index,id] of ['milk-tea','mango','pearls','ice-cream'].entries()){
    assert.equal(await page.locator('.player.active').getAttribute('data-player'),String(index%2));
    await page.locator(`[data-option="${id}"]`).click();
    assert.equal(await page.locator('#next').isDisabled(),false);
    assert.equal(await page.locator(`[data-option="${id}"]`).getAttribute('aria-pressed'),'true');
    if(viewport.width===390&&index===1)await page.screenshot({path:'/tmp/drink-maker-flavor.png',fullPage:true});
    if(index===3)beforeFinishHeight=await page.locator('#drink-illustration').evaluate(el=>el.getBoundingClientRect().height);
    await page.locator('#next').click();
    if(index<3)assert.equal(await page.locator('#next').isDisabled(),true);
   }
   assert.equal(await page.locator('#result-title').textContent(),'Mango Milk Tea');
   assert.equal(await page.locator('#recipe').count(),0);
   assert.equal(await page.locator('#back-to-map').textContent(),'Back to map →');
   assert.match(await page.locator('#back-to-map').getAttribute('href'),/room=campus/);
   assert.ok(await page.locator('#back-to-map').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight),'back to map visible');
   assert.ok(await page.locator('#drink-illustration').evaluate(el=>el.getBoundingClientRect().height)>beforeFinishHeight,'completed drink enlarged');
   assert.equal(await page.locator('#choose').isVisible(),false);
   assert.match(await page.locator('#drink-illustration').getAttribute('aria-label'),/Pearls and Ice Cream/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
   if(viewport.width===390)await page.screenshot({path:'/tmp/drink-maker-finished.png',fullPage:true});
   await page.reload();assert.equal(await page.locator('#next').isDisabled(),true);
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8196/drink-maker-preview.html');
  const combinations=await page.evaluate(()=>{
   let count=0;
   for(const a of stages[0].options)for(const b of stages[1].options)for(const c of stages[2].options)for(const d of stages[3].options){
    choices.splice(0,4,a.id,b.id,c.id,d.id);step=3;finished=true;render();
    if(document.getElementById('result-title').textContent!==b.name+' '+a.name)throw Error('incorrect result title');
    if(document.getElementById('recipe'))throw Error('ingredient summary should be removed');
    if(document.querySelector('#drink-illustration ellipse[cy="289"]'))throw Error('cup shadow remains');
    if(document.querySelector('#drink-illustration path[d="m165 88 20-57"]'))throw Error('straw remains');
    const texture={'sparkling':'sparkling-bubbles','milk-tea':'milk-ribbons','slush':'crushed-ice'}[a.id];
    for(const layer of [texture,c.id,d.id])if(!document.querySelector('[data-layer="'+layer+'"]'))throw Error('missing visible ingredient layer '+layer);
    if(!document.getElementById('drink-illustration').getAttribute('aria-label').includes(d.name))throw Error('missing decoration');
    count++;
   }return count;
  });assert.equal(combinations,81);assert.deepEqual(errors,[]);
  console.log('PASS 320/375/390/430px layouts, four exact option groups, A/B/A/B turns, selection/confirm guards, live cup layers, all 81 recipes, enlarged completion, back-to-map link, no straws/shadow/recipe summary and no runtime errors. UI only; multiplayer not connected.');
 }finally{await browser.close();server.kill()}
})().catch(error=>{console.error(error);process.exitCode=1});
