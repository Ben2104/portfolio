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
  // the Next dev badge sits over the bottom-left of the page and swallows clicks; it does not exist in production
  await ctx.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const s = document.createElement("style");
      s.textContent = "nextjs-portal{display:none!important}";
      document.head.appendChild(s);
    });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text());
  });
  return { ctx, page, errors };
}

// waits for the Experience section to report a given active role (scrolling is smooth, so it takes a moment)
const waitActive = (page, test) =>
  page.waitForFunction((src) => new Function("a", "return " + src)(Number(document.getElementById("experience").dataset.active)), test, { timeout: 6000 }).then(() => true, () => false);
const expState = (page) =>
  page.evaluate(() => {
    const s = document.getElementById("experience");
    return { active: Number(s.dataset.active), mode: s.dataset.mode, title: s.querySelector(".exp__card h3")?.textContent ?? "" };
  });

// Experience: the three.js tunnel draws, the rail jumps between roles and the card follows
async function checkExperience(page, tag) {
  await page.evaluate(() => document.getElementById("experience").scrollIntoView({ behavior: "instant", block: "start" }));
  const ready = await page.waitForSelector('.exp__gl[data-ready="1"]', { timeout: 15000 }).then(() => true, () => false);
  check("experience (" + tag + "): three.js canvas renders", ready);
  await page.waitForTimeout(1500);
  const gl = page.locator(".exp__gl");
  const before = await gl.screenshot();
  const s0 = await expState(page);
  await page.locator(".exp__rail button").nth(6).click();
  await waitActive(page, "a === 6");
  await page.waitForTimeout(2200);
  const after = await gl.screenshot();
  const s6 = await expState(page);
  check("experience (" + tag + "): rail jumps to the last role and the card follows", s0.active === 0 && s6.active === 6 && !!s6.title && s6.title !== s0.title, s0.active + " " + s0.title + " -> " + s6.active + " " + s6.title);
  check("experience (" + tag + "): the scene moves as you travel", !before.equals(after), before.length + " vs " + after.length + " bytes");
  await page.locator(".exp__rail button").nth(0).click();
  check("experience (" + tag + "): rail jumps back to the first role", await waitActive(page, "a === 0"));
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

  await checkExperience(page, "1440");
  // scrolling with the wheel advances the role too
  await page.evaluate(() => document.getElementById("experience").scrollIntoView({ behavior: "instant", block: "start" }));
  await waitActive(page, "a === 0");
  await page.mouse.wheel(0, 1000);
  check("experience (1440): wheel scroll advances the active role", await waitActive(page, "a >= 1"), "active=" + (await expState(page)).active);

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
  await checkExperience(page, "390");
  await shotSections(page, OUT + "/390", "m");
  check("no console or page errors at 390", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- reduced motion: plain list, no canvas ----------
{
  const { ctx, page, errors } = await open(1440, 900, { reducedMotion: "reduce" });
  await page.goto(URL_, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const s = document.getElementById("experience");
    return { mode: s.dataset.mode, canvas: !!s.querySelector("canvas"), listH: Math.round(s.querySelector(".exp__list").getBoundingClientRect().height), secH: s.offsetHeight, vh: innerHeight };
  });
  check("experience: reduced motion shows a plain list, no canvas", m.mode === "list" && !m.canvas && m.listH > 200 && m.secH < m.vh * 4, JSON.stringify(m));
  check("no console or page errors with reduced motion", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log("\n" + (results.length - failed) + "/" + results.length + " checks passed. Screenshots in " + OUT);
process.exit(failed);
