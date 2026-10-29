/* Run with PLAYWRIGHT_PATH and PYTHONPATH as documented in qa-results.md. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/tmp/portfolio-shelf-qa/node_modules/playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const dir = '/tmp/portfolio-shelf-qa/walkthrough';
(async () => {
  fs.mkdirSync(dir, {recursive: true});
  const browser = await chromium.launch({args: ['--enable-unsafe-swiftshader']});
  const context = await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page = await context.newPage();
  try {
    await page.goto(process.argv[2] || 'http://localhost:3107/?shelf-quality=high');
    await page.addStyleTag({content:'nextjs-portal {display:none !important}'});
    await page.locator('.pshelf').scrollIntoViewIfNeeded();
    await page.waitForSelector('.pshelf.webgl-ready',{timeout:120000});
    await page.waitForTimeout(2000);
    await page.screenshot({path:`${dir}/cover.png`});
    await page.locator('[data-shelf="inspect"]').click({timeout:90000});
    await page.waitForSelector('.pshelf.mode-detail:not(.is-opening)',{timeout:90000});
    await page.waitForTimeout(1000);
    await page.screenshot({path:`${dir}/inspect.png`});
    await page.locator('[data-shelf="toggle-book"]').click({timeout:90000});
    await page.waitForTimeout(1500);
    await page.screenshot({path:`${dir}/open.png`});
    await page.locator('[data-shelf="next-page"]').click({timeout:90000});
    await page.waitForFunction(() => document.querySelector('[data-shelf="page-label"]')?.textContent?.includes('Overview'));
    await page.waitForTimeout(1500);
    await page.screenshot({path:`${dir}/plate.png`});
    console.log('Captured shelf, inspect, open and Overview/Plate after WebGL readiness.');
  } finally { await context.close(); await browser.close(); }
  execFileSync('python3', ['-c', `
from PIL import Image, ImageDraw
from pathlib import Path
folder = Path('/tmp/portfolio-shelf-qa/walkthrough')
frames = []
for name, label in [('cover','SHELF'), ('inspect','INSPECT'), ('open','OPEN BOOK'), ('plate','OVERVIEW / PLATE')]:
    image = Image.open(folder / (name + '.png')).convert('RGB')
    draw = ImageDraw.Draw(image)
    draw.rectangle((16, 16, 390, 48), fill='#181818')
    draw.text((26, 25), label + '  |  REDUCED MOTION', fill='#ffffff')
    frames.append(image)
frames[0].save('docs/pr/projects-shelf-clarity/interaction-reduced-motion.gif', save_all=True, append_images=frames[1:], duration=[1600, 1600, 1600, 2200], loop=0, optimize=True)
`], {stdio:'inherit'});
})().catch(error=>{console.error(error);process.exitCode=1});
