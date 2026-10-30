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
    screenshot: "/projects/shelf/plates/material-enhancement-assistant.webp",
    cover: "/projects/shelf/covers/material-enhancement-assistant.webp",
  },
  {
    id: "crisislineai",
    screenshot: "/projects/shelf/plates/crisislineai.webp",
    cover: "/projects/shelf/covers/crisislineai.webp",
  },
  {
    id: "shape-sign",
    screenshot: "/projects/shelf/plates/shape-sign.webp",
    cover: "/projects/shelf/covers/shape-sign.webp",
  },
  {
    id: "911-operator-assistant",
    screenshot: "/projects/shelf/plates/911-operator-assistant.webp",
    cover: "/projects/shelf/covers/911-operator-assistant.webp",
  },
  {
    id: "quizzriff",
    screenshot: "/projects/shelf/plates/quizzriff.webp",
    cover: "/projects/shelf/covers/quizzriff.webp",
  },
  {
    id: "the-bookstore",
    screenshot: "/projects/shelf/plates/the-bookstore.webp",
    cover: "/projects/shelf/covers/the-bookstore.webp",
  },
  {
    id: "llm-chatbot",
    screenshot: "/projects/shelf/plates/llm-chatbot.webp",
    cover: "/projects/shelf/covers/llm-chatbot.webp",
  },
  {
    id: "pickleball-booking-extension",
    screenshot: "/projects/shelf/plates/pickleball-booking-extension.webp",
    cover: "/projects/shelf/covers/pickleball-booking-extension.webp",
  },
  {
    id: "pickleball-booking-automation-playwright-github-actions",
    screenshot: "/projects/shelf/plates/pickleball-booking-automation-playwright-github-actions.webp",
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
  state = engine.applyShelfDensity(state, 16, true);
  assert.equal(state.pixelRatio, 1.5);
  assert.equal(state.cap, 2);
  for (let index = 0; index < 60; index += 1) state = engine.applyShelfDensity(state, 16, true);
  assert.equal(state.pixelRatio, 1.5);
  const held = engine.applyShelfDensity(state, 16, false);
  assert.equal(held.pixelRatio, 1.5);
  assert.equal(held.redraw, true);
  const toggled = engine.applyShelfDensity(held, 16, true);
  assert.equal(toggled.pixelRatio, 1.5);
  const settled = engine.applyShelfDensity(held, 16, false);
  assert.equal(settled.pixelRatio, 2);
  assert.equal(settled.redraw, true);
  const painted = engine.applyShelfDensity(settled, 16, false);
  assert.equal(painted.pixelRatio, 2);
  assert.equal(painted.redraw, false);

  state = engine.openShelfDensity(2, tierCap);
  state = engine.applyShelfDensity(state, 22, true);
  for (let index = 0; index < 29; index += 1) state = engine.applyShelfDensity(state, 22, true);
  state = engine.resizeShelfDensity(state);
  assert.equal(state.pixelRatio, 1.25);
  assert.equal(state.cap, 2);
  assert.equal(state.samples.length, 0);
  for (let index = 0; index < 60; index += 1) state = engine.applyShelfDensity(state, 16, true);
  assert.equal(state.pixelRatio, 1.5);

  const resizedOne = engine.resizeShelfDensity(engine.openShelfDensity(1, tierCap));
  assert.equal(resizedOne.pixelRatio, 1);
  assert.equal(resizedOne.cap, 1);

  const source = readFileSync(new URL("../src/components/portfolio/project-shelf/shelf-engine.ts", import.meta.url), "utf8");
  assert.match(source, /openShelfDensity\(window\.devicePixelRatio, tier\.pixelRatioCap\)/);
  assert.match(source, /applyShelfDensity\(density, frameMs, shouldContinue\)/);
  assert.match(source, /resizeShelfDensity\(density\)/);
});

