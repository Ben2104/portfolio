/* Production browser probe for the shelf smoothness PR.
   Retest of ticket 01 (R1/R2/R3 + regression). Usage: BASE=http://127.0.0.1:PORT TIER=high|low DPR=1|2 MOBILE=0|1 REDUCED=0|1 OUT=file.json node qa-probe.cjs
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
    const q = window.__q = { phase: 'startup', rafTasks: [], frames: [], sceneSize: [], canvases: [], long: [], gl: {}, fail: { on: false, thrown: 0 }, renderer: null };
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
          /* three's WebGLState swallows texImage2D/texSubImage2D/texStorage2D errors, and a createTexture throw also breaks the main render. generateMipmap is unwrapped and only called while uploading a detail canvas at rest, so it fails renderer.initTexture without touching the render loop. */ if (name === 'generateMipmap' && q.fail.on) { q.fail.thrown++; throw new Error('QA injected upload failure'); }
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
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push('console: ' + m.text()); }); // 404 = /_vercel/insights/script.js, absent off-Vercel
  const results = { env: { tier: TIER, dpr: DPR, retest: 'ticket-01' }, checks: [], phases: {} };
  const check = (name, pass, detail) => { results.checks.push({ name, pass: !!pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, detail === undefined ? '' : JSON.stringify(detail)); };
  const Q = (f) => page.evaluate(f);
  const canv = () => Q(() => window.__q.canvases.length);
  const draws = () => Q(() => window.__q.frames.length);
  const thrown = () => Q(() => window.__q.fail.thrown);
  const setFail = (on) => page.evaluate((v) => { window.__q.fail.on = v; }, on);
  const live = () => page.locator('[data-shelf=live-region]').textContent();
  const inspectText = async () => (await page.locator('[data-shelf=inspect]').textContent()).trim();
  const busy = () => page.locator('[data-shelf=inspect]').getAttribute('aria-busy');
  const modeDetail = () => Q(() => document.querySelector('.pshelf').classList.contains('mode-detail'));
  const waitDetail = (t = 120000) => page.waitForSelector('.pshelf.mode-detail:not(.is-opening)', { timeout: t });
  const waitHero = () => page.waitForFunction(() => !document.querySelector('[data-shelf=browse-ui]').inert && /returned to the shelf/.test(document.querySelector('[data-shelf=live-region]').textContent), null, { timeout: 120000 });
  const marker = (i) => page.locator('[data-shelf=markers] button').nth(i);
  const click = (n) => page.locator(`[data-shelf="${n}"]`).click();
  const quiet = async (max = 150000) => { const t = Date.now(); let last = -1, since = Date.now(); while (Date.now() - t < max) { const n = await draws(); if (n !== last) { last = n; since = Date.now(); } else if (Date.now() - since > 3000) return Date.now() - t; await sleep(300); } return -1; };
  // Drive N rendered frames by moving the mouse over the scene / nudging viewport; returns frames actually drawn.
  const drive = async (n, maxMs = 120000) => {
    const f0 = await draws(), t = Date.now(); let i = 0;
    const box = await page.locator('[data-shelf=scene]').boundingBox();
    while ((await draws()) - f0 < n && Date.now() - t < maxMs) {
      i++;
      if (i % 6 === 0) await page.setViewportSize({ width: 1280 + (i % 12 ? 0 : 8), height: 800 + ((i / 6) % 2 ? 6 : 0) });
      await page.mouse.move(box.x + 100 + (i * 37) % 700, box.y + 100 + (i * 23) % 300);
      await sleep(250);
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    return (await draws()) - f0;
  };
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name) }); };
  try {
    await page.goto(`${BASE}/?shelf-quality=${TIER}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.pshelf').scrollIntoViewIfNeeded();
    await page.waitForSelector('.pshelf.webgl-ready', { timeout: 90000 });
    await sleep(5000); await quiet();
    results.renderer = await Q(() => window.__q.renderer);
    await shot(`desktop-shelf-rest-${TIER}-dpr${DPR}.png`);

    if (!process.env.SKIP_R13) {
    // ---- R1: persistent upload failure
    await setFail(true);
    const c0 = await canv();
    await marker(3).click();               // selection change -> settled speculative prewarm of book 3 will throw
    await quiet(); await sleep(1500);
    const cAfterSettle = await canv(); const th1 = await thrown();
    const fr = await drive(20);
    const cAfterDrive = await canv(); const th2 = await thrown();
    results.r1 = { c0, cAfterSettle, cAfterDrive, thrownAfterSettle: th1, thrownAfterDrive: th2, framesDriven: fr };
    check('R1: prewarm throws at least once (injection active)', th1 >= 1, results.r1);
    check('R1: ~20 hover/resize frames after settle create 0 new canvases (no per-frame retry)', cAfterDrive === cAfterSettle && th2 === th1, results.r1);
    check('R1: settled prewarm total bounded (<=2 canvases)', cAfterSettle - c0 <= 2, results.r1);
    // user Open: one attempt per click, announces failure
    const cA = await canv(); const tA = await thrown();
    await click('inspect'); await sleep(8000); await quiet();
    const cB = await canv(); const tB = await thrown();
    const o1 = { text: await inspectText(), busy: await busy(), live: (await live()).trim(), detail: await modeDetail(), canvases: cB - cA, throws: tB - tA };
    check('R1: Open click attempts once (<=2 canvases), clears Preparing, announces failure, not opened', o1.canvases >= 1 && o1.canvases <= 2 && o1.busy === null && o1.text === 'Open' && !o1.detail && /could not|couldn.t|fail|try again/i.test(o1.live), o1);
    const fr2 = await drive(20); const cC = await canv();
    check('R1: 20 frames after failed Open create 0 new canvases', cC === cB, { before: cB, after: cC, frames: fr2 });
    await click('inspect'); await sleep(8000); await quiet();
    const cD = await canv();
    check('R1: second Open click retries exactly once more (<=2 canvases)', cD - cC >= 1 && cD - cC <= 2, { canvases: cD - cC });
    results.r1.open1 = o1;
    // shelf still usable
    await marker(1).click(); await sleep(1500); await quiet();
    const selLabel = await page.locator('[data-shelf=markers] button[aria-current],[data-shelf=markers] button[aria-pressed=true]').count();
    check('R1: shelf usable after failures (marker click works, no page errors)', errors.length === 0, { errors, selLabel });
    // recovery: remove fault, Open succeeds
    await setFail(false);
    await click('inspect'); await waitDetail(); await sleep(1500);
    check('R1: with fault removed Open succeeds (retry usable)', await modeDetail());
    await click('close-detail'); await waitHero(); await sleep(800); await quiet();

    // ---- R3: Escape during Preparing, then 20 frames
    await marker(5).click(); await sleep(300);
    await click('inspect');
    const prepText = await inspectText();
    await page.keyboard.press('Escape'); await sleep(400);
    const cEsc = await canv();
    const frE = await drive(20); const cEsc2 = await canv();
    results.r3 = { prepText, cEsc, cEsc2, framesDriven: frE, text: await inspectText(), busy: await busy(), detail: await modeDetail() };
    check('R3: Preparing was entered', /Preparing/.test(prepText), prepText);
    check('R3: after Escape, 20 frames start no new prep (0 new canvases for that book)', cEsc2 === cEsc, results.r3);
    check('R3: not opened, busy cleared', !results.r3.detail && results.r3.busy === null && results.r3.text === 'Open', results.r3);
    // sanity: selection change then re-enables prewarm
    await marker(6).click(); await quiet(); await sleep(1500);
    const cSel = await canv();
    check('R3 sanity: prewarm resumes after selection changes', cSel > cEsc2, { before: cEsc2, after: cSel });

    }

    // ---- R2: scroll selection away before ready
    await marker(6).click(); await sleep(7000); await quiet();
    const y6 = await Q(() => Math.round(scrollY));
    await marker(2).click(); await sleep(1500);
    // Open, then page-scroll the selection to book 6 in the same task, before prep can finish
    await page.evaluate((y) => { document.querySelector('[data-shelf=inspect]').click(); window.scrollTo(0, y); }, y6);
    const p2 = await inspectText();
    await sleep(12000); await quiet();
    const r2a = { prep: p2, y6, selected: await page.locator('[data-shelf=selection-title]').textContent(), detail: await modeDetail(), busy: await busy(), text: await inspectText(), live: (await live()).trim() };
    check('R2 (page scroll to another book): Preparing entered, no stale open, Preparing cleared', /Preparing/.test(p2) && !r2a.detail && r2a.busy === null && r2a.text === 'Open', r2a);
    await marker(4).click(); await sleep(300);
    await click('inspect');
    await marker(7).click();
    await sleep(12000); await quiet();
    const r2b = { detail: await modeDetail(), busy: await busy(), text: await inspectText(), live: (await live()).trim() };
    check('R2 (marker reselect): no stale open and Preparing cleared', !r2b.detail && r2b.busy === null && r2b.text === 'Open', r2b);
    results.r2 = { a: r2a, b: r2b };

    // ---- regression: warm reopen + idle draw-stop (select book, wait prewarm, open twice)
    await marker(0).click(); await quiet(); await sleep(6000); await quiet();
    await Q(() => { window.__q.phase = 'warm'; });
    await click('inspect'); await waitDetail(); await sleep(1500);
    const s1 = await Q(() => { const q = window.__q, p = (k) => q.gl['warm:' + k] || 0; return { canvases: q.canvases.filter((c) => c.phase === 'warm').length, uploads: p('texImage2D') + p('texSubImage2D') + p('texStorage2D'), texCreated: p('createTexture') }; });
    check('regression: prewarmed open 0 canvases/uploads', s1.canvases === 0 && s1.uploads === 0, s1);
    await shot(`desktop-detail-rest-${TIER}-dpr${DPR}.png`);
    await click('toggle-book'); await sleep(2000);
    for (let i = 0; i < 2; i++) { await click('next-page'); await sleep(1400); }
    await shot(`desktop-page-turn-${TIER}-dpr${DPR}.png`);
    await click('close-detail'); await waitHero(); await sleep(800);
    await Q(() => { window.__q.phase = 'reopen'; });
    await click('inspect'); await waitDetail(); await sleep(1500);
    const s2 = await Q(() => { const q = window.__q, p = (k) => q.gl['reopen:' + k] || 0; return { canvases: q.canvases.filter((c) => c.phase === 'reopen').length, uploads: p('texImage2D') + p('texSubImage2D') + p('texStorage2D'), texCreated: p('createTexture') }; });
    check('regression: same-book reopen 0 canvases/uploads/creations', s2.canvases === 0 && s2.uploads === 0 && s2.texCreated === 0, s2);
    await click('close-detail'); await waitHero(); await quiet();
    const d0 = await draws(); await sleep(4000); const d1 = await draws();
    check('regression: idle draw-stop (0 draws over 4 s)', d1 === d0, { d0, d1 });
    check('no page errors overall', errors.length === 0, errors);
  } catch (e) { check('FATAL ' + e.message.split('\n')[0], false); }
  results.errors = errors;
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`SUMMARY pass=${results.checks.filter((c) => c.pass).length} fail=${results.checks.filter((c) => !c.pass).length}`);
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
