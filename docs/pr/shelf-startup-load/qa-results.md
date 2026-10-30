# Shelf startup-load QA results

Branch `perf/shelf-startup-load`, HEAD 24791e0 ("perf: show the shelf after the first visible books load").
One fresh `npm run build` (exit 0), one production server on a free local port, stopped afterwards. No product files edited. `package-lock.json` sha256 unchanged (940047f9...e258).

## Software-renderer caveat

All runs used Playwright Chromium with SwiftShader (software WebGL) at 1280x800, DPR 1. Timings are diagnostic. They say nothing about frame rate or GPU upload cost on a real device. The network throttle (CDP, about 9 Mbit/s, 170 ms latency, cache disabled) is real at the network layer, but "ready" time also includes software-rendered scene setup.

## Results

| # | Item | Result |
|---|------|--------|
| 1 | Throttled load to `.pshelf.webgl-ready`, image bytes, no `/projects/*.png` | PASS |
| 2 | Deferred covers (books 4-9) applied, none blank or colour-only | PASS |
| 3 | Plate pages 3 and 7, first book and a deferred book | PASS |
| 4 | Race: open deferred book before its screenshot arrives | PASS |
| 5 | Missing plate image (visible book and deferred book) | PASS |
| 6 | Regression: warm reopen, idle draw-stop, no page errors | PASS |
| - | Video | load.webm recorded; GIF not made (gap) |

### 1. Throttled load

Two fresh throttled loads: ready at 7377 ms and 7496 ms. 65 image requests, 2,289,737 encoded bytes in total (CDP `encodedDataLength`, includes headers); 1,383,072 of that under `/projects/shelf`. Zero `/projects/*.png` requests. Zero requests pending at ready check.
This reproduces the committed `after.json` (7428 ms, 2,189,621 bytes). The committed `baseline.json` (14,208 ms, 65 images, 8,738,679 bytes) was NOT reproduced by me (see gaps), so the "before" side is the lead's number only.

### 2. Deferred covers

Waited for all 19 `/projects/shelf/` images to finish, selected markers 0-8, and screenshotted each (`qa-cover-1..9.png`, contact sheet `qa-covers-sheet.png`). I viewed the sheet: every cover shows artwork, none is blank or a flat colour. Per-screenshot colour standard deviation was 38-44. No page errors.

### 3. Plate pages

Opened the first book and the last (deferred) book, turned to spread 2 (page 3, "PLATE 01 / INTERFACE") and spread 4 (page 7, "PLATE 02 / DETAIL"). All four reached and screenshotted. Viewed: first book spread 2 and deferred book spread 4 show the screenshot sharp, framed and not stretched. The other two (first book spread 4, deferred spread 2) were captured and pass the probe's checks but I did not view them individually.

### 4. Race

The deferred book's plate request was held at the network layer until after the book opened (without the hold, the small WebP files had already arrived by ready, so throttling after ready did not create a window). At open the plate was not finished. `qa-race-before-arrival-spread2.png` shows the motif fallback. After release, `qa-race-after-arrival-spread2.png` and `spread4.png` show the real screenshot, sharp and unstretched, with no reopen needed. No page errors.

### 5. Missing image

Aborted one plate request per case: book 0 (visible at startup) and the last book (deferred). Both: shelf reaches ready, book opens, spreads 2 and 4 turn, no page errors. Screenshots `qa-missing-*.png`. I did not view these images; the probe asserts load, open, page turn and zero page errors only, so I did not verify the fallback look beyond what the race "before" shot shows.

### 6. Regression

Run with the earlier `qa-retest-01.cjs` probe (retry/cancel tests skipped). Desktop DPR 1, quality tier high:
- prewarmed open: 0 canvases, 0 uploads, 0 texture creations
- same-book reopen after page turns: 0 canvases, 0 uploads, 0 texture creations
- idle draw-stop: 0 draws over 4 s (175 and 175)
- the included scroll/reselect stale-open checks pass
- no page errors

## Evidence gaps

- Baseline not reproduced by me. It needs a build of 9196f0b in a separate worktree. Baseline numbers come from `baseline.json` only.
- No GIF. Playwright's bundled ffmpeg has no GIF, JPEG or rawvideo encoder, and system ffmpeg is absent. `load.webm` is the video. It is a throttled software-renderer recording of load, inspect, open, toggle-book and one page turn.
- Only desktop, DPR 1, one browser. No DPR 2, mobile, reduced-motion or real-GPU pass.
- Throttle is one profile. Slower networks, and a deferred cover or screenshot failing (not just a plate), were not tested. Missing-image test covers plates only.
- Three plate and missing-image screenshots not viewed individually (listed above).
- Cover "no blank" check is by eye plus colour variance, not pixel comparison against reference art.

## Reproduce

```
BASE=http://127.0.0.1:PORT PART=1 node docs/pr/shelf-startup-load/qa-startup.cjs   # PART=1..5 or video
BASE=http://127.0.0.1:PORT SKIP_R13=1 OUT=qa-part6.json SHOTS=. node docs/pr/project-shelf-smoothness/qa-retest-01.cjs
```
Playwright deps live in `/tmp/portfolio-shelf-qa`.

## Files

`qa-startup.cjs`, `qa-part1..6.json`, `qa-cover-1..9.png`, `qa-covers-sheet.png`, `qa-plate-{first,deferred}-book-spread{2,4}.png`, `qa-race-before-arrival-spread2.png`, `qa-race-after-arrival-spread{2,4}.png`, `qa-missing-{visible,deferred}-spread{2,4}.png`, `qa-regress-desktop-{shelf-rest,detail-rest,page-turn}-high-dpr1.png`, `load.webm`, `qa-results.md`.
