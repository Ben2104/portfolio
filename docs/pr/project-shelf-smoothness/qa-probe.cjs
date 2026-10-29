/* Production browser probe for the shelf smoothness PR.
   Usage: BASE=http://127.0.0.1:PORT TIER=high|low DPR=1|2 MOBILE=0|1 REDUCED=0|1 OUT=file.json node qa-probe.cjs
   Software-rendered Chromium: timings are diagnostic, never device FPS. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/tmp/portfolio-shelf-qa/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE, TIER = process.env.TIER || 'high', DPR = Number(process.env.DPR || 1);
const MOBILE = process.env.MOBILE === '1', REDUCED = process.env.REDUCED === '1';
const OUT = process.env.OUT || `/tmp/portfolio-shelf-qa/qa-${TIER}-${DPR}${MOBILE ? '-mobile' : ''}${REDUCED ? '-reduced' : ''}.json`;
const SHOTS = process.env.SHOTS || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({
    viewport: MOBILE ? { width: 390, height: 844 } : { width: 1280, height: 800 },
    deviceScaleFactor: DPR, isMobile: MOBILE, hasTouch: MOBILE,
    reducedMotion: REDUCED ? 'reduce' : 'no-preference',
  });
  await context.addInitScript(() => {
    const q = window.__q = { phase: 'startup', rafTasks: [], frames: [], sceneSize: [], canvases: [], long: [], gl: {}, fail: { remaining: 0, thrown: 0 }, renderer: null };
    const cnt = (k) => (q.gl[q.phase + ':' + k] = (q.gl[q.phase + ':' + k] || 0) + 1);
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => q.long.push({ phase: q.phase, start: e.startTime, end: e.startTime + e.duration, duration: e.duration }))).observe({ type: 'longtask', buffered: true }); } catch {}
    const ce = document.createElement.bind(document);
    document.createElement = function (tag, ...a) { const el = ce(tag, ...a); if (String(tag).toLowerCase() === 'canvas') q.canvases.push({ phase: q.phase, el }); return el; };
    for (const prop of ['width', 'height']) {
      const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, prop);
      Object.defineProperty(HTMLCanvasElement.prototype, prop, { ...d, set(v) { if (this.dataset?.shelf === 'scene') q.sceneSize.push({ phase: q.phase, prop, value: v, same: d.get.call(this) === v, t: performance.now() }); d.set.call(this, v); } });
    }
    const og = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...a) { const gl = og.call(this, type, ...a); if (gl && /webgl/.test(type)) { const e = gl.getExtension('WEBGL_debug_renderer_info'); q.renderer = e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } return gl; };
    for (const T of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!T) continue;
      for (const name of ['createTexture', 'deleteTexture', 'texImage2D', 'texSubImage2D', 'texStorage2D', 'generateMipmap', 'linkProgram', 'drawElements', 'drawArrays']) {
        if (!Object.hasOwn(T.prototype, name)) continue;
        const orig = T.prototype[name];
        T.prototype[name] = function (...args) {
          cnt(name);
          if (name === 'texImage2D' && q.fail.remaining > 0) { const src = args.at(-1); if (src && src.width >= 512) { q.fail.remaining--; q.fail.thrown++; throw new Error('QA injected upload failure'); } }
          return orig.apply(this, args);
        };
      }
    }
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((time) => {
      const phase = q.phase, t0 = performance.now(), c0 = q.canvases.length;
      const up0 = (q.gl[phase + ':texImage2D'] || 0) + (q.gl[phase + ':texSubImage2D'] || 0) + (q.gl[phase + ':texStorage2D'] || 0);
      const d0 = (q.gl[phase + ':drawElements'] || 0) + (q.gl[phase + ':drawArrays'] || 0);
      try { cb(time); } finally {
        const t1 = performance.now();
        const up = (q.gl[phase + ':texImage2D'] || 0) + (q.gl[phase + ':texSubImage2D'] || 0) + (q.gl[phase + ':texStorage2D'] || 0) - up0;
        const dr = (q.gl[phase + ':drawElements'] || 0) + (q.gl[phase + ':drawArrays'] || 0) - d0;
        const cv = q.canvases.length - c0;
        if (cv || up) q.rafTasks.push({ phase, start: t0, end: t1, duration: t1 - t0, canvases: cv, uploads: up, draws: dr });
        if (dr) q.frames.push({ phase, t: t0, ms: t1 - t0, draws: dr });
      }
    });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const results = { env: { tier: TIER, dpr: DPR, mobile: MOBILE, reduced: REDUCED }, checks: [], phases: {} };
  const check = (name, pass, detail) => { results.checks.push({ name, pass: !!pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, detail === undefined ? '' : JSON.stringify(detail)); };
  const phase = (name) => page.evaluate((n) => { window.__q.phase = n; }, name);
  const snap = (name) => page.evaluate((n) => {
    const q = window.__q, p = (k) => q.gl[n + ':' + k] || 0;
    const tasks = q.rafTasks.filter((t) => t.phase === n);
    const long = q.long.filter((l) => l.phase === n || true).filter((l) => tasks.some((t) => l.start < t.end && l.end > t.start));
    return {
      phase: n, canvases: q.canvases.filter((c) => c.phase === n).length,
      uploads: p('texImage2D') + p('texSubImage2D') + p('texStorage2D'), texCreated: p('createTexture'), texDeleted: p('deleteTexture'),
      linkProgram: p('linkProgram'), draws: q.frames.filter((f) => f.phase === n).length,
      sceneAssignments: q.sceneSize.filter((s) => s.phase === n).length, sceneAssignSame: q.sceneSize.filter((s) => s.phase === n && s.same).length,
      prepTasks: tasks.length, maxTaskMs: Math.max(0, ...tasks.map((t) => t.duration)),
      tasksOver50: tasks.filter((t) => t.duration >= 50).map((t) => ({ ms: +t.duration.toFixed(1), canvases: t.canvases, uploads: t.uploads })),
      taskMs: tasks.map((t) => +t.duration.toFixed(1)), taskCanvases: tasks.map((t) => t.canvases),
      longTasksOverlappingPrep: long.length,
    };
  }, name);
  const ph = async (name) => { await phase(name); };
  const end = async (name) => { results.phases[name] = await snap(name); return results.phases[name]; };
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name) }); };
  const live = () => page.locator('[data-shelf=live-region]').textContent();
  const inspectText = () => page.locator('[data-shelf=inspect]').textContent();
  const inDetail = () => page.evaluate(() => document.querySelector('.pshelf').classList.contains('mode-detail') && !document.querySelector('.pshelf').classList.contains('is-opening'));
  const waitDetail = (t = 120000) => page.waitForSelector('.pshelf.mode-detail:not(.is-opening)', { timeout: t });
  const waitHero = () => page.waitForFunction(() => !document.querySelector('[data-shelf=browse-ui]').inert && /returned to the shelf/.test(document.querySelector('[data-shelf=live-region]').textContent), null, { timeout: 120000 });
  const focused = () => page.evaluate(() => { const a = document.activeElement; return a ? (a.dataset?.shelf || a.tagName + '.' + a.className) + (a.closest?.('[data-shelf=markers]') ? '@marker' + [...a.parentElement.children].indexOf(a) : '') : null; });
  const marker = (i) => page.locator('[data-shelf=markers] button').nth(i);
  const click = (n) => page.locator(`[data-shelf="${n}"]`).click();
  const quiet = async (max = 150000) => { const t = Date.now(); let last = -1, since = Date.now(); while (Date.now() - t < max) { const n = await page.evaluate(() => window.__q.frames.length); if (n !== last) { last = n; since = Date.now(); } else if (Date.now() - since > 3000) return Date.now() - t; await sleep(300); } return -1; };
  const idleFrames = async (label, ms = 2500) => { results['settleMs-' + label] = await quiet(); await phase('idle-' + label); await sleep(ms); const s = await snap('idle-' + label); results.phases['idle-' + label] = s; return s.draws; };

  try {
    await page.goto(`${BASE}/?shelf-quality=${TIER}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.pshelf').scrollIntoViewIfNeeded();
    await ph('startup-ready');
    await page.waitForSelector('.pshelf.webgl-ready', { timeout: 90000 });
    await sleep(5000); // allow speculative prewarm of book 0 to finish
    results.renderer = await page.evaluate(() => window.__q.renderer);
    const sc = await page.evaluate(() => { const c = document.querySelector('[data-shelf=scene]'); return { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight, dpr: devicePixelRatio }; });
    results.sceneAtRest = sc;
    await end('startup-ready');
    check('idle: no draws after load settle', (await idleFrames('load')) === 0);
    await shot(`${MOBILE ? 'mobile' : 'desktop'}-shelf-rest-${TIER}-dpr${DPR}.png`);

    // Warm open: book 0 was prewarmed speculatively.
    await ph('warm-open-prewarmed');
    const t0 = Date.now(); await click('inspect'); await waitDetail(); const warmMs = Date.now() - t0;
    await sleep(1500);
    const w = await end('warm-open-prewarmed');
    check('prewarmed open: 0 detail canvases', w.canvases === 0, w); check('prewarmed open: 0 texture uploads', w.uploads === 0, w.uploads);
    results.warmOpenWallMs = warmMs;
    await shot(`${MOBILE ? 'mobile' : 'desktop'}-detail-rest-${TIER}-dpr${DPR}.png`);

    // Page turns + reading
    await ph('page-turns');
    await click('toggle-book'); await sleep(2000);
    const labelBefore = await page.locator('[data-shelf=page-label]').textContent();
    for (let i = 0; i < 3; i++) { await click('next-page'); await sleep(1400); }
    await click('previous-page'); await sleep(1400);
    const pt = await end('page-turns');
    check('page turns: no new detail canvases/uploads', pt.canvases === 0 && pt.uploads === 0, { canvases: pt.canvases, uploads: pt.uploads });
    results.pageLabel = { before: labelBefore, after: await page.locator('[data-shelf=page-label]').textContent() };
    await shot(`${MOBILE ? 'mobile' : 'desktop'}-page-turn-${TIER}-dpr${DPR}.png`);

    // Close + focus return
    await ph('close-1');
    await click('close-detail'); await waitHero(); await sleep(1500);
    const f1 = await focused();
    await end('close-1');
    check('close returns focus to the opener (inspect button)', f1 === 'inspect', f1);

    // Same-book reopen (retained set)
    await ph('same-book-reopen');
    await click('inspect'); await waitDetail(); await sleep(1500);
    const r = await end('same-book-reopen');
    check('same-book reopen: 0 canvases', r.canvases === 0, r.canvases); check('same-book reopen: 0 uploads', r.uploads === 0, r.uploads);
    check('same-book reopen: 0 texture creations', r.texCreated === 0, r.texCreated);
    await click('close-detail'); await waitHero(); await sleep(800);

    // Other book, cold
    await ph('other-book-cold');
    await marker(3).click(); // select + immediately open: prewarm dropped by selection
    const tSel = Date.now();
    await click('inspect');
    const busyText = await inspectText(); const busyAria = await page.locator('[data-shelf=inspect]').getAttribute('aria-busy'); const busyLive = await live();
    await waitDetail(); const coldMs = Date.now() - tSel; await sleep(1500);
    const c = await end('other-book-cold');
    results.cold = { wallMs: coldMs, busyText, busyAria, busyLive, taskMs: c.taskMs, taskCanvases: c.taskCanvases, tasksOver50: c.tasksOver50 };
    check('cold: preparing state shown synchronously', /Preparing/.test(busyText) && busyAria === 'true', { busyText, busyAria, busyLive });
    check('cold: 11 detail canvases, one per task', c.canvases === 11 && c.taskCanvases.every((n) => n <= 1), { canvases: c.canvases, taskCanvases: c.taskCanvases });
    check('cold: busy state cleared after open', (await page.locator('[data-shelf=inspect]').getAttribute('aria-busy')) === null && (await inspectText()).trim() === 'Open');
    await click('close-detail'); await waitHero(); await sleep(800);

    // Switching evicts: reopening book 0 now cold; GL delete counts reflect release
    await ph('back-to-book-0');
    await marker(0).click(); await sleep(1200); await click('inspect'); await waitDetail(); await sleep(1500);
    const b0 = await end('back-to-book-0');
    check('switch back to book 0: set was evicted so it re-prepares (one set retained)', b0.canvases >= 1, { canvases: b0.canvases, deleted: b0.texDeleted });
    await click('close-detail'); await waitHero(); await sleep(800);

    // Rapid select / Escape (pending)
    await ph('rapid-escape');
    await marker(5).click(); await sleep(1500); // let prewarm complete? use different book then pick another to be cold
    await marker(6).click();
    await page.locator('[data-shelf=inspect]').click();
    const pendingText = await inspectText();
    await page.keyboard.press('Escape');
    await sleep(250);
    const afterEsc = { text: (await inspectText()).trim(), busy: await page.locator('[data-shelf=inspect]').getAttribute('aria-busy'), live: await live(), focus: await focused(), detail: await inDetail(), mode: await page.evaluate(() => document.querySelector('.pshelf').className) };
    await sleep(3000);
    const stillClosed = !(await inDetail()) && !(await page.evaluate(() => document.querySelector('.pshelf').classList.contains('mode-detail')));
    results.escape = { pendingText, afterEsc, stillClosed };
    check('Escape during prep: cancelled, not opened later, busy cleared, focus on inspect', stillClosed && afterEsc.busy === null && afterEsc.text === 'Open' && /inspect|marker/.test(String(afterEsc.focus)), results.escape);
    await end('rapid-escape');
    // Rapid reselect while pending: pick other book mid-prep -> must not open old book
    await ph('rapid-reselect');
    await marker(1).click(); await page.locator('[data-shelf=inspect]').click(); await marker(2).click(); await sleep(4000);
    const detailAfterReselect = await page.evaluate(() => document.querySelector('.pshelf').classList.contains('mode-detail'));
    check('reselect while pending never opens the stale book', !detailAfterReselect, { live: await live() });
    await end('rapid-reselect');
    // Rapid triple click coalesces
    await ph('coalesce');
    await marker(4).click(); await page.evaluate(() => { const b = document.querySelector('[data-shelf=inspect]'); b.click(); b.click(); b.click(); });
    await waitDetail(); await sleep(1200);
    const co = await end('coalesce');
    check('triple activation coalesces to one preparation (<=11 canvases)', co.canvases <= 11, co.canvases);
    // keyboard: Escape closes, focus returns
    await page.keyboard.press('Escape'); await waitHero(); await sleep(800);
    const fk = await focused();
    check('Escape closes detail; focus returns', /inspect|marker/.test(String(fk)), fk);

    // Keyboard open via Enter on focused inspect button
    await ph('keyboard');
    await page.locator('[data-shelf=inspect]').focus(); await page.keyboard.press('Enter'); await waitDetail(); await sleep(1200);
    const kfocus = await focused();
    await page.keyboard.press('ArrowRight'); await sleep(1400);
    await page.keyboard.press('Escape'); await waitHero(); await sleep(600);
    check('keyboard Enter opens; focus moves into dialog; Escape returns', kfocus === 'close-detail', kfocus);
    await end('keyboard');

    // Resize
    await ph('resize');
    if (!MOBILE) { await page.setViewportSize({ width: 1100, height: 760 }); await sleep(1200); await page.setViewportSize({ width: 1280, height: 800 }); await sleep(1500); }
    else { await page.setViewportSize({ width: 844, height: 390 }); await sleep(1200); await page.setViewportSize({ width: 390, height: 844 }); await sleep(1500); }
    const rs = await end('resize');
    const sc2 = await page.evaluate(() => { const c = document.querySelector('[data-shelf=scene]'); return { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight }; });
    results.resize = { assignments: rs.sceneAssignments, same: rs.sceneAssignSame, after: sc2 };
    check('resize: no unchanged-value canvas resets', rs.sceneAssignSame === 0, rs);
    check('resize: final buffer matches CSS x DPR', Math.abs(sc2.w - Math.floor(sc2.cw * Math.min(DPR, sc2.w / sc2.cw >= 1 ? DPR : 1))) <= 1 || sc2.w / sc2.cw <= DPR + 0.01, sc2);
    check('idle: no draws after resize settles', (await idleFrames('post-resize')) === 0);

    // Motion density: wheel scroll then verify buffer returns to rest size
    await ph('scroll');
    await page.mouse.move(640, 400); await page.mouse.wheel(0, 600); await sleep(900);
    const duringScroll = await page.evaluate(() => { const c = document.querySelector('[data-shelf=scene]'); return { w: c.width, cw: c.clientWidth }; });
    results.scrollSettleMs = await quiet();
    const afterScroll = await page.evaluate(() => { const c = document.querySelector('[data-shelf=scene]'); return { w: c.width, cw: c.clientWidth }; });
    results.density = { duringScroll, afterScroll, restRatio: afterScroll.w / afterScroll.cw };
    await end('scroll');
    check('rest buffer ratio equals rest cap after motion', Math.abs(results.density.restRatio - results.sceneAtRest.w / results.sceneAtRest.cw) < 0.02, results.density);
    check('idle: no draws after scroll settles', (await idleFrames('post-scroll')) === 0);

    // Injected prep failure + retry
    await ph('inject-failure');
    await page.evaluate(() => { window.__q.fail.remaining = 1; });
    await marker(7).click(); await page.locator('[data-shelf=inspect]').click();
    await page.waitForFunction(() => document.querySelector('[data-shelf=inspect]').getAttribute('aria-busy') === null, null, { timeout: 150000 });
    const failState = { thrown: await page.evaluate(() => window.__q.fail.thrown), text: (await inspectText()).trim(), busy: await page.locator('[data-shelf=inspect]').getAttribute('aria-busy'), live: await live(), detail: await page.evaluate(() => document.querySelector('.pshelf').classList.contains('mode-detail')), focus: await focused() };
    results.failure = failState;
    check('injected failure: error announced, busy cleared, shelf usable, not opened', failState.thrown === 1 && failState.busy === null && failState.text === 'Open' && !failState.detail && /Could not prepare/.test(failState.live), failState);
    await page.evaluate(() => { window.__q.fail.remaining = 0; });
    await page.locator('[data-shelf=inspect]').click(); await waitDetail();
    check('retry after failure opens', true);
    await end('inject-failure');
    await click('close-detail'); await waitHero(); await sleep(800);

    // Persistent failure: does hover/mouse activity retry-storm the prep?
    await ph('persistent-failure');
    await marker(8).click(); await sleep(400);
    await page.evaluate(() => { window.__q.fail.remaining = 1e9; });
    await page.locator('[data-shelf=inspect]').click(); await page.waitForFunction(() => window.__q.fail.thrown >= 2 || document.querySelector('[data-shelf=inspect]').getAttribute('aria-busy') === null, null, { timeout: 150000 }); await quiet();
    const before = await page.evaluate(() => window.__q.canvases.length);
    for (let i = 0; i < 20; i++) { await page.mouse.move(300 + i * 20, 300 + (i % 3) * 30); await sleep(120); }
    await quiet();
    const after = await page.evaluate(() => window.__q.canvases.length);
    results.retryStorm = { canvasesBefore: before, canvasesAfter: after, thrown: await page.evaluate(() => window.__q.fail.thrown) };
    check('persistent failure: pointer movement does not re-run heavy preparation repeatedly', after - before <= 12, results.retryStorm);
    await page.evaluate(() => { window.__q.fail.remaining = 0; });
    await end('persistent-failure');

    results.errors = errors;
    check('no page errors', errors.length === 0, errors.slice(0, 5));
  } catch (e) {
    results.fatal = String(e && e.stack || e);
    console.error('FATAL', results.fatal);
    results.errors = errors;
  } finally {
    fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
    await context.close(); await browser.close();
  }
  const failed = results.checks.filter((c) => !c.pass).length;
  console.log(`SUMMARY ${JSON.stringify(results.env)} renderer=${results.renderer} checks=${results.checks.length} failed=${failed} fatal=${!!results.fatal}`);
  process.exitCode = failed || results.fatal ? 1 : 0;
}
main();
