# Project Shelf Smoothness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. User requires inline execution in existing Herdr panes; no nested subagents.

**Goal:** Preserve the sharp, fully interactive 3D books while removing repeated preparation and reducing motion cost.

**Architecture:** Keep the existing imperative Three.js engine. Stage detail generation/upload as cancellable per-texture tasks, retain one prepared book, and separate transition wall time from capped physics deltas. Keep adaptive motion density with a sharp settled frame.

**Tech Stack:** Next.js 16.4.3, React 19, Three.js 0.180, TypeScript, Node assert checks, existing Playwright tooling.

**Spec:** docs/superpowers/specs/2026-10-29-project-shelf-smoothness-design.md

## Global Constraints

- Full 3D shelf, opening, page turns, artwork dimensions, accessibility, and reduced motion remain.
- No new dependencies, new art, engine rewrite, unrelated changes, or all-book preparation.
- At most one prepared/in-progress detail set; never evict the inspected book.
- Motion density cap 1.5, bounded by device/tier; restore original cap when settled; no idle render loop.
- Preserve the unrelated 60-line package-lock.json deletion exactly. Do not stage this file.
- Work branch perf/project-shelf-smoothness. Existing shared checkout intentionally retained for native Herdr workers; do not switch branches or create a competing checkout.
- Frontend: existing Cursor frontend pane, Grok 4.7 medium, inline. QA: existing qa-engineer pane, Codex GPT-6.1 Terra medium, inline. No nested agents.
- User approved spec and specified execution method. Proceed through implementation, independent QA, review PR, and CI without another permission round. Never merge.

## Review Focus

- Rapid selection/cold-open/Escape: stale work must not attach textures, reopen a dismissed book, or strand focus (Task 1).
- Partial preparation/upload failure or unmount: all owned resources freed once, shared textures preserved, retry usable (Task 1).
- Hidden tab or long idle: new transitions start at zero, elapsed transitions catch up, physics stays bounded (Task 2).
- Short repeated input and resize at high DPR: bounded buffer changes, final crisp repaint, no continuous idle frames (Task 2).
- Normal versus reduced motion, keyboard and touch: current book/page controls and readable fallback remain usable (Task 3).

## Files and ownership

- Frontend modifies src/components/portfolio/project-shelf/shelf-engine.ts; modify shelf.css/project-shelf.tsx only if needed for the approved preparing state.
- Extend scripts/check-project-shelf.mjs with deterministic behavior checks. Prefer existing exports/patterns; small testable helpers in the engine are permitted, no generic framework.
- QA owns docs/pr/project-shelf-smoothness/: reproducible browser probe, baseline/results, screenshots, GIF, and review findings. Temporary browser dependencies already available under /tmp/portfolio-shelf-qa; do not add npm dependencies.
- Both workers update only their task checkboxes/evidence; lead owns plan/spec, final commits, PR, and CI triage. Only one worker edits product code at a time.

### Task 1: Cancellable preparation and one-book retention — frontend

**Files:** engine, focused shelf checks; minimal preparing-state UI/CSS if required.

**Interfaces:** Preserve createShelf({root, section, books}) => cleanup and existing book/control selectors. Split makeInteriorPageTextures into per-page creation. Introduce a small internal preparation controller with prepare(rig), cancel(), and dispose() lifecycle; controller may be an exported helper if necessary for deterministic dependency-injected tests. Existing releaseShelfDetails keeps owned/shared separation; retention policy changes from no closed details to one recent set.

- [x] Read spec, engine callers, existing disposal checks, and installed Next.js guide relevant to any changed React code. Read executing-plans and test-driven-development; keep a progress ledger under this plan's .superpowers/sdd workspace.
- [x] Add failing assertions: warm reopen causes zero new creation/uploads; switching releases previous set; selection replacement and cancellation prevent stale attachment; partial failure/teardown dispose only owned resources exactly once and permit retry. Use a fake scheduler/uploader/disposer to exercise actual preparation control flow, not source-text assertions.
- [x] Run node --experimental-strip-types scripts/check-project-shelf.mjs and record the expected failing assertions.
- [x] Implement staging: one texture generation plus renderer.initTexture per scheduled task, yielding between textures including each interior page. Debounce preparation of a settled selected book; cancel obsolete work. Keep at most one retained/in-progress set and preserve active details. Remove close-time blanket disposal in favor of bounded retention.
- [x] Implement cold-open acknowledgement using existing Open button/live region: preparing state, coalesced activation, Escape cancellation, safe failure recovery. Enter opening only when ready, without blank-page flash. Guard unmount, context loss, replacement, and late callbacks. Preserve focus return and reduced motion.
- [x] Run focused checks to green, npm run lint, npx tsc --noEmit. Record commands/results and meaningful decisions in ledger. Leave reviewed task diff ready for lead; do not push or stage user lockfile.

### Task 2: Motion density and wall-clock transitions — frontend

**Files:** engine; focused shelf checks.

