# Astronaut Intro (replaces terminal preloader)

## Context

`src/components/portfolio/terminal-preloader.tsx` renders a Linux-boot CRT
screen on first visit. Two problems drive this replacement:

1. Visitors must click "Click to continue" to reach the site.
2. The boot log is a wall of small text that nobody can read in time.

It also has two structural costs. `portfolio-page.tsx` mounts
`PortfolioContent` only after the boot completes, so the server HTML contains
no portfolio content. And the preloader's `useState` initialiser reads
`sessionStorage`, which the server cannot do, so a returning session renders
differently on the client than on the server.

Nothing heavy loads before the hero (the three.js project shelf loads later),
so this is an intro, not a loader. It must stay short.

## Goals

- No click required. The intro dismisses itself.
- No visible text. One thing to look at.
- Feels like the same world as the site: site background, amber accent,
  the astronaut mascot.
- Portfolio content is server-rendered underneath the intro.
- A visitor can never get stuck on the intro.

## Non-goals

- No real progress measurement. The astronaut frames total about 428K and
  load fast; there is nothing meaningful to measure.
- No monogram, tagline, or log text.
- No new dependencies. No test runner.
- No changes to `AstronautMascot` behaviour.

## Visitor experience

| Time | Screen |
| --- | --- |
| 0ms | Solid `--portfolio-bg` (`#1a1a1a`) with a soft amber radial glow at centre. |
| 0–250ms | Astronaut (`/astronaut/sparkle.webp`) fades in and scales 0.9 → 1 at centre. |
| 250–900ms | Astronaut floats. A thin amber ring draws once around it. |
| 900–1500ms | Astronaut glides and resizes into the hero mascot slot while the overlay fades and the hero text staggers in. |
| 1500ms | Overlay removed. The real `AstronautMascot` is visible, already on its `sparkle` greeting frame. |

- Any `pointerdown`, `keydown`, `wheel`, or `touchstart` during the intro
  starts the exit immediately.
- Shown once per browser session.
- With `prefers-reduced-motion: reduce`, the intro is skipped entirely.
- Screen readers get a single `sr-only` status: "Loading portfolio".
- Page scroll is locked only while the overlay is up.

## Architecture

### `intro-overlay.tsx` (new)

A `fixed inset-0` overlay above everything. It renders its own `<img>` of the
sparkle frame rather than a second `AstronautMascot`, which would mount 18
frames and several window listeners for a 1.5s appearance.

Props: `onExitStart: () => void`, `onComplete: () => void`.

Phases: `holding` → `exiting` → `done`.

- `holding` → `exiting` when all of: component hydrated, 900ms elapsed since
  mount, sparkle image decoded. A skip input forces it immediately.
- On entering `exiting`, the overlay calls `onExitStart`, then performs the
  glide (below) over 600ms while fading its background.
- When the glide ends it writes the session key, calls `onComplete`, and
  renders `null`.

### Glide (manual FLIP)

The hero mascot wrapper carries `data-intro-target`. On exit the overlay reads
that element's `getBoundingClientRect()` and its own astronaut's rect, then
animates a `translate` + `scale` transform from centre to the target.

Chosen over `motion`'s `layoutId` because `layoutId` needs the hero mascot to
mount at the moment the overlay astronaut unmounts, which forces conditional
mounting inside the hero. FLIP reads the real rect, so the same code handles
desktop (astronaut on the right) and mobile (astronaut on top, `order-first`).

Fallback: if the target is missing, has zero size, or lies outside the
viewport, skip the glide and fade the overlay only.

### `portfolio-page.tsx`

- Always render `PortfolioContent`.
- Hold `introPhase` state: `"holding"` initially, `"exiting"` on the
  overlay's `onExitStart`, `"done"` on its `onComplete`.
- Pass `introPhase` to `Hero`.
- Render `<IntroOverlay />` in place of `<TerminalPreloader />`.

### `hero.tsx`

- Accept `introPhase: "holding" | "exiting" | "done"`.
- Entrance animations currently fire on mount; gate the text animations so
  they run once `introPhase` leaves `"holding"`. Otherwise they finish hidden
  under the overlay.
- The mascot wrapper gets `data-intro-target` and stays at `opacity: 0` until
  `introPhase` is `"done"`, then appears instantly (no entrance animation), so
  the overlay astronaut and the real one are never visible together. Its
  layout box is unchanged while hidden so the glide can measure it.

`PortfolioContent` passes the prop through; no context needed for one
consumer.

### Skip without a flash (`layout.tsx`)

The server cannot know whether this session has already seen the intro, so it
always renders the overlay. A small inline script in `<head>` runs before
first paint and sets `data-intro="skip"` on `<html>` when the session key is
present or reduced motion is requested. CSS hides the overlay under
`[data-intro="skip"]`. After hydration the overlay reads the same attribute in
an effect and goes straight to `done`, calling `onExitStart` and `onComplete`.

This keeps server and client markup identical on first render.

The inline-script mechanism must be checked against
`node_modules/next/dist/docs/` before implementation (per `AGENTS.md`).

### Removed

- `src/components/portfolio/terminal-preloader.tsx`
- `src/components/portfolio/linux-boot-sequence.ts`
- Session key `portfolio-linux-boot-complete` is replaced by
  `portfolio-intro-seen`.

## Failure handling

- **JS never runs or hydration stalls:** a CSS-only animation on the overlay
  fades it out and sets `pointer-events: none` at 3s, so the overlay itself
  can never block the page. The scroll lock is applied by JS, so it cannot
  outlive a JS failure. Known limitation, unchanged from today: the hero's
  `motion` entrance starts at `opacity: 0` in server HTML, so the hero stays
  hidden without JS; sections below it are unaffected by this change.
- **Sparkle image fails to load:** the image `error` event counts as
  "decoded" for the exit condition; the intro exits with a plain fade.
- **`sessionStorage` blocked:** reads and writes are wrapped in `try/catch`;
  the intro simply shows on every load.
- **Unmount mid-intro:** timers and listeners are cleared and the scroll lock
  is restored in effect cleanup.

## Testing

The repo has no test runner (`package.json` has only `lint`), and this change
does not add one. Verification:

1. `npm run lint` and `npm run build` pass.
2. Fresh session: intro plays, exits on its own in about 1.5s, astronaut lands
   on the hero mascot with no visible jump.
3. Reload in the same session: no intro, no flash of the overlay.
4. `prefers-reduced-motion: reduce`: no intro.
5. Mobile viewport: glide lands on the top-positioned mascot.
6. Key press, click, and scroll during the hold each trigger the exit.
7. JS disabled: overlay fades at 3s and no longer intercepts input.
8. View-source of `/` contains the hero title text.
