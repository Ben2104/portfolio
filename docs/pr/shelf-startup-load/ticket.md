# Ticket: shelf startup waits for ~6.5 MB of originals

Reported by user: production shows "Binding the collection" for a long time.

## Cause (read from code, not yet measured)
src/components/portfolio/project-shelf/shelf-engine.ts `initialize()` (~4180): `loading.hidden` only flips after `Promise.all` loads the wood texture plus every book's cover and screenshot (full-size originals under public/projects, about 6.5 MB; the largest are shape&sign.png 1.7 MB, pickleball_bot.png 1.5 MB, material-enhancement-assistant.png 1.4 MB). Per book, cover and screenshot load one after the other (`await cover` then `await screenshot`). A `shortcut:` comment already flags this. PR #29 did not change this path.

## Work (in this order, stop if a step gives enough)
1. Measure first: with Playwright (deps in /tmp/portfolio-shelf-qa) on a production build, throttle to a Regular 4G profile (about 9 Mbit/s, 170 ms RTT) and record time from navigation to `.webgl-ready` and total image bytes. Save to docs/pr/shelf-startup-load/baseline.json.
2. Load each book's cover and screenshot in parallel (not sequentially).
3. Do not block the first render on all nine books. Show the shelf once the wood texture and the first visible books are loaded; load the rest in the background and apply their textures when they arrive. Books without their image yet must still render (cover colour or the existing empty-cover fallback) and must pick the image up without a reload. Preserve the existing disposal and failure behaviour for missing images.
4. Shrink the assets: convert the large PNGs to WebP at the largest size the shelf actually samples (check the texture sizes in shelf-engine.ts before choosing dimensions; keep the cover/screenshot framing check in scripts/check-project-shelf.mjs green). Update paths in src/data/portfolio.ts. Keep originals only if something else references them. Tool: use whatever is already installed (sharp via node_modules, or cwebp). Do not add npm dependencies.
5. Re-measure with the same throttle; save after.json. Report bytes and time before and after.

## Rules
Branch: perf/shelf-startup-load (already created, stacked on perf/project-shelf-smoothness). Failing check first for any logic change (extend scripts/check-project-shelf.mjs). Run the shelf checks, npm run lint, npx tsc --noEmit. Do not touch package-lock.json. No commit and no push; report to lead.