check("motion entry resizes before paint and the sharp rest frame is not cleared again", () => {
  const calls = [];
  const effects = {
    resize(ratio) { calls.push(`resize:${ratio}`); },
    render() { calls.push("render"); },
    schedule() { calls.push("schedule"); },
  };
  let state = engine.openShelfDensity(2, engine.SHELF_QUALITY.high.pixelRatioCap);
  state = engine.commitShelfFrame(state, 16, true, effects);
  assert.equal(state.pixelRatio, 1.5);
  assert.deepEqual(calls, ["resize:1.5", "render", "schedule"]);
  calls.length = 0;
  state = engine.commitShelfFrame(state, 16, true, effects);
  assert.equal(state.pixelRatio, 1.5);
  assert.deepEqual(calls, ["render", "schedule"]);
  calls.length = 0;
  state = engine.commitShelfFrame(state, 16, false, effects);
  assert.equal(state.pixelRatio, 1.5);
  assert.deepEqual(calls, ["render", "schedule"]);
  calls.length = 0;
  state = engine.commitShelfFrame(state, 16, false, effects);
  assert.equal(state.pixelRatio, 2);
  assert.deepEqual(calls, ["resize:2", "render", "schedule"]);
  calls.length = 0;
  state = engine.commitShelfFrame(state, 16, false, effects);
  assert.equal(state.pixelRatio, 2);
  assert.equal(state.redraw, false);
  assert.deepEqual(calls, ["render"]);
});

check("unchanged drawing buffer is not reset", () => {
  const calls = [];
  const renderer = {
    setPixelRatio() { calls.push("ratio"); },
    setSize() { calls.push("size"); },
    setDrawingBufferSize(width, height, ratio) { calls.push(`buffer:${width}x${height}@${ratio}`); },
  };
  let previous = engine.assignShelfBuffer(renderer, 800, 600, 1.5, null);
  assert.deepEqual(calls, ["buffer:800x600@1.5"]);
  calls.length = 0;
  previous = engine.assignShelfBuffer(renderer, 800, 600, 1.5, previous);
  assert.deepEqual(calls, []);
  previous = engine.assignShelfBuffer(renderer, 800.4, 600.4, 1.5, previous);
  assert.deepEqual(calls, []);
  engine.assignShelfBuffer(renderer, 800, 600, 2, previous);
  assert.deepEqual(calls, ["buffer:800x600@2"]);
});

function detailHarness(units = ["page-0", "page-1"]) {
  const queue = [];
  const created = [];
  const uploaded = [];
  const released = [];
  let failUnit = null;
  const prep = engine.createDetailPrep({
    units: () => units,
    create(id, unit) {
      if (unit === failUnit) throw new Error(`fail ${unit}`);
      const texture = { id: `${id}:${unit}` };
      created.push(texture);
      return texture;
    },
    upload(texture) { uploaded.push(texture); },
    release(texture) { released.push(texture); },
    schedule(fn) { queue.push(fn); },
  });
  return { queue, created, uploaded, released, prep, setFail(unit) { failUnit = unit; } };
}

function once(queue) {
  const fn = queue.shift();
  assert.ok(fn, "expected a scheduled preparation task");
  fn();
}

