# Project shelf smoothness QA

## Baseline: a6b87b2

Local Next 16.4.3 production build, normal motion, viewport 1280×800. Chromium reported ANGLE Vulkan SwiftShader Device (Subzero), a software renderer. Results are diagnostics, not real-device FPS. User device remains unknown.

| Case | Inspect handler | Click to first animation callback | Detail canvases / textures / uploads | Upload call CPU sum |
| --- | ---: | ---: | ---: | ---: |
| Low DPR 1, first | Not measured | 153.9 ms | 11 / 11 / 11 | 49.6 ms |
| Low DPR 1, same-book reopen | Not measured | 54.3 ms | 11 / 11 / 11 | 51.3 ms |
| Low DPR 1, another book | Not measured | 59.1 ms | 11 / 11 / 11 | 50.0 ms |
| High DPR 1, first | 37.4 ms | 280.6 ms | 11 / 11 / 11 | 97.3 ms |
| High DPR 2, first | 38.3 ms | 276.7 ms | 11 / 11 / 11 | 99.4 ms |

Low detail canvases: nine 512×768, two 768×1152; high: nine 768×1152, two 1024×1536. First and repeated inspection compiled no shaders. Scroll averaged 102 draw calls per instrumented callback on low, 127 on high. Eight scene-canvas width/height assignments occurred at startup and none in measured interactions; no density change was observed. Long-task observer callbacks can arrive after phase boundaries, so their baseline phase labels are not reliable. High-tier reopen was not measured; the full high-tier cycle was intentionally interrupted. Handler, callback, and upload times overlap and cannot be added; CPU WebGL calls do not measure asynchronous GPU execution.

Original baseline data and probes: `baseline-low.json`, `baseline-high.json`, `baseline-probe.cjs`, `baseline-high-probe.cjs`, `baseline.txt`. The high baseline JSON includes an intentionally interrupted high-DPR-1 full-cycle attempt; the separate bounded high probe completed. These scripts write under `/tmp/portfolio-shelf-qa` and require the existing Playwright install there.

## After implementation

Pending frontend handoff and fresh production build. Prepared `probe.cjs` records actual RAF draw callbacks, canvas creation and dimensions, WebGL operations, synchronous click-handler timing, timeout tasks that create canvases, and timestamped phase boundaries. It exits nonzero if the warm reopen has canvas creation or texture uploads. The harness requires validation against the completed implementation; its generic task hook does not cover all possible schedulers, so task coverage and long-task attribution must be checked against actual code. Separate browser cases remain necessary for cancellation, failure, focus, touch, reduced motion, density, teardown, and evidence captures. Playwright CLI handles requested browser QA and screenshots; library instrumentation supplements metrics.

## Browser lifecycle harness design (pending implementation)

- Instrument the actual scheduler selected by the implementation, preserving listener identity on removal. Track task start/end and texture/canvas identities, dimensions, uploads, and disposal. Attribute long tasks by entry start/end against monotonic phase boundaries, not observer delivery time.
- Establish cold state by explicitly controlling speculative preparation before opening; verify from actual creation/upload events. Establish warm state only after completed detail preparation and close. Assert zero new detail canvases/uploads on reopening that same book.
- Pause a real preparation between units. Exercise selection replacement and Escape while pending, resume delayed callbacks, and assert no stale book opens or receives resources, focus returns and retry succeeds. Repeat with an injected one-shot creation failure and an upload failure, asserting usable controls and retry.
- Track material attachment and texture lifetime, including shared resources, rather than only GPU object totals. Verify replacement, partial preparation and teardown release each owned resource exactly once; use a controllable isolated mount/unmount only if the application exposes no natural route transition. Check no work remains after teardown.
- In real browser interactions, exercise normal and reduced motion, keyboard and touch, resize, density restoration and final rendered sharp frame. Record idle draw count before and after a stable interval; use the deterministic clock checks alongside browser behavior, not as a substitute.

Final selectors, injection points, and reliable idle/prewarm completion conditions depend on frontend handoff. No production server or build started during preparation.

## Isolated lifecycle checks (intermediate working tree)

