# Project Shelf Clarity Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` inline in your assigned terminal. The user explicitly prohibits nested subagents. The lead owns commits, image generation, push, and PR creation. QA owns Playwright testing and browser evidence.

**Goal:** Make the existing 3D project books sharp and give all nine covers matching project-specific illustrations.

**Architecture:** Keep the existing Three.js engine and React wrapper. Separate illustrated cover artwork from original project screenshots. Improve rasterization and canvas density without expanding the shelf's feature set or retaining unbounded high-resolution detail textures.

**Tech Stack:** Next.js, React, Three.js, TypeScript, Node assertions, existing Sharp, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-10-29-project-shelf-clarity-design.md`

## Global Constraints

- Work in `/home/khoido/Developer/portfolio`, branch `debug/project-shelf-clarity`.
- Frontend: Cursor `grok-4.7-medium`, Run Everything, trusted project. QA: Codex `gpt-6.1-terra`, medium effort; no product edits, but testing scripts, reports, and browser evidence are allowed.
- Execute inline; no nested agents, independent worktrees, refactoring campaign, or new application dependencies.
- Preserve existing project content, navigation, keyboard support, fallback, page turns, visibility gating, and render-on-demand.
- Preserve the pre-existing `package-lock.json` edit. Do not stage, revert, or include it in a commit.
- Lead generates nine real raster illustrations with imagegen; do not substitute procedural/SVG placeholders.
- Use charcoal, warm orange, cream, subtle grain, consistent lighting and composition; artwork has no text, logos, or fake product UI.
- Generated artwork paths: `/projects/shelf/covers/<existing-project-slug>.webp`, all nine slugs already produced by `buildShelfBooks`.
- Original `projects[].image` values remain the screenshot sources. Generated cover sources must not replace original assets.
- Do not push main, merge, or deploy. Open a reviewable PR after checks pass; user reviews later.

## Review Focus

- Low-tier and high-DPR devices: books remain readable with bounded GPU memory.
- Idle gaps and short slow periods: resolution does not ratchet down permanently or trigger a continuous idle animation.
- Missing generated artwork or screenshot: loading completes and the book remains usable with a fallback.
- Switching among all nine books: detail textures are released/reused safely; no disposed texture remains in an active material.
- Wide and square screenshot sources: complete content remains framed, and page turns, touch scrolling, keyboard controls, and reset still work.

## Task 1: Cover art production — lead

**Files:** Create `public/projects/shelf/covers/*.webp`; record prompts/provenance in `docs/pr/projects-shelf-clarity/artwork.md`.

**Interfaces:** Produces nine landscape WebP images matching the slugs from `buildShelfBooks`, at least 1536 pixels wide when supported by the generator; never upscale a smaller output and claim additional detail.

- [x] Generate a separate illustration per project using the subjects in the spec and one shared art direction.
- [x] Visually inspect anatomy, framing, coherence, absence of generated text, and project relevance.
- [x] Optimize with existing Sharp; check dimensions and all nine file paths. Preserve originals. Native generator output is 1448 × 1086; preserve it without upscaling. Nine WebP assets total 1,033,380 bytes.

## Task 2: Sharp textures and distinct image sources — frontend

**Files:** Modify `src/components/portfolio/project-shelf/shelf-engine.ts`; create `scripts/check-project-shelf.mjs` for focused regression checks. Modify `src/data/portfolio.ts` only if existing screenshot metadata requires it; prefer consuming its existing `image` field.

**Interfaces:** `buildShelfBooks(projects)` retains existing consumers and adds an explicit original screenshot source alongside the generated cover source. Public engine initialization and cleanup signatures remain unchanged.

- [x] Read every caller of the touched functions and the spec. Load `superpowers:executing-plans`, `superpowers:test-driven-development`, and `superpowers:systematic-debugging` as needed. Keep a concise execution ledger in this plan's `.superpowers` workspace.
- [x] First write and run failing Node assertion checks for all nine cover/screenshot mappings, distinct source routing, texture dimensions, non-destructive screenshot framing, and missing-image fallback. Use installed TypeScript transpilation or Node-supported modules; do not add a test framework.
- [x] Implement minimal explicit mappings and separate loaded cover/screenshot images. Use existing original images for interior plates, generated assets for covers, and motif fallback when unavailable. Preserve startup/disposal handling and avoid redundant uploads.
- [x] Target cover/foil textures around 1024 × 1536 on high and 768 × 1152 on low; interior textures around 768 × 1152 on high and 512 × 768 on low. Adjust only with a recorded memory/readability reason. Keep detail creation lazy and bound regenerated detail resources to the inspected book where necessary.
- [x] Frame full screenshots consistently with preserved aspect ratio. Avoid the current repeated destructive crop for interface/detail pages; reuse a source honestly when only one exists.
- [x] Re-run the checks to green; run `npm run lint` and `npx tsc --noEmit`. Record actual outputs. Expected: checks pass, no new lint/type errors.

## Task 3: Recoverable canvas density — frontend

**Files:** Modify `src/components/portfolio/project-shelf/shelf-engine.ts`; extend `scripts/check-project-shelf.mjs`.

**Interfaces:** Retain forced `?shelf-quality=low|high` testing. Preserve render-on-demand, visibility gating, resize, and reduced-motion behavior.

- [x] Add failing checks for temporary slow frames followed by fast frames or idle settle, long idle frame gaps, resize, and low-tier density bounds. Assert that visual density can recover and idle state does not schedule endless frames.
- [x] Implement bounded high-density rendering, using device density up to a reasonable cap (target 2), and recover detail after temporary slowdowns. Base adaptation on consecutive animation work, not idle gaps. Preserve cheaper lighting/shadows on weaker devices without forcing tiny page textures.
- [x] Run checks to green, lint, and type checking. Review the diff for new loops, unbounded GPU allocations, missing cleanup, or unrelated changes.
- [x] Report changed files, commands/results, rulings, and remaining concerns to the lead. Do not commit or push; the lead owns Git operations.

## Task 4: Independent QA — qa worker

**Files:** Read final engine, checks, art, spec, plan, and connected consumers. Create reproducible browser test scripts, QA reports, PNG screenshots, and a GIF under `docs/pr/projects-shelf-clarity/`. Do not modify product files.

**Interfaces:** Frontend completion triggers full review and browser QA. Lead supplies nine generated images and reports when all assets are ready. QA remains inline and uses no nested subagents.

- [x] Before frontend completion, inspect acceptance conditions and establish existing lint/type/build baseline. Avoid concurrent builds while frontend is building.
- [x] After handoff, inspect the whole task diff and connected code, not only tests. Run `node --experimental-strip-types scripts/check-project-shelf.mjs`, `npm run lint`, and `npx tsc --noEmit`. Check each Review Focus item explicitly.
- [x] Report severity, exact path/line, user impact, and smallest fix for each actionable finding; distinguish pre-existing issues.
- [x] Own Playwright CLI testing: install temporary browser tooling outside application dependencies if needed, run the app locally, and coordinate with frontend to avoid overlapping builds.
- [x] Exercise shelf, inspect/open/close, next/previous pages, all nine projects, reset, keyboard and mobile behavior at desktop high-DPR and mobile sizes, plus low-tier mode. Check missing images, WebGL/browser errors, idle rendering, adaptive resolution recovery, and bounded texture memory.
- [x] Capture desktop/mobile PNG screenshots and a short GIF when available. Inspect captures visually and save reproducible tests and actual results in `docs/pr/projects-shelf-clarity/`. Do not claim final visual approval before the lead's artwork is ready.
- [x] Gate: no unresolved critical or important finding. Lead routes required fixes to frontend and verifies their focused regression checks.

## Task 5: Final verification and delivery — lead

**Files:** Review QA's reproducible browser checks and PNG/GIF evidence under `docs/pr/projects-shelf-clarity/`; update artwork provenance and test notes.

- [x] Review QA's Playwright results, desktop/mobile screenshots, and GIF. Confirm captures use the final generated art and record performance/readability limits honestly.
- [x] Fix blocking defects with focused regression proof. Run the final focused checks, lint, TypeScript check, and production build. Record failures rather than declaring a pass.
- [x] Stage task files explicitly, excluding the user's lockfile edit; commit local work.
- [ ] Push `debug/project-shelf-clarity` after GitHub authentication is available.
- [ ] Create a PR to `main` with the problem, resulting behavior, checks, image evidence, and material limits. Requires a working GitHub login; never claim a PR exists without its returned URL. Do not merge.

## Delivery status

Local implementation, scoped QA, PNG captures, and a labeled reduced-motion GIF walkthrough are complete. Production build passed on retry after the existing Next.js security notice. Whole-page console validation still reports the baseline hydration warning, and the existing critical dependency audit fails. Push and PR creation remain pending GitHub authentication. No merge or deployment.