check("detail prep yields per texture, retains one set, and drops stale work", () => {
  const warm = detailHarness();
  assert.equal(warm.prep.prepare("a"), "started");
  assert.equal(warm.created.length, 0);
  once(warm.queue);
  assert.deepEqual(warm.created.map((texture) => texture.id), ["a:page-0"]);
  assert.deepEqual(warm.uploaded.map((texture) => texture.id), ["a:page-0"]);
  assert.equal(warm.queue.length, 1);
  once(warm.queue);
  assert.equal(warm.prep.isReady("a"), true);
  assert.equal(warm.queue.length, 0);
  warm.prep.markInspected("a");
  warm.prep.markClosed();
  warm.created.length = 0;
  warm.uploaded.length = 0;
  const ready = [];
  assert.equal(warm.prep.prepare("a", { onReady(id) { ready.push(id); } }), "ready");
  assert.deepEqual(ready, ["a"]);
  assert.equal(warm.created.length, 0);
  assert.equal(warm.uploaded.length, 0);
  assert.equal(warm.queue.length, 0);
  warm.prep.markInspected("a");
  assert.equal(warm.prep.prepare("b"), "blocked");
  assert.equal(warm.released.length, 0);
  warm.prep.markClosed();
  assert.equal(warm.prep.prepare("b"), "started");
  assert.equal(warm.released.length, 2);
  assert.deepEqual(warm.released.map((texture) => texture.id), ["a:page-0", "a:page-1"]);
  const staleSwitch = detailHarness();
  staleSwitch.prep.prepare("a");
  once(staleSwitch.queue);
  const stale = staleSwitch.queue.shift();
  staleSwitch.prep.prepare("b");
  stale();
  assert.deepEqual(staleSwitch.created.map((texture) => texture.id), ["a:page-0"]);
  assert.equal(staleSwitch.released.length, 1);

  const cancelled = detailHarness();
  cancelled.prep.prepare("a");
  const late = cancelled.queue.shift();
  cancelled.prep.cancel();
  late();
  assert.equal(cancelled.created.length, 0);
  assert.equal(cancelled.uploaded.length, 0);
  assert.equal(cancelled.prep.isReady("a"), false);
});

check("detail prep failure and teardown release owned textures once and can retry", () => {
  const failed = detailHarness(["page-0", "page-1", "page-2"]);
  failed.setFail("page-1");
  let failedId = null;
  failed.prep.prepare("a", { onFail() { failedId = "a"; } });
  once(failed.queue);
  once(failed.queue);
  assert.equal(failedId, "a");
  assert.equal(failed.prep.isReady("a"), false);
  assert.deepEqual(failed.released.map((texture) => texture.id), ["a:page-0"]);
  failed.setFail(null);
  failed.released.length = 0;
  failed.prep.prepare("a");
  while (failed.queue.length) once(failed.queue);
  assert.equal(failed.prep.isReady("a"), true);
  assert.equal(failed.released.length, 0);

  const torn = detailHarness();
  torn.prep.prepare("a");
  once(torn.queue);
  torn.prep.dispose();
  const late = torn.queue.shift();
  late?.();
  torn.prep.dispose();
  assert.deepEqual(torn.released.map((texture) => texture.id), ["a:page-0"]);
  assert.equal(torn.prep.isReady("a"), false);
});

check("transition progress follows wall time and ignores the idle gap before it starts", () => {
  const duration = engine.SHELF_TRANSITION_MS;
  assert.equal(duration, 920);
  const start = 20000;
  assert.equal(engine.transitionProgress(start, start, duration), 0);
  assert.equal(engine.transitionProgress(start, start + 900, duration), 900 / 920);
  assert.equal(engine.transitionProgress(start, start + 1000, duration), 1);
  let now = start;
  for (let frame = 0; frame < 4; frame += 1) now += 200;
  assert.ok(engine.transitionProgress(start, now, duration) < 1);
  assert.equal(engine.transitionProgress(start, now + 200, duration), 1);
  now = start;
  for (let frame = 0; frame < 9; frame += 1) now += 100;
  assert.ok(engine.transitionProgress(start, now, duration) < 1);
  assert.equal(engine.transitionProgress(start, now + 100, duration), 1);
  assert.equal(engine.transitionProgress(80000, 80000, duration), 0);
  assert.equal(engine.transitionProgress(start, start + 5000, duration, true), 1);
});