An isolated server transpiled the live engine and server-rendered the actual `ProjectShelf` markup without Next or `.next` writes. A Three.js shim instrumented the actual renderer and texture disposal, and injected one upload failure. `isolated-lifecycle.cjs` passed: upload failure cleared busy state; retry opened; same-book reopen issued zero `initTexture` calls; cleanup disposed 15 named page/endpaper textures with zero remaining material references; no page exceptions. `isolated-cancellation.cjs` passed pending Escape (focus returned, busy cleared, no late open) and actual `WEBGL_lose_context` (fallback, busy cleared, no late open), with no page exceptions. Chromium used SwiftShader and reduced motion. These are intermediate results on a changing tree; rerun after final handoff and production browser QA. They do not establish all texture ownership, double-disposal behavior, or task timing.

Reproduce: `node --experimental-strip-types docs/pr/project-shelf-smoothness/isolated-server.cjs`, then `node docs/pr/project-shelf-smoothness/isolated-lifecycle.cjs` and `node docs/pr/project-shelf-smoothness/isolated-cancellation.cjs`. Stop the isolated server afterward. The shim observes the scene as last rendered, so zero recorded references is not exhaustive proof for detached materials.

## After implementation: production run (final tree, Task 3)

Branch perf/project-shelf-smoothness, working tree at QA time. Chromium + ANGLE SwiftShader (software renderer): diagnostic only, no device-FPS claim.

Gates (serial): `check-project-shelf.mjs` exit 0 (16/16 ok); `npm run lint` 0; `npx tsc --noEmit` 0; `npm run build` 0; `npm audit --omit=dev --audit-level=high` 0 (0 vulns). package-lock.json hash unchanged by QA.

Probe: `qa-probe.cjs` (BASE/TIER/DPR/MOBILE/REDUCED env). Results: `after-high-dpr1-results.json`, `after-mobile-low-dpr2-results.json`; reduced-motion run was cut short (`after-high-reduced-partial.json`, 13 checks passed, no fail, incomplete); high DPR2 run cut (first, pre-fix-of-probe run only: warm/cold/escape checks passed). Both complete configs ended FATAL in the probe's last phase (see below), so neither is a blanket pass.

| Check | high DPR1 | mobile low DPR2 |
| --- | --- | --- |
| Idle: no draws after load / resize | pass | pass |
| Prewarmed open and same-book reopen: 0 detail canvases, 0 uploads, 0 texture creations | pass | pass |
| Page turns: 0 canvases/uploads | pass | pass |
| Close returns focus to Open; Escape and keyboard Enter/Escape focus | pass | pass |
| Cold other-book: Preparing + aria-busy shown synchronously; 11 canvases, 1 per rAF task | pass | pass |
| Switch book evicts previous set (11 textures deleted, 11 re-created) | pass | pass |
| Escape during prep: cancelled, busy cleared, focus on Open, never opens later | pass | pass |
| Reselect while pending never opens stale book | pass | pass |
| Resize: 0 same-value canvas resets; buffer = CSS x DPR | pass | pass |
| Triple activation coalesces (<=11 canvases) | FAIL 12 | FAIL 19 |
| Injected upload failure | probe bug, not exercised | probe bug, not exercised |

Triage:
- Triple activation 12/19 canvases: counted from phase start, includes canvases of a speculative/dropped job for a book passed during marker scroll before the 11-canvas set. Not proven product bug; not proven benign (evidence gap, no ticket).
- Injected failure: probe hooked `texImage2D`, but three.js WebGL2 uploads via `texStorage2D`/`texSubImage2D`, so nothing threw (`thrown:0`); the later FATAL click is cascade from the book having opened. A second hand probe (`texSubImage2D`) threw once but hit speculative prep, and the open then succeeded. The user-facing failure path is NOT verified in a production browser; only the earlier isolated shim run covered it.
- Scroll idle-draw / DPR2 rest-ratio fails seen in the first run were probe timeouts (SwiftShader frame ~2 s while shelf damps, fixed sleeps too short); the rerun with poll-until-quiet passed idle checks (high DPR1). DPR2 rest ratio not re-verified (run cut).

Prep tasks >= 50 ms (high tier, one rAF task each): 68.1, 64.6, 64.3, 62.8, 44-64 ms for the 1024x1536 back/endpaper units; all others 13-30 ms. Initial scene upload task 1761 ms at startup (not detail prep). Per-task target <50 ms is missed on those units.

Latency note (SwiftShader, same sequence select book 4 -> wait 2.5 s -> Open): baseline a6b87b2 click to detail-ready 49.6 s / 50.2 s; branch 37.7 s / 34.0 s. Frames take ~2 s each while the shelf damps, so both are frame-bound; prep is rAF-gated (>= 11 frames). With an idle scene one run measured all 11 canvases in 0.64 s. No physical-device numbers.

