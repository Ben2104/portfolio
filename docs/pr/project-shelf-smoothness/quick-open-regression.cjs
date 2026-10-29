// Actual canvas-click path selects and opens in one event; motion must not cancel cold preparation.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/tmp/portfolio-shelf-qa/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 700 }, reducedMotion: 'no-preference' });
    await page.goto('http://127.0.0.1:3108/');
    await page.waitForSelector('.pshelf.webgl-ready', { timeout: 120000 });
    const title = await page.evaluate(() => {
      document.querySelectorAll('[data-shelf=markers] button')[1].click();
      const title = document.querySelector('[data-shelf=selection-title]').textContent;
      document.querySelector('[data-shelf=inspect]').click();
      return title;
    });
    await page.waitForSelector('.pshelf.mode-detail:not(.is-opening)', { timeout: 20000 });
    assert.equal(await page.locator('[data-shelf=detail-title]').textContent(), title);
    await page.evaluate(() => window.cleanup());
    console.log('PASS quick select-and-open inspects the requested book during normal-motion scrolling');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