check("upload failure disposes the new texture and earlier owned textures once", () => {
  const queue = [];
  const shared = { id: "paper", disposed: 0, dispose() { this.disposed += 1; } };
  const rig = { owned: [], materials: [] };
  const made = [];
  let failUpload = true;
  const prep = engine.createDetailPrep({
    units: () => ["page-0", "page-1"],
    create(id, unit) {
      const texture = {
        id: `${id}:${unit}`,
        disposed: 0,
        dispose() { this.disposed += 1; },
      };
      rig.owned.push(texture);
      rig.materials.push({
        map: texture,
        bumpMap: unit === "page-0" ? shared : texture,
        needsUpdate: false,
      });
      made.push(texture);
      return texture;
    },
    upload(texture) {
      if (failUpload && texture.id.endsWith(":page-1")) throw new Error("upload");
    },
    release(texture) { engine.releaseOwnedDetail(texture, [rig]); },
    schedule(fn) { queue.push(fn); },
  });
  let failed = false;
  prep.prepare("a", { onFail() { failed = true; } });
  once(queue);
  once(queue);
  assert.equal(failed, true);
  assert.equal(prep.isReady("a"), false);
  assert.equal(made[0].disposed, 1);
  assert.equal(made[1].disposed, 1);
  assert.equal(shared.disposed, 0);
  assert.equal(rig.materials[0].map, null);
  assert.equal(rig.materials[0].bumpMap, shared);
  assert.equal(rig.materials[1].map, null);
  assert.equal(rig.owned.length, 0);
  engine.releaseOwnedDetail(made[0], [rig]);
  engine.releaseOwnedDetail(made[1], [rig]);
  assert.equal(made[0].disposed, 1);
  assert.equal(made[1].disposed, 1);
  failUpload = false;
  prep.prepare("a");
  while (queue.length) once(queue);
  assert.equal(prep.isReady("a"), true);
  assert.equal(made[0].disposed, 1);
  assert.equal(made[1].disposed, 1);
  assert.equal(made[2].disposed, 0);
  assert.equal(made[3].disposed, 0);
  assert.equal(shared.disposed, 0);
  assert.equal(rig.owned.length, 2);
});

check("owned detail restore marks the touched material for upload", () => {
  const texture = { disposed: 0, dispose() { this.disposed += 1; } };
  const paper = { id: "paper" };
  const material = { map: texture, needsUpdate: false };
  const rig = {
    owned: [texture],
    materials: [material],
    restore(item) {
      item.map = paper;
      item.needsUpdate = false;
    },
  };
  engine.releaseOwnedDetail(texture, [rig]);
  assert.equal(material.map, paper);
  assert.equal(material.needsUpdate, true);
  assert.equal(texture.disposed, 1);
  engine.releaseOwnedDetail(texture, [rig]);
  assert.equal(texture.disposed, 1);
});

check("closing hides internals before the book reference is released", () => {
  const order = [];
  engine.sealShelfClose({ id: "a" }, {
    hideInternals(book) { order.push(`hide:${book.id}`); },
    markClosed() { order.push("retain"); },
  });
  assert.deepEqual(order, ["hide:a", "retain"]);
});

check("context loss drops owned prep and a late task cannot open", () => {
  const queue = [];
  const released = [];
  const session = { suspended: false, preparing: "a", opened: false };
  const prep = engine.createDetailPrep({
    units: () => ["page-0", "page-1"],
    create(id, unit) {
      return { id: `${id}:${unit}`, disposed: 0, dispose() { this.disposed += 1; released.push(this.id); } };
    },
    upload() {},
    release(texture) { texture.dispose(); },
    schedule(fn) { queue.push(fn); },
  });
  const order = [];
  prep.prepare("a", { onReady() { if (!session.lost) session.opened = true; } });
  once(queue);
  engine.abandonShelfGraphics({
    suspend() { order.push("suspend"); session.suspended = true; },
    invalidate() { order.push("invalidate"); session.lost = true; },
    cancelPrep() { order.push("cancel"); prep.cancel(); },
    disposeOwned() { order.push("dispose"); prep.dispose(); },
    clearPreparing() { order.push("clear"); session.preparing = null; },
  });
  const late = queue.shift();
  late?.();
  assert.deepEqual(order, ["suspend", "invalidate", "cancel", "dispose", "clear"]);
  assert.equal(session.suspended, true);
  assert.equal(session.lost, true);
  assert.equal(session.preparing, null);
  assert.equal(session.opened, false);
  assert.deepEqual(released, ["a:page-0"]);
  assert.equal(prep.isReady("a"), false);
});