Not verified: reduced-motion full pass, DPR2 full pass, real GPU/device behaviour, persistent-failure retry storm (hover after a failed prewarm re-triggers prep via `frame` -> `prepareSettledBook`; code-reading only), scroll during Preparing (updateSelection is suppressed while `preparingId` is set, so the opened book can differ from the shelf's scrolled position; code-reading only).

Screenshots (sharp rest): `after-desktop-shelf-rest-high-dpr1.png`, `after-desktop-detail-rest-high-dpr1.png`, `after-desktop-page-turn-high-dpr1.png`, `after-mobile-shelf-rest-low-dpr2.png`, `after-mobile-detail-rest-low-dpr2.png`, `after-mobile-page-turn-low-dpr2.png`. Interaction GIF: not regenerated for the final tree; `interaction.gif` is from the earlier baseline.

## Retest of ticket 01 fix (HEAD 305b0f8)

Fresh `npm run build` (exit 0), one fresh production server on a free localhost port, stopped afterwards. High tier, desktop 1280x800, DPR 1, normal motion, Chromium on SwiftShader (software renderer; diagnostic only, no device-FPS claim). Probe: `qa-retest-01.cjs`; logs and JSON: `after-retest-01-r1r3.*` (R1/R3) and `after-retest-01-r2-regression.*` (R2 and regression). package-lock.json hash unchanged.

| Item | Result | Evidence |
| --- | --- | --- |
| R1 persistent upload failure: no per-frame retry | pass | Fault injected so every detail upload throws. Settled speculative prewarm made 1 attempt (1 canvas, 1 throw). 23 hover and resize frames afterwards: 0 new canvases, 0 new throws. |
| R1 user Open: one attempt per click, announces failure, shelf usable | pass | Each Open click made exactly 1 attempt (1 canvas, 1 throw). The button returned to "Open" with aria-busy cleared, the live region said "Could not prepare 911 OPERATOR ASSISTANT. The shelf is still available.", and the book did not open. 23 frames afterwards: 0 new canvases. A second click retried exactly once more. A marker click still selected a book. With the fault removed, Open succeeded. |
| R3 Escape during Preparing | pass | After Escape, 20 driven frames created 0 canvases. The book did not open, Preparing was cleared, and the button read "Open". Prewarm resumed after the selection changed (11 new canvases). |
| R2 page scroll moves selection during Preparing | pass | Open clicked, then page scrolled so the selection moved from 911 Operator Assistant to LLM Chatbot in the same task. The book did not open, Preparing was cleared, and the button read "Open". Marker reselect during Preparing: same outcome. |
| Regression: prewarmed open and same-book reopen | pass | 0 canvases, 0 uploads, 0 texture creations on both. |
| Regression: idle draw-stop | pass | 0 draws over 4 s. |
| Page errors | none | The only console error was a 404 for `/_vercel/insights/script.js`, which does not exist off Vercel. |

Probe corrections made while retesting (probe bugs, not product): (1) hooking `texImage2D`/`texSubImage2D`/`texStorage2D` does not inject a failure, because three's WebGLState catches those errors and logs them. All 11 units then "succeed" with blank textures. (2) Throwing in `createTexture` also breaks the main render loop (`usedTimes` of undefined). The valid injection is `generateMipmap`, which is called only while a detail canvas uploads. (3) A wheel scroll over the scene moves the page but not the selection, so opening the prepared book there was correct. R2 needs a scroll that changes the selection.

Minor observation (not a defect against the ticket): after R2 or Escape cancels a pending Open, the live region keeps its stale text "Preparing <title>." until the next announcement. Escape announces "Preparation cancelled.", but the page-scroll cancel path announces nothing.

Evidence gaps: DPR2, mobile and reduced-motion were not retested after the fix (the earlier results predate it). The injection fails at `generateMipmap` and not at the real upload API, so a failure inside `texSubImage2D` that three swallows is untested. No physical-device timing.

Screenshots (final tree): `after-desktop-{shelf-rest,detail-rest,page-turn}-high-dpr1.png`, `after-mobile-{shelf-rest,detail-rest,page-turn}-low-dpr2.png`. `interaction.gif` is regenerated from the desktop after-* stills (shelf, open book, page turned); it is a still sequence and not a performance metric.
