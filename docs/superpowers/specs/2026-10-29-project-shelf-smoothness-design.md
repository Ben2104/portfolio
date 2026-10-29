# Smooth 3D project shelf

Status: approved by the user on 2026-10-29; implementation authorized.

Builder check: the existing Codex QA worker independently reviewed the design against the engine and reported "nothing important left." Review ran inline in Herdr, honoring the user's no-subagent preference.

## Intent and chosen approach

Recruiters should browse and inspect projects promptly while keeping the existing 3D shelf, book opening, page turns, and sharp coordinated artwork. The user selected approach 1: optimize the full 3D experience.

Alternatives discussed:

1. **Selected: optimize the existing Three.js engine.** Retain its visual identity and interactions; remove repeated preparation, bound resource use, and reduce motion rendering cost. Hardware still limits achievable frame rate.
2. **HTML project reading with a 3D shelf.** Offers greater rendering headroom but loses part of the book interaction. Not selected.

No engine rewrite, new dependencies, new artwork, unrelated section changes, or all-book texture preloading. Preserve the user's existing package-lock.json changes.

## Evidence and limits

Baseline: main a6b87b2, local Next.js production build, normal motion, 1280x800 viewport. QA used Chromium with SwiftShader software rendering; these are diagnostic observations, not physical-device frame-rate claims.

- Every inspect generated 11 canvases and uploaded 11 textures. Closing disposes them, including before reopening the same book. High-tier synchronous opening handlers took approximately 38 ms; uploads also recur. These measurements overlap and must not be added.
- Scroll rendered approximately 102 draw calls per callback at low quality and 127 at high quality. DPR 2 requires four times the drawing-buffer pixels of DPR 1 at the same CSS size.
- Transition progress uses the physics delta capped at 50 ms. Below 20 FPS this stretches its nominal duration; it amplifies slow rendering.
- No inspect-time shader compilation or interaction-time drawing-buffer resize was observed. They are not established causes of the measured stalls.
- Existing rendering already stops when idle. Preserve that behavior.

Original diagnostic captures currently live in /tmp/portfolio-shelf-qa. Implementation QA must save a concise baseline and before/after evidence under docs/pr/project-shelf-smoothness so results remain reviewable.

## Resource preparation and ownership

Replace synchronous all-at-once detail preparation with a cancellable sequence of small tasks. Split the existing eight-page batch so yielding between individual page textures is real. Generate and initialize uploads incrementally using the existing renderer; do not merely move all work into one requestAnimationFrame callback. Start speculative preparation only when the shelf is ready and the selected book is settled. Coalesce selection changes so scrolling does not prepare every passing book.

Keep at most one prepared detail set, including during preparation. Closing retains the last inspected set. Reopening it performs no new detail canvas generation or texture uploads. Preparing another selection evicts the retained set first; the active book must never be evicted while inspected. Do not prepare other books during inspection or transition. Existing shared paper/cloth resources must retain separate ownership.

For a cold inspection, acknowledge the action immediately and expose a short accessible preparing state. Begin the book transition only when its necessary textures are ready; do not reveal blank pages or start an animation behind a blocking preparation task. Repeated activation coalesces, dismissal cancels pending entry, and stale tasks must not attach resources or reopen a dismissed book. Preparation failure clears the pending state and preserves a usable shelf/fallback rather than stranding focus or an inert interface. Existing selection, keyboard, Escape, focus return, live-region announcements, and reduced-motion behavior remain usable.

Single-book high-tier detail textures are estimated at roughly 56.5 MiB of RGBA8 mipmapped storage, excluding other scene assets. This is an estimate, not a VRAM measurement. Retention trades bounded memory for faster repeat inspection; teardown disposes retained and partially prepared owned resources and cancels queued work.

## Motion rendering and timing

Retain existing source images and texture dimensions. At rest, restore the current device/tier pixel-density cap and render the final sharp frame. During continuous motion, start with a conservative density cap no higher than 1.5, never exceeding the device/tier cap, then allow measured pressure to reduce density using the existing floor. This numeric motion cap is the lead's proposed default, subject to visual QA. Use hysteresis and bounded settling so rapid input does not repeatedly allocate full-size buffers.

Make renderer sizing use a single consistent path that avoids resetting unchanged dimensions and the current redundant setPixelRatio/setSize sequence. Always resize before painting; never clear the final settled frame without repainting. Do not add a perpetual idle loop.

Use elapsed monotonic time from each opening/closing transition's own start for transition progress. Keep capped deltas for physical settling/page deformation. Idle time before an interaction must not advance its new transition; a delayed frame must catch up instead of stretching the whole sequence. Preserve reduced-motion immediate completion. A hidden-tab resume may complete an elapsed transition rather than replay it slowly.

Do not introduce speculative material, lighting, geometry, or shadow redesigns in this pass. If the measured result still misses the goal, report the remaining rendering bottleneck before widening scope.

## Acceptance and verification

Frontend implementation and QA run inline in the existing Herdr workers tab: Cursor Grok 4.7 medium owns frontend changes; Codex GPT-6.1 Terra medium owns independent review and Playwright verification. Neither creates nested subagents. Write the implementation plan only after this design is approved.

Required evidence:

- Compare baseline and changed production builds using the same browser, renderer, viewport, quality tier, DPR, and normal-motion interaction sequence. Cover high DPR 1 and 2, a low-tier/mobile case, cold inspect, warm same-book reopen, different-book inspect, rapid selection/dismissal, page turns, and close.
- Warm reopen creates zero new detail canvases/uploads. Cold preparation yields between units; report handler, preparation task, and upload timings separately. Target each preparation task below 50 ms in the controlled environment; report any misses rather than calling them passed. Browser/GPU calls cannot promise a universal time bound.
- At most one detail set is retained or in progress. Switching projects and unmounting release owned resources; cancellation/failure cannot publish stale content. Verify without relying solely on a screenshot or a texture-count snapshot.
- A deterministic clock check demonstrates opening/closing duration does not multiply at 5-10 FPS, and an idle gap cannot instantly finish a newly started transition.
- Density checks prove device/tier bounds, final sharp-frame restoration, bounded redraw scheduling, and no unchanged-size canvas resets. Existing clarity/ownership checks must remain meaningful and be updated for the approved retention policy.
- Browser checks cover keyboard navigation, focus return, Escape during pending preparation, reduced motion, resize, and teardown. Record normal-motion screenshots and an interaction GIF; a GIF documents appearance, not frame-rate performance.
- Run focused shelf checks, lint, TypeScript, production build, and applicable repository CI. QA reviews the final diff independently. Preserve pre-existing unrelated warnings separately from regressions.

Success means removing the confirmed repeated work and demonstrating improved interaction traces without losing sharp settled artwork or book behavior. Physical-device 60 FPS is not a sign-off claim until measured on an identified physical device. User browser/device remains unspecified.

## Delivery and authorization

Work branch: perf/project-shelf-smoothness, based on the pulled main merge. After design approval, produce the inline task plan, dispatch frontend implementation, then independent QA/review and browser evidence. Existing user authorization covers pushing a review PR and checking CI; do not merge or deploy manually. No credentials, paid services, or new permissions are required by this design.

## Technical references

- [Three.js renderer: initTexture and renderer controls](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js responsive rendering and drawing-buffer size](https://threejs.org/manual/pages/responsive.html)
- [Three.js resource cleanup](https://threejs.org/manual/pages/cleanup.html)
- [web.dev: splitting long tasks](https://web.dev/articles/optimize-long-tasks)