check("prewarm waits for ready visible settled shelf and selection keeps the retained book", () => {
  const settledShelf = {
    ready: true, onScreen: true, settled: true, preparing: null, mode: "hero", suspended: false,
    position: 1, targetPosition: 1, dragging: false,
  };
  assert.equal(engine.shelfPrewarmAllowed({ ...settledShelf, position: 0.9 }), false);
  assert.equal(engine.shelfPrewarmAllowed({ ...settledShelf, settled: true, position: 0.2, targetPosition: 1 }), false);
  assert.equal(engine.shelfPrewarmAllowed({ ...settledShelf, dragging: true }), false);
  assert.equal(engine.shelfPrewarmAllowed({ ...settledShelf, settled: false }), false);
  assert.equal(engine.shelfPrewarmAllowed(settledShelf), true);
  assert.equal(engine.shelfPrewarmAllowed({
    ready: true, onScreen: true, settled: true, preparing: null, mode: "hero", suspended: false,
  }), false);
  for (const blocked of [
    { ready: false, onScreen: true, settled: true, mode: "hero" },
    { ready: true, onScreen: false, settled: true, mode: "hero" },
    { ready: true, onScreen: true, settled: false, mode: "hero" },
    { ready: true, onScreen: true, settled: true, preparing: "a", mode: "hero" },
    { ready: true, onScreen: true, settled: true, mode: "detail" },
    { ready: true, onScreen: true, settled: true, mode: "hero", suspended: true },
  ]) {
    assert.equal(engine.shelfPrewarmAllowed(blocked), false);
  }

  const kept = detailHarness(["page-0"]);
  kept.prep.prepare("kept");
  once(kept.queue);
  assert.equal(kept.prep.dropSpeculative("other"), false);
  assert.equal(kept.prep.isReady("kept"), true);
  assert.equal(kept.released.length, 0);

  const passing = detailHarness(["page-0", "page-1"]);
  passing.prep.prepare("passing");
  once(passing.queue);
  assert.equal(passing.prep.dropSpeculative("kept"), true);
  const late = passing.queue.shift();
  late?.();
  assert.deepEqual(passing.created.map((texture) => texture.id), ["passing:page-0"]);
  assert.deepEqual(passing.released.map((texture) => texture.id), ["passing:page-0"]);
  assert.equal(passing.prep.isReady("passing"), false);

  const selected = detailHarness(["page-0"]);
  selected.prep.prepare("next");
  assert.equal(selected.prep.dropSpeculative("next"), false);
  selected.prep.markInspected("next");
  assert.equal(selected.prep.dropSpeculative("other"), false);
  assert.equal(selected.released.length, 0);
  once(selected.queue);
  assert.equal(selected.prep.isReady("next"), true);
});

function throwingPrep() {
  const queue = [];
  let creates = 0;
  const prep = engine.createDetailPrep({
    units: () => ["page"],
    create() {
      creates += 1;
      throw new Error("upload");
    },
    upload() {},
    release() {},
    schedule(fn) { queue.push(fn); },
  });
  return {
    queue,
    prep,
    creates() { return creates; },
    flush() { while (queue.length) queue.shift()(); },
  };
}

check("failed prewarm does not retry every frame until the gate lifts", () => {
  const gate = engine.createPrepGate();
  const attempt = throwingPrep();
  function prewarm(id) {
    if (!gate.allowsAutomatic(id)) return;
    attempt.prep.prepare(id, { onFail() { gate.suppress(id); } });
    attempt.flush();
  }
  prewarm("a");
  for (let frame = 0; frame < 6; frame += 1) prewarm("a");
  assert.equal(attempt.creates(), 1);
  gate.allowUser("a");
  prewarm("a");
  for (let frame = 0; frame < 4; frame += 1) prewarm("a");
  assert.equal(attempt.creates(), 2);
  gate.liftAll();
  prewarm("a");
  assert.equal(attempt.creates(), 3);
});

