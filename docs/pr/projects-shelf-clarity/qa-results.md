# Project shelf QA

## Baseline

- Before frontend changes: `npm run lint` passed; `npx tsc --noEmit --incremental false` passed. Build deferred to avoid shared `.next` conflicts.
- `npm audit --omit=dev --audit-level=high` (run by lead) reports one pre-existing critical Next.js dependency finding. Full output: `/tmp/portfolio-shelf-audit.json`; advisories include GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr and GHSA-p3m5-59mp-jv5r. This is a separate CI/security blocker, not a shelf regression.
- All nine generated covers exist at 1448 × 1086; native width is below the 1536 target. Contact sheet inspected; no obvious embedded text. See artwork.md.
- Playwright CLI 1.64.1 screenshot command succeeded after retrying the dev server. Next.js stopped the first dev-server launch to recommend a security upgrade; retry succeeded.
- Before desktop/mobile shelf and detail PNGs captured with Chromium SwiftShader and reduced motion. The first desktop detail attempt without reduced motion timed out after 30 seconds on this software renderer. Mobile capture includes the Next development overlay.

Final scoped shelf results and remaining baseline issues are recorded below.

## Final review and browser evidence

- `node --experimental-strip-types scripts/check-project-shelf.mjs`, `npm run lint`, and `npx tsc --noEmit --incremental false` passed after the density fix. The 30th-fast-frame regression verifies resize, paint, and scheduling order. Code review found no remaining important shelf defect in the reviewed version. DPR changes after initial load were not exercised.
- Chromium reported `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)` with default, current, and `--use-angle=gl` launches. These runs do not establish physical GPU performance. Reduced motion was used for the completed browser runs; normal-motion desktop interaction timed out under this renderer.
- Desktop 1440×900 DPR 2 high tier: WebGL initialized, nine projects opened and closed, page navigation, reset and keyboard selection exercised; idle draw count stopped. Texture objects after each close: 52 each time, peak 63. Settled canvas ratio 2. Desktop run failed its console-error gate on the pre-existing hydration warning below; scoped interactions completed.
- Mobile 390×844 DPR 2 low tier: WebGL initialized, nine projects opened and closed, pages, reset, keyboard selection and CDP touch scrolling exercised; idle draw count stopped. Texture objects after each close: 49 each time, peak 60. Settled canvas ratio 1.2487. No page exceptions; baseline hydration warning remained in console.
- Missing assets: aborting `/projects/**` left WebGL ready and the first book usable, with page turns and reset; no page exceptions. Asset request errors were expected. This test did not inspect all nine missing-art books.
- DPR 1 high tier: actual settled canvas ratio 1. Runtime test did not simulate fast/slow frame sequences or prove the one-frame settle redraw; the focused density check and code review cover those paths.
- The reduced-motion hydration mismatch appeared in the original-engine dev-server log during before captures, before shelf source edits. Its stack identified Navbar and TimelineEntryCard motion styles. The final runs reported the same fingerprint; it is not counted as a shelf regression, but the console gate is not clean. The existing long-title overlap is also visible in before and after captures.
- Cover assets total 1,033,380 bytes; original project visuals total 6,800,512 bytes. Both are eagerly fetched and decoded before shelf readiness; this increases startup transfer and memory on weak devices. Original visuals include screenshots, artwork and photos.
- `desktop-interface.png` shows the Overview/Plate spread with the original project visual. `interaction-reduced-motion.gif` is a labeled 1280×800 screenshot sequence of actual reduced-motion interactions after WebGL readiness; its timing does not represent realtime performance. Captures were visually inspected. The baseline mobile screenshot includes the Next dev overlay.

## Lead verification and delivery

- Final product regression run: all seven checks passed. Whole-repository lint and TypeScript (`npx tsc --noEmit --incremental false`) passed.
- Production build: first `npm run build` compiled and generated pages, then exited 1 for the existing Next.js security upgrade notice. Retrying `npm run build` exited 0, retaining the vulnerability warning. This does not resolve the audit finding or make the CI audit job green.
- Generated `next-env.d.ts` changes were restored; the user's pre-existing `package-lock.json` edit remains excluded from task commits.
- The lead added only a source comment after browser captures to document eager image loading; runtime behavior is unchanged from the captured version.
- No merge or deployment is authorized by this work. Push and PR creation require GitHub authentication, which is absent in this environment.

## Reproduction commands

Start `npm run dev -- --port 3107` without an overlapping build. Install Playwright outside the project, for example `npm install --prefix /tmp/portfolio-shelf-qa playwright` and `/tmp/portfolio-shelf-qa/node_modules/.bin/playwright install chromium`. Run `node docs/pr/projects-shelf-clarity/browser-qa.cjs http://localhost:3107`; set `QA_MODE=desktop`, `mobile`, or `missing` to run one scenario. Markers are activated programmatically; keyboard and touch use browser input.

For the GIF, install Pillow outside the project, e.g. `python3 -m pip install --target /tmp/portfolio-shelf-qa/python pillow`, then run `PYTHONPATH=/tmp/portfolio-shelf-qa/python node docs/pr/projects-shelf-clarity/capture-gif.cjs`. The script captures four interaction states and Pillow assembles the labeled sequence.
