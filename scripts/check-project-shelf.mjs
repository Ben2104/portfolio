import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const engine = await import("../src/components/portfolio/project-shelf/shelf-engine.ts");
const { projects } = await import("../src/data/portfolio.ts");

const reds = [];

function check(name, fn) {
  try {
    fn();
    console.log(`ok ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    reds.push(`${name}: ${message}`);
    console.log(`RED ${name}: ${message}`);
  }
}

const expected = [
  {
    id: "material-enhancement-assistant",
    screenshot: "/projects/material-enhancement-assistant.png",
    cover: "/projects/shelf/covers/material-enhancement-assistant.webp",
  },
  {
    id: "crisislineai",
    screenshot: "/projects/crisislineai.png",
    cover: "/projects/shelf/covers/crisislineai.webp",
  },
  {
    id: "shape-sign",
    screenshot: "/projects/shape&sign.png",
    cover: "/projects/shelf/covers/shape-sign.webp",
  },
  {
    id: "911-operator-assistant",
    screenshot: "/projects/911_operator.png",
    cover: "/projects/shelf/covers/911-operator-assistant.webp",
  },
  {
    id: "quizzriff",
    screenshot: "/projects/quizzriff.png",
    cover: "/projects/shelf/covers/quizzriff.webp",
  },
  {
    id: "the-bookstore",
    screenshot: "/projects/Bookstore.png",
    cover: "/projects/shelf/covers/the-bookstore.webp",
  },
  {
    id: "llm-chatbot",
    screenshot: "/projects/chatbot.png",
    cover: "/projects/shelf/covers/llm-chatbot.webp",
  },
  {
    id: "pickleball-booking-extension",
    screenshot: "/projects/pickleball.jpg",
    cover: "/projects/shelf/covers/pickleball-booking-extension.webp",
  },
  {
    id: "pickleball-booking-automation-playwright-github-actions",
    screenshot: "/projects/pickleball_bot.png",
    cover: "/projects/shelf/covers/pickleball-booking-automation-playwright-github-actions.webp",
  },
];

check("nine cover and screenshot mappings", () => {
  const books = engine.buildShelfBooks(projects);
  assert.equal(books.length, 9);
  assert.equal(projects.length, 9);
  expected.forEach((want, index) => {
    const book = books[index];
    assert.equal(projects[index].image, want.screenshot);
    assert.equal(book.id, want.id);
    assert.equal(book.screenshot, want.screenshot);
    assert.equal(book.cover, want.cover);
    assert.notEqual(book.cover, book.screenshot);
    assert.notEqual(book.cover, `/projects/shelf/${want.id}.webp`);
  });
});

check("missing artwork keeps a screenshot and an empty cover", () => {
  const [unknown] = engine.buildShelfBooks([{ title: "Not A Real Project", image: "/projects/nope.png" }]);
  assert.equal(unknown.cover, "");
  assert.equal(unknown.screenshot, "/projects/nope.png");
  const [bare] = engine.buildShelfBooks([{ title: "Shape-Sign" }]);
  assert.equal(bare.screenshot, "");
  assert.equal(bare.cover, "/projects/shelf/covers/shape-sign.webp");
});

check("screenshot framing keeps the full wide and square source", () => {
  assert.equal(typeof engine.frameScreenshot, "function");
  const wide = engine.frameScreenshot(1440, 900, 54, 190, 404, 300);
  const detail = engine.frameScreenshot(1440, 900, 54, 190, 404, 420);
  const square = engine.frameScreenshot(800, 800, 0, 0, 400, 300);
  const tall = engine.frameScreenshot(573, 1024, 10, 20, 404, 420);
  assert.equal(engine.frameScreenshot(0, 100, 0, 0, 10, 10), null);
  for (const frame of [wide, detail]) {
    assert.equal(frame.sx, 0);
    assert.equal(frame.sy, 0);
    assert.equal(frame.sw, 1440);
    assert.equal(frame.sh, 900);
    assert.ok(frame.dw <= 404 + 1e-9 && frame.dh <= (frame === wide ? 300 : 420) + 1e-9);
    assert.ok(Math.abs(frame.dw / frame.dh - 1440 / 900) < 1e-9);
  }
  assert.equal(wide.sw, detail.sw);
  assert.equal(wide.sh, detail.sh);
  assert.equal(square.sw, 800);
  assert.equal(square.sh, 800);
  assert.ok(Math.abs(square.dw - 300) < 1e-9);
  assert.ok(Math.abs(square.dh - 300) < 1e-9);
  assert.ok(square.dx > 0);
  assert.equal(tall.sw, 573);
  assert.equal(tall.sh, 1024);
  assert.ok(tall.dw <= 404 && tall.dh <= 420);
  assert.ok(Math.abs(tall.dw / tall.dh - 573 / 1024) < 1e-9);
});

check("detail textures detach before dispose and only the uninspected book drops", () => {
  const shared = { disposed: 0, dispose() { this.disposed += 1; } };
  const texture = {
    disposed: 0,
    dispose() {
      assert.equal(material.map, null);
      assert.equal(material.alphaMap, null);
      assert.equal(material.bumpMap, null);
      assert.equal(page.bumpMap, shared);
      this.disposed += 1;
    },
  };
  const material = { map: texture, alphaMap: texture, bumpMap: texture, needsUpdate: false };
  const page = { map: texture, bumpMap: shared, needsUpdate: false };
  const kept = {
    disposed: 0,
    dispose() {
      assert.equal(other.map, null);
      this.disposed += 1;
    },
  };
  const other = { map: kept, needsUpdate: false };
  let hidden = 0;
  const rigs = [
    { id: "a", detailed: true, owned: [texture], materials: [material, page], hide() { hidden += 1; } },
    { id: "b", detailed: true, owned: [kept], materials: [other], hide() { hidden += 1; } },
    { id: "c", detailed: false, materials: [], hide() { throw new Error("undetailed book was released"); } },
  ];
  engine.releaseShelfDetails(rigs, "b");
  assert.equal(material.map, null);
  assert.equal(page.map, null);
  assert.equal(page.bumpMap, shared);
  assert.equal(shared.disposed, 0);
  assert.equal(texture.disposed, 1);
  assert.equal(kept.disposed, 0);
  assert.equal(hidden, 1);
  assert.equal(rigs[0].detailed, false);
  assert.equal(rigs[1].detailed, true);
  assert.equal(rigs[2].detailed, false);
  engine.releaseShelfDetails(rigs, null);
  assert.equal(kept.disposed, 1);
  assert.equal(other.map, null);
  assert.equal(rigs[1].detailed, false);
});

check("density recovers after slow frames and ignores idle gaps", () => {
  assert.equal(engine.SHELF_QUALITY.high.pixelRatioCap, 2);
  assert.equal(engine.SHELF_QUALITY.low.pixelRatioCap, 1.25);

  let state = { pixelRatio: 2, cap: 2, samples: [] };
  for (let index = 0; index < 30; index += 1) state = engine.stepShelfDensity(state, 22);
  assert.equal(state.pixelRatio, 1.75);
  for (let index = 0; index < 30; index += 1) state = engine.stepShelfDensity(state, 16);
  assert.equal(state.pixelRatio, 2);

  state = { pixelRatio: 2, cap: 2, samples: [] };
  for (let index = 0; index < 29; index += 1) state = engine.stepShelfDensity(state, 22);
  state = engine.stepShelfDensity(state, 5000);
  assert.equal(state.pixelRatio, 2);
  assert.equal(state.samples.length, 0);
  for (let index = 0; index < 29; index += 1) state = engine.stepShelfDensity(state, 22);
  assert.equal(state.pixelRatio, 2);

  state = { pixelRatio: 1, cap: 2, samples: [] };
  for (let index = 0; index < 30; index += 1) state = engine.stepShelfDensity(state, 30);
  assert.equal(state.pixelRatio, 1);

  state = { pixelRatio: 1, cap: 1.25, samples: [] };
  for (let index = 0; index < 60; index += 1) state = engine.stepShelfDensity(state, 16);
  assert.equal(state.pixelRatio, 1.25);
});

check("density integration caps DPR 1, restores on settle, and keeps resize in range", () => {
  const tierCap = engine.SHELF_QUALITY.high.pixelRatioCap;
  let state = engine.openShelfDensity(1, tierCap);
  assert.equal(state.pixelRatio, 1);
  assert.equal(state.cap, 1);
  for (let index = 0; index < 60; index += 1) {
    const frame = engine.applyShelfDensity(state, 16, true);
    assert.equal(frame.redraw, false);
    state = frame;
  }
  assert.equal(state.pixelRatio, 1);

  state = engine.openShelfDensity(3, tierCap);
  assert.equal(state.cap, 2);
  assert.equal(state.pixelRatio, 2);
  for (let index = 0; index < 30; index += 1) state = engine.applyShelfDensity(state, 22, true);
  assert.equal(state.pixelRatio, 1.75);
  const settled = engine.applyShelfDensity(state, 16, false);
  assert.equal(settled.pixelRatio, 2);
  assert.equal(settled.redraw, true);
  const painted = engine.applyShelfDensity(settled, 16, false);
  assert.equal(painted.pixelRatio, 2);
  assert.equal(painted.redraw, false);

  state = engine.openShelfDensity(2, tierCap);
  for (let index = 0; index < 30; index += 1) state = engine.applyShelfDensity(state, 22, true);
  state = engine.resizeShelfDensity(state);
  assert.equal(state.pixelRatio, 1.75);
  assert.equal(state.cap, 2);
  assert.equal(state.samples.length, 0);
  for (let index = 0; index < 30; index += 1) state = engine.applyShelfDensity(state, 16, true);
  assert.equal(state.pixelRatio, 2);

  const resizedOne = engine.resizeShelfDensity(engine.openShelfDensity(1, tierCap));
  assert.equal(resizedOne.pixelRatio, 1);
  assert.equal(resizedOne.cap, 1);

  const source = readFileSync(new URL("../src/components/portfolio/project-shelf/shelf-engine.ts", import.meta.url), "utf8");
  assert.match(source, /openShelfDensity\(window\.devicePixelRatio, tier\.pixelRatioCap\)/);
  assert.match(source, /applyShelfDensity\(density, frameMs, shouldContinue\)/);
  assert.match(source, /resizeShelfDensity\(density\)/);
});

check("final fast sample resizes before paint and does not schedule another frame", () => {
  const quiet = { resize() {}, render() {}, schedule() {} };
  let state = { pixelRatio: 1.75, cap: 2, samples: [] };
  for (let index = 0; index < 29; index += 1) state = engine.commitShelfFrame(state, 16, true, quiet);
  assert.equal(state.pixelRatio, 1.75);
  const calls = [];
  state = engine.commitShelfFrame(state, 16, false, {
    resize(ratio) { calls.push(`resize:${ratio}`); },
    render() { calls.push("render"); },
    schedule() { calls.push("schedule"); },
  });
  assert.equal(state.pixelRatio, 2);
  assert.equal(state.redraw, false);
  assert.deepEqual(calls, ["resize:2", "render"]);

  const source = readFileSync(new URL("../src/components/portfolio/project-shelf/shelf-engine.ts", import.meta.url), "utf8");
  const frameStart = source.indexOf("function frame(time)");
  const body = source.slice(frameStart, source.indexOf("function resize()", frameStart));
  assert.match(body, /commitShelfFrame\(density, frameMs, shouldContinue/);
});

if (reds.length) {
  console.log(`${reds.length} failed`);
  process.exit(1);
}
console.log("all checks passed");