check("cancel suppresses the same prewarm until the gate lifts", () => {
  const gate = engine.createPrepGate();
  const attempt = throwingPrep();
  attempt.prep.prepare("a");
  gate.suppress("a");
  attempt.prep.cancel();
  attempt.flush();
  const afterCancel = attempt.creates();
  function prewarm(id) {
    if (!gate.allowsAutomatic(id)) return;
    attempt.prep.prepare(id, { onFail() { gate.suppress(id); } });
    attempt.flush();
  }
  for (let frame = 0; frame < 5; frame += 1) prewarm("a");
  assert.equal(attempt.creates(), afterCancel);
  gate.liftAll();
  prewarm("a");
  assert.equal(attempt.creates(), afterCancel + 1);
});

check("ready prep does not open when the shelf has moved to another book", () => {
  assert.equal(engine.preparedOpenDecision({
    readyId: "a", nearestId: "b", preparingId: "a",
  }), "clear");
  assert.equal(engine.preparedOpenDecision({
    readyId: "a", nearestId: "a", preparingId: "a",
  }), "open");
  assert.equal(engine.preparedOpenDecision({
    readyId: "a", nearestId: "a", preparingId: null,
  }), "ignore");
});

check("startup waits on the visible books and loads each pair together", () => {
  const books = [
    { id: "a", cover: "/a-cover", screenshot: "/a-shot" },
    { id: "b", cover: "/b-cover", screenshot: "/b-shot" },
    { id: "c", cover: "", screenshot: "/c-shot" },
    { id: "d", cover: "/d-cover", screenshot: "/d-shot" },
    { id: "e", cover: "/e-cover", screenshot: "/e-shot" },
  ];
  const plan = engine.shelfStartupPlan(books, 3, 0);
  assert.deepEqual(plan.blocking.map((book) => book.id), ["a", "b", "c"]);
  assert.deepEqual(plan.blocking[0].images, ["/a-cover", "/a-shot"]);
  assert.deepEqual(plan.blocking[2].images, ["/c-shot"]);
  assert.deepEqual(plan.deferred.map((book) => book.id), ["d", "e"]);
  const end = engine.shelfStartupPlan(books, 3, 4);
  assert.deepEqual(end.blocking.map((book) => book.id), ["c", "d", "e"]);
  const real = engine.shelfStartupPlan(engine.buildShelfBooks(projects));
  assert.equal(real.blocking.length, 3);
  assert.equal(real.blocking.length + real.deferred.length, projects.length);
  assert.ok(real.deferred.length > 0);
});

check("blocked prepare clears Preparing", () => {
  const prep = engine.createDetailPrep({
    units: () => ["page"],
    create() { return { id: "x" }; },
    upload() {},
    release() {},
    schedule() {},
  });
  prep.markInspected("kept");
  assert.equal(engine.startUserPrep(prep, "other"), "clear");
  assert.equal(prep.isReady("other"), false);
});

if (reds.length) {
  console.log(`${reds.length} failed`);
  process.exit(1);
}
console.log("all checks passed");

check("late screenshot repaints only plate pages that already own a texture", () => {
  const disposed = [];
  const owned = { dispose() { disposed.push("page-2"); } };
  const stranger = { dispose() { disposed.push("stranger"); } };
  const materials = [];
  materials[2] = { map: owned, needsUpdate: false };
  materials[6] = { map: stranger, needsUpdate: false };
  const rig = { interiorPageMaterials: materials, detailTextures: [owned] };
  const made = [];
  const uploaded = [];
  const changed = engine.repaintArrivedPlates(rig, (page) => {
    const texture = { page };
    made.push(page);
    return texture;
  }, (texture) => uploaded.push(texture.page));
  assert.equal(changed, true);
  assert.deepEqual(made, [2]);
  assert.deepEqual(uploaded, [2]);
  assert.deepEqual(disposed, ["page-2"]);
  assert.equal(rig.detailTextures.length, 1);
  assert.equal(rig.detailTextures[0], materials[2].map);
  assert.equal(materials[2].needsUpdate, true);
  assert.equal(materials[6].map, stranger);
  assert.equal(engine.repaintArrivedPlates({ interiorPageMaterials: [], detailTextures: [] }, () => { throw new Error("no"); }, () => {}), false);
});
