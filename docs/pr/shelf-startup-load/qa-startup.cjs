/* QA probe for perf/shelf-startup-load. Usage: BASE=http://127.0.0.1:PORT PART=1|2|3|4|5|video node qa-startup.cjs
   Chromium on SwiftShader (software renderer): timings are diagnostic, not device performance. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/tmp/portfolio-shelf-qa/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE, PART = process.env.PART || '1', DIR = __dirname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LAST = 8;
const BOOK0_PLATE = 'material-enhancement-assistant', DEFERRED_PLATE = 'pickleball-booking-automation-playwright-github-actions';
const results = { part: PART, checks: [] };
const check = (name, pass, detail) => { results.checks.push({ name, pass: !!pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, detail === undefined ? '' : JSON.stringify(detail)); };

async function newPage(browser, { throttle, video, route } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, ...(video ? { recordVideo: { dir: video, size: { width: 1280, height: 800 } } } : {}) });
  const page = await context.newPage();
  page.setDefaultTimeout(180000);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const setThrottle = (down, latency) => cdp.send('Network.emulateNetworkConditions', { offline: false, latency, downloadThroughput: (down * 1e6) / 8, uploadThroughput: (down * 1e6) / 8 });
  if (throttle) await setThrottle(9, 170);
  const reqs = new Map(), errors = [], t0 = { v: 0 };
  cdp.on('Network.requestWillBeSent', (e) => reqs.set(e.requestId, { url: e.request.url, type: e.type, start: e.timestamp, end: null, bytes: 0, failed: false }));
  cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (r) { r.end = e.timestamp; r.bytes = e.encodedDataLength; } });
  cdp.on('Network.loadingFailed', (e) => { const r = reqs.get(e.requestId); if (r) { r.end = e.timestamp; r.failed = true; } });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 404|net::ERR_FAILED|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  if (route) await route(page);
  return { context, page, cdp, reqs, errors, setThrottle };
}
const imgs = (reqs) => [...reqs.values()].filter((r) => r.type === 'Image' || /\/projects\//.test(r.url));
const rel = (u) => u.replace(BASE, '');
const marker = (page, i) => page.locator('[data-shelf=markers] button').nth(i);
const click = (page, n) => page.locator(`[data-shelf="${n}"]`).click();
const detailOpen = (page) => page.waitForSelector('.pshelf.mode-detail:not(.is-opening)', { timeout: 180000 });
const waitHero = (page) => page.waitForFunction(() => !document.querySelector('[data-shelf=browse-ui]').inert && /returned to the shelf/.test(document.querySelector('[data-shelf=live-region]').textContent), null, { timeout: 180000 });
const counter = (page) => page.locator('[data-shelf=page-counter]').textContent();
const gotoSpread = async (page, n) => { for (let i = 0; i < 6; i++) { if ((await counter(page)).startsWith('0' + n)) return true; await click(page, 'next-page'); await sleep(2500); } return (await counter(page)).startsWith('0' + n); };
const settle = async (page, ms = 3500) => { await sleep(ms); };
const shot = (page, name, clip) => page.screenshot({ path: path.join(DIR, name), ...(clip ? { clip } : {}) });
async function goReady(h, label) {
  const t = Date.now();
  await h.page.goto(`${BASE}/`, { waitUntil: 'commit' });
  await h.page.waitForSelector('.pshelf.webgl-ready', { timeout: 240000 });
  return Date.now() - t;
}
async function stage(page) { await page.locator('.pshelf').scrollIntoViewIfNeeded(); }
async function openBook(page, i) { await marker(page, i).click(); await sleep(3500); await click(page, 'inspect'); await detailOpen(page); await sleep(1500); await click(page, 'toggle-book'); await sleep(2500); }

(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  try {
    if (PART === '1') {
      for (let run = 1; run <= 2; run++) {
        const h = await newPage(browser, { throttle: true });
        const readyMs = await goReady(h);
        await sleep(1500);
        const all = imgs(h.reqs); const done = all.filter((r) => r.end);
        const readyAbs = [...h.reqs.values()][0].start; // not used for cut; totals are "up to ready + 1.5 s"
        const png = done.filter((r) => /\/projects\/.*\.png/i.test(r.url));
        const total = done.reduce((s, r) => s + r.bytes, 0);
        const shelf = done.filter((r) => /\/projects\/shelf\//.test(r.url));
        const row = { run, readyMs, imageCount: all.length, finished: done.length, totalBytes: Math.round(total), shelfFiles: shelf.length, shelfBytes: Math.round(shelf.reduce((s, r) => s + r.bytes, 0)), projectsPngRequests: png.map((r) => rel(r.url)), pending: all.filter((r) => !r.end).map((r) => rel(r.url)), images: done.map((r) => ({ path: rel(r.url), bytes: Math.round(r.bytes) })).sort((a, b) => b.bytes - a.bytes) };
        (results.runs ||= []).push(row);
        console.log(JSON.stringify({ run, readyMs, imageCount: row.imageCount, totalBytes: row.totalBytes, shelfBytes: row.shelfBytes, png: png.length, pending: row.pending.length }));
        check(`part1 run${run}: no /projects/*.png requests`, png.length === 0, png.map((r) => rel(r.url)));
        await h.context.close();
      }
    }
    if (PART === '2') {
      const h = await newPage(browser, { throttle: true });
      const readyMs = await goReady(h); results.readyMs = readyMs;
      await stage(h.page);
      const shelfReqs = () => imgs(h.reqs).filter((r) => /\/projects\/shelf\//.test(r.url));
      const readyReqs = shelfReqs().length, readyDone = shelfReqs().filter((r) => r.end).length;
      results.atReady = { shelfRequested: readyReqs, shelfFinished: readyDone };
      // wait for deferred assets (throttled), then un-throttle
      const t = Date.now(); while (Date.now() - t < 120000 && shelfReqs().some((r) => !r.end)) await sleep(500);
      results.deferredLoadedMs = Date.now() - t; results.shelfFilesTotal = shelfReqs().length;
      check('part2: all shelf images requested and finished', shelfReqs().length >= 19 && shelfReqs().every((r) => r.end && !r.failed), { n: shelfReqs().length, pending: shelfReqs().filter((r) => !r.end).map((r) => rel(r.url)) });
      await h.setThrottle(-1 / 8 * 8 * 1, 0).catch(() => {}); await h.cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      await sleep(2000);
      for (let i = 0; i <= LAST; i++) {
        await marker(h.page, i).click(); await sleep(i === 0 ? 3000 : 6000);
        const title = await h.page.locator('[data-shelf=selection-title]').textContent();
        const box = await h.page.locator('[data-shelf=scene]').boundingBox();
        await shot(h.page, `qa-cover-${i + 1}.png`, { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, 1280), height: Math.min(box.height, 800) });
        (results.covers ||= []).push({ i: i + 1, title });
      }
      check('part2: no page errors', h.errors.length === 0, h.errors);
      await h.context.close();
    }
    if (PART === '3' || PART === '4') {
      const deferred = PART === '4';
      // Race part: hold the deferred book's plate request at the network layer until the book is open (release() continues it).
      let release = () => {}; const held = new Promise((r) => { release = r; });
      const h = await newPage(browser, { throttle: true, route: deferred ? (p) => p.route(`**/projects/shelf/plates/${DEFERRED_PLATE}.webp`, async (r) => { await held; await r.continue(); }) : undefined });
      const readyMs = await goReady(h); results.readyMs = readyMs; await stage(h.page);
      const plateUrl = (id) => imgs(h.reqs).find((r) => r.url.includes(`/plates/${id}.webp`));
      if (deferred) {
        // Race: open the last (deferred) book right after ready. Slow the network further so its plate cannot arrive first.
        const before = plateUrl(DEFERRED_PLATE);
        results.plateStateAtOpen = before ? { requested: true, finished: !!before.end } : { requested: false };
        await marker(h.page, LAST).click(); await sleep(2500);
        await click(h.page, 'inspect');
        await detailOpen(h.page); await click(h.page, 'toggle-book'); await sleep(2500);
        const p = plateUrl(DEFERRED_PLATE); results.plateStateAfterOpen = p ? { requested: true, finished: !!p.end } : { requested: false };
        check('part4: deferred book opened before its plate arrived (race window real)', !results.plateStateAfterOpen.finished, { atOpen: results.plateStateAtOpen, afterOpen: results.plateStateAfterOpen });
        await gotoSpread(h.page, 2); await settle(h.page); await shot(h.page, 'qa-race-before-arrival-spread2.png');
        release();
        const t = Date.now(); while (Date.now() - t < 120000 && !(plateUrl(DEFERRED_PLATE)?.end)) await sleep(500);
        await sleep(6000);
        results.plateStateAfterRelease = { finished: !!plateUrl(DEFERRED_PLATE)?.end };
        await shot(h.page, 'qa-race-after-arrival-spread2.png');
        await gotoSpread(h.page, 4); await settle(h.page, 4500); await shot(h.page, 'qa-race-after-arrival-spread4.png');
        results.plateArrivedMs = Date.now() - t;
      } else {
        await openBook(h.page, 0);
        for (const n of [2, 4]) { check(`part3: first book reached spread ${n}`, await gotoSpread(h.page, n), await counter(h.page)); await settle(h.page, 4500); await shot(h.page, `qa-plate-first-book-spread${n}.png`); }
        await click(h.page, 'close-detail'); await waitHero(h.page); await sleep(1500);
        await h.cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
        const t = Date.now(); while (Date.now() - t < 120000 && !(plateUrl(DEFERRED_PLATE)?.end)) await sleep(500);
        await openBook(h.page, LAST);
        for (const n of [2, 4]) { check(`part3: deferred book reached spread ${n}`, await gotoSpread(h.page, n), await counter(h.page)); await settle(h.page, 4500); await shot(h.page, `qa-plate-deferred-book-spread${n}.png`); }
      }
      check(`part${PART}: no page errors`, h.errors.length === 0, h.errors);
      await h.context.close();
    }
    if (PART === '5') {
      for (const [label, id, book] of [['visible', BOOK0_PLATE, 0], ['deferred', DEFERRED_PLATE, LAST]]) {
        const h = await newPage(browser, { route: (p) => p.route(`**/projects/shelf/plates/${id}.webp`, (r) => r.abort()) });
        let ready = false; try { await goReady(h); ready = true; } catch (e) { results[label + 'Error'] = e.message.split('\n')[0]; }
        check(`part5 ${label}: shelf reaches ready with plate blocked`, ready);
        if (ready) {
          await stage(h.page); await sleep(3000);
          try { await openBook(h.page, book); const okA = await gotoSpread(h.page, 2); await settle(h.page, 4500); await shot(h.page, `qa-missing-${label}-spread2.png`); await gotoSpread(h.page, 4); await settle(h.page, 4000); await shot(h.page, `qa-missing-${label}-spread4.png`); check(`part5 ${label}: book opens and pages turn`, okA); } catch (e) { check(`part5 ${label}: book opens and pages turn`, false, e.message.split('\n')[0]); }
        }
        check(`part5 ${label}: no page errors`, h.errors.length === 0, h.errors);
        await h.context.close();
      }
    }
    if (PART === 'video') {
      const vdir = path.join('/tmp/portfolio-shelf-qa/out', 'vid'); fs.rmSync(vdir, { recursive: true, force: true });
      const h = await newPage(browser, { throttle: true, video: vdir });
      const readyMs = await goReady(h); results.readyMs = readyMs; await stage(h.page); await sleep(3000);
      await click(h.page, 'inspect'); await detailOpen(h.page); await sleep(2000);
      await click(h.page, 'toggle-book'); await sleep(3000); await click(h.page, 'next-page'); await sleep(3000);
      const vp = h.page.video(); await h.context.close(); fs.copyFileSync(await vp.path(), path.join(DIR, 'load.webm'));
    }
  } catch (e) { check('FATAL ' + e.message.split('\n')[0], false); }
  fs.writeFileSync(path.join(DIR, `qa-part${PART}.json`), JSON.stringify(results, null, 2));
  console.log(`SUMMARY part=${PART} pass=${results.checks.filter((c) => c.pass).length} fail=${results.checks.filter((c) => !c.pass).length}`);
  await browser.close();
})();
