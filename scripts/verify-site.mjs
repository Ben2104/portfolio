// Browser verification loop for the portfolio. Drives real Chrome through Playwright, clicks around,
// asserts the behaviour the redesign promises and saves screenshots to look at.
//
//   node scripts/verify-site.mjs                      # http://localhost:3100, 1440 + 390
//   node scripts/verify-site.mjs --url http://localhost:3000 --out .verify
//
// Exit code is the number of failed checks, so it can sit in a fix-and-rerun loop.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const arg = (k, d) => {
  const i = process.argv.indexOf("--" + k);
  return i > -1 ? process.argv[i + 1] : d;
};
const URL_ = arg("url", "http://localhost:3100");
const OUT = arg("out", ".verify");
const SECTIONS = ["top", "intro", "about", "education", "experience", "selected", "work", "contact"];
const RAIL = ["Home", "Intro", "About", "Education", "Experience", "Projects", "Contact"];

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok: !!ok, detail });
  console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  -> " + detail : ""));
};

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

async function open(width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text());
  });
  return { ctx, page, errors };
}

async function settle(page, ms = 1300) {
  await page.waitForTimeout(ms);
}

async function shotSections(page, dir, tag) {
  mkdirSync(dir, { recursive: true });
  for (const id of SECTIONS) {
    const el = page.locator("#" + id);
    if (!(await el.count())) continue;
    await page.evaluate((i) => document.getElementById(i).scrollIntoView({ behavior: "instant", block: "start" }), id);
    await settle(page, 1100);
    await page.screenshot({ path: dir + "/" + tag + "-" + id + ".png" });
  }
}

// ---------- desktop ----------
{
  const { ctx, page, errors } = await open(1440, 900);
  await page.goto(URL_, { waitUntil: "networkidle" });
  await settle(page, 1800);

  // live date: matches the visitor's clock
  const shown = await page.locator("[data-live-date]").innerText();
  const expected = await page.evaluate(() => {
    const d = new Date();
    return new Intl.DateTimeFormat("en-US", { month: "long" }).format(d) + " / " + d.getFullYear();
  });
  check("hero date equals the live month / year", shown.trim().toLowerCase() === expected.toLowerCase(), shown.trim() + " vs " + expected);

  // nav: fixed and visible at every scroll depth
  const navTop = async () => (await page.locator("nav.gn").boundingBox())?.y;
  const t0 = await navTop();
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await settle(page, 500);
  const t1 = await navTop();
  check("nav stays fixed at the top while scrolling", t0 !== undefined && t1 !== undefined && Math.abs(t1 - t0) < 12, t0 + " -> " + t1);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await settle(page, 400);

  // nav: every item scrolls to its section and becomes current
  for (let i = 0; i < RAIL.length; i++) {
    await page.getByRole("link", { name: RAIL[i], exact: true }).first().click();
    await page.waitForTimeout(1500);
    const cur = await page.locator("nav.gn a[aria-current='location']").innerText().catch(() => "");
    const id = ["top", "intro", "about", "education", "experience", "selected", "contact"][i];
    const top = await page.evaluate((s) => document.getElementById(s)?.getBoundingClientRect().top, id);
    check("nav -> " + RAIL[i], cur === RAIL[i] && top !== undefined && Math.abs(top) < 60, "current=" + cur + " top=" + Math.round(top));
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await settle(page, 600);

  // next / previous arrows step through the sections
  await page.getByRole("button", { name: "Next section" }).click();
  await page.waitForTimeout(1400);
  const afterNext = await page.locator("nav.gn a[aria-current='location']").innerText();
  await page.getByRole("button", { name: "Previous section" }).click();
  await page.waitForTimeout(1400);
  const afterPrev = await page.locator("nav.gn a[aria-current='location']").innerText();
  check("next / previous arrows move one section", afterNext === "Intro" && afterPrev === "Home", afterNext + " / " + afterPrev);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("no horizontal overflow at 1440", overflow <= 0, "overflow=" + overflow);

  await shotSections(page, OUT + "/1440", "d");
  check("no console or page errors at 1440", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- live date follows the calendar ----------
{
  const { ctx, page } = await open(1440, 900);
  await page.clock.install({ time: new Date(2026, 11, 31, 23, 59, 50) });
  await page.goto(URL_, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const before = (await page.locator("[data-live-date]").innerText()).trim();
  await page.clock.runFor(20000);
  await page.waitForTimeout(300);
  const after = (await page.locator("[data-live-date]").innerText()).trim();
  check("hero date rolls over at midnight (Dec 2026 -> Jan 2027)", before.toLowerCase() === "december / 2026" && after.toLowerCase() === "january / 2027", before + " -> " + after);
  await ctx.close();
}

// ---------- mobile ----------
{
  const { ctx, page, errors } = await open(390, 844, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(URL_, { waitUntil: "networkidle" });
  await settle(page, 1800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("no horizontal overflow at 390", overflow <= 0, "overflow=" + overflow);
  await shotSections(page, OUT + "/390", "m");
  check("no console or page errors at 390", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log("\n" + (results.length - failed) + "/" + results.length + " checks passed. Screenshots in " + OUT);
process.exit(failed);
