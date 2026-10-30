// Run with isolated-server.cjs and external Playwright; exercises actual engine, not a fake controller.
const {chromium}=require(process.env.PLAYWRIGHT_PATH || '/tmp/portfolio-shelf-qa/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});const context=await browser.newContext({viewport:{width:1000,height:700},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:3108/');await page.waitForSelector('.pshelf.webgl-ready',{timeout:120000});
 await page.evaluate(()=>{document.querySelectorAll('[data-shelf=markers] button')[1].click();window.__shelfQA.failNext=true;document.querySelector('[data-shelf=inspect]').click()});
 await page.waitForFunction(()=>document.querySelector('[data-shelf=live-region]').textContent.includes('Could not prepare'),null,{timeout:60000});
 assert.equal(await page.locator('[data-shelf=inspect]').getAttribute('aria-busy'),null);
 await page.locator('[data-shelf=inspect]').click();await page.waitForSelector('.pshelf.mode-detail:not(.is-opening)',{timeout:120000});
 await page.locator('[data-shelf=close-detail]').click();await page.waitForSelector('.pshelf:not(.mode-detail)',{timeout:60000});
 const before=await page.evaluate(()=>window.__shelfQA.uploads.length);
 await page.locator('[data-shelf=inspect]').click();await page.waitForSelector('.pshelf.mode-detail:not(.is-opening)',{timeout:60000});
 const after=await page.evaluate(()=>window.__shelfQA.uploads.length);assert.equal(after,before,'warm reopen uploaded textures');
 await page.evaluate(()=>window.cleanup());
 const snapshot=await page.evaluate(()=>({disposed:window.__shelfQA.disposed,uploads:window.__shelfQA.uploads}));
 const detail=snapshot.disposed.filter(t=>/interior-page|patterned-endpaper/.test(t.name));assert.ok(detail.length>=9,'expected page and endpaper disposal');assert.equal(detail.filter(t=>t.refs).length,0,'detail texture disposed while still attached');assert.deepEqual(errors,[]);
 console.log('PASS actual upload failure retry, warm reopen, cleanup; detail disposed',detail.length,'attached at dispose',detail.filter(t=>t.refs).length,'page errors',errors);
}finally{await context.close();await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
