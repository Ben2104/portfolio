/* Run: PLAYWRIGHT_PATH=/tmp/portfolio-shelf-qa/node_modules/playwright node docs/pr/projects-shelf-clarity/browser-qa.cjs [base-url] */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/tmp/portfolio-shelf-qa/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const out = __dirname;
const base = process.argv[2] || 'http://localhost:3107';
const shelf = '[data-shelf="';
const get = (name) => `${shelf}${name}"]`;

async function run(name, options, missing = false) {
  const browser = await chromium.launch({headless: true, args: ['--enable-unsafe-swiftshader']});
  const context = await browser.newContext({ ...options, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    window.__shelfGL = { draws: 0, liveTextures: 0, peakTextures: 0 };
    for (const type of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!type) continue;
      const proto = type.prototype;
      for (const method of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
        if (!Object.hasOwn(proto, method)) continue;
        const original = proto[method];
        proto[method] = function(...args) { window.__shelfGL.draws++; return original.apply(this, args); };
      }
      if (!Object.hasOwn(proto, 'createTexture')) continue;
      const create = proto.createTexture, remove = proto.deleteTexture, live = new WeakSet();
      proto.createTexture = function(...args) { const texture = create.apply(this, args); if (texture) { live.add(texture); window.__shelfGL.liveTextures++; window.__shelfGL.peakTextures = Math.max(window.__shelfGL.peakTextures, window.__shelfGL.liveTextures); } return texture; };
      proto.deleteTexture = function(texture) { if (texture && live.has(texture)) { live.delete(texture); window.__shelfGL.liveTextures--; } return remove.call(this, texture); };
    }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90000);
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important }' }).catch(() => {});
  const exceptions = [], errors = [];
  page.on('pageerror', error => exceptions.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  if (missing) await page.route('**/projects/**', route => route.abort());
  try {
    await page.goto(`${base}/?shelf-quality=${name === 'desktop' ? 'high' : 'low'}`, {waitUntil: 'domcontentloaded'});
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important }' });
    await page.locator('.pshelf').scrollIntoViewIfNeeded();
    await page.waitForSelector('.pshelf.webgl-ready', {timeout: 120000});
    assert.equal(await page.locator('.static-fallback').isVisible(), false, 'WebGL fallback visible');
    assert.equal(await page.locator(`${get('markers')} button`).count(), 9);
    await page.waitForTimeout(1500);
    await page.screenshot({path: path.join(out, `${name}-shelf.png`)});
    await page.waitForTimeout(2500);
    const drawsBefore = await page.evaluate(() => window.__shelfGL.draws);
    await page.waitForTimeout(1200);
    const drawsAfter = await page.evaluate(() => window.__shelfGL.draws);
    assert.equal(drawsAfter, drawsBefore, 'rendering continues while idle');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(selector => document.querySelector(selector)?.textContent?.trim().startsWith('02'), get('counter'));
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(selector => document.querySelector(selector)?.textContent?.trim().startsWith('01'), get('counter'));
    if (options.hasTouch) {
      const start = await page.evaluate(() => scrollY);
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: 350, y: 700}]});
      for (const y of [650, 600, 550, 500, 450, 400]) await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: 350, y}]});
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
      await cdp.detach();
      await page.waitForTimeout(500);
      assert.notEqual(await page.evaluate(() => scrollY), start, 'mobile scrolling did not move page');
    }
    const textureCounts = [];
    for (let i = 0; i < (missing ? 1 : 9); i++) {
      await page.locator(`${get('markers')} button`).nth(i).evaluate(button => button.click());
      console.log(`${name}: project ${i + 1}`);
      await page.waitForFunction(([selector, expected]) => document.querySelector(selector)?.textContent?.trim().startsWith(expected), [get('counter'), String(i + 1).padStart(2, '0')]);
      const title = await page.locator(get('selection-title')).textContent();
      await page.locator(get('inspect')).click();
      await page.waitForSelector('.pshelf.mode-detail:not(.is-opening)', {timeout: 30000});
      assert.equal((await page.locator(get('detail-title')).textContent()).trim(), title.trim());
      await page.locator(get('toggle-book')).click();
      await page.waitForFunction(selector => document.querySelector(selector)?.textContent !== 'Closed', get('page-label'));
      if (i === 0) {
        await page.locator(get('next-page')).click();
        await page.waitForTimeout(600);
        const next = await page.locator(get('page-counter')).textContent();
        await page.locator(get('previous-page')).click();
        await page.waitForTimeout(600);
        assert.notEqual(await page.locator(get('page-counter')).textContent(), next, 'page did not turn back');
        await page.locator(get('reset-view')).click();
        await page.waitForTimeout(500);
        await page.screenshot({path: path.join(out, `${name}-detail.png`)});
      }
      await page.locator(get('close-detail')).click();
      await page.waitForSelector('.pshelf:not(.mode-detail)', {timeout: 30000});
      await page.waitForTimeout(700);
      textureCounts.push(await page.evaluate(() => window.__shelfGL.liveTextures));
    }
    const density = await page.locator(get('scene')).evaluate(canvas => ({width: canvas.width, cssWidth: canvas.clientWidth, ratio: canvas.width / canvas.clientWidth}));
    console.log(`${name} WebGL counters: ${JSON.stringify(await page.evaluate(() => window.__shelfGL))}; after each book: ${JSON.stringify(textureCounts)}; settled density: ${JSON.stringify(density)}`);
    assert.deepEqual(exceptions, [], `Page exceptions: ${exceptions.join('; ')}`);
    const knownHydration = errors.filter(message => message.startsWith('A tree hydrated but some attributes') && message.includes('<Navbar>') && message.includes('<TimelineEntryCard') && message.includes('translateY(16px)')) ;
    if (knownHydration.length) console.log(`${name}: pre-existing reduced-motion hydration warning: ${knownHydration.length}`);
    const unexpected = errors.filter(message => !knownHydration.includes(message) && !(missing && /Failed to load resource: net::ERR_FAILED/.test(message)));
    assert.deepEqual(unexpected, [], `Unexpected browser errors: ${unexpected.join('; ')}`);
    console.log(`PASS ${name}: WebGL ready, ${missing ? "one book" : "nine books"}, detail, pages, reset; errors: ${JSON.stringify(errors)}`);
  } finally { await context.close(); await browser.close(); }
}
(async () => {
  if (!process.env.QA_MODE || process.env.QA_MODE === 'desktop') await run('desktop', {viewport: {width: 1440, height: 900}, deviceScaleFactor: 2});
  if (!process.env.QA_MODE || process.env.QA_MODE === 'mobile') await run('mobile', {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  if (!process.env.QA_MODE || process.env.QA_MODE === 'missing') await run('missing', {viewport: {width: 1440, height: 900}}, true);
})().catch(error => { console.error(error); process.exitCode = 1; });