**Interfaces:** Existing commitShelfFrame still sizes before render and schedules bounded redraws. Add explicit motion-start density handling while preserving final cap. Transition progress consumes its own start timestamp and current monotonic timestamp; physics still receives capped delta.

- [x] Add failing checks: motion cap <=1.5/device/tier, no repeated full-cap bounce during continuing motion, final cap restored with bounded scheduling, unchanged dimensions do not reset canvas; new transition after idle starts at zero; simulated 100/200 ms frames reach nominal duration within one frame rather than multiplying duration.
- [x] Run focused checks and record expected failures.
- [x] Implement conservative motion entry and existing adaptive pressure with stable restoration. Consolidate actual drawing-buffer sizing to avoid duplicate setPixelRatio/setSize or unchanged assignments; preserve CSS sizing, resize-before-render, and final sharp frame.
- [x] Track opening/closing start separately from lastTime. Apply wall elapsed progress, preserve capped page/physics settling, and reduced-motion completion. Verify hidden/offscreen resume behavior does not require a perpetual loop.
- [x] Run focused checks, lint, types; record outcomes. Hand complete Tasks 1-2 to lead and QA with exact changed files, commands, and limitations. Do not commit until lead inspects scope unless lead explicitly requests a task commit.

### Task 3: Independent review and production Playwright evidence — QA

**Files:** docs/pr/project-shelf-smoothness/qa-results.md, reproducible probe script, screenshots/GIF; no product edits during review.

**Interfaces:** Tasks 1-2 keep existing selectors/API. Reuse baseline scripts /tmp/portfolio-shelf-qa/perf.cjs and perf-high.cjs where suitable; fix their limitations explicitly. No build/server overlap with frontend.

- [x] While frontend works, prepare the controlled QA sequence and persist the existing a6b87b2 baseline and renderer caveats. Read spec/plan; do not start competing builds or edit product files.
- [ ] After frontend handoff, review the complete branch against main and inspect actual cancellation/ownership/clock code. Report ranked actionable defects with file/line and reproducer; label evidence gaps separately. Do not approve from tests alone.
- [ ] Run focused checks, npm run lint, npx tsc --noEmit, npm run build, npm audit --omit=dev --audit-level=high. Serial build/types to avoid generated-file races. Record exit statuses and any pre-existing warnings. Use current source, no stale production bundle.
- [ ] Start production server on free localhost port. Use Playwright CLI where available plus browser instrumentation for metrics. Normal motion: high DPR1/DPR2 and mobile/low. Test cold open, same-book reopen, other book, rapid select/Escape, page turns, close/focus return, keyboard, reduced motion, viewport resize, idle draw-stop, and actual teardown (using isolated harness if needed). Exercise preparation failure with a controlled injected failure; no permanent product fault switch.
- [ ] Capture comparable texture creation/upload counts, preparation-task durations, event timing separately, draw/buffer assignments, and bounded retention/release. Assert warm reopen zero detail allocations/uploads; distinguish initial raster tasks from GPU API time and delayed observer entries. Disclose any preparation tasks >=50ms and any unverified hardware limits. Software-rendered results cannot claim physical-device FPS.
- [ ] Save desktop/mobile sharp-rest screenshots and normal-motion interaction GIF. A GIF is visual evidence, not a performance metric. Stop owned server. Send lead exact results and blockers, not a blanket pass if acceptance is incomplete.

### Task 4: Fix review findings, publish PR, verify CI — lead + workers

**Files:** limited to approved implementation, checks, plan/spec, and QA evidence.

- [ ] Lead inspects complete diff against a6b87b2 and validates user lockfile unchanged. Frontend addresses important QA findings with a reproducing failing check, minimal fix, and green checks; QA rechecks affected paths. No speculative redesign if GPU cost remains.
- [ ] Lead runs focused checks and reads complete QA output. Confirm spec acceptance item by item, including limitations. Mark task checkboxes only with supporting evidence.
- [ ] Commit explicit files, excluding package-lock.json and generated unrelated files. Use git diff --cached --check before commit. Identity can be git -c user.name=Codex -c user.email=codex@openai.com.
- [ ] Push perf/project-shelf-smoothness and create GitHub PR against main. Body describes confirmed causes, behavior, before/after evidence, tests, and remaining software-renderer limitations. Use a temporary --body-file for multiline text.
- [ ] Watch all required CI checks to completion. Diagnose/fix actual failures, rerun appropriate local gates and push, then verify the new head's checks. Report PR link and truthful acceptance/CI state. Do not merge or manually deploy.

## Execution record

Plan self-review: spec resource, timing, rendering, accessibility, QA evidence, and delivery requirements map to Tasks 1-4. Tests target the five review risks above. Existing Herdr workers execute continuously inline under the user's approved method.

Lead verification: all 16 focused checks passed after review corrections. Final prewarm gating uses real position/target and drag state; preparation begins on the final settled frame and stale speculative work is cancelled during input. Independent production/browser verification is in progress.
