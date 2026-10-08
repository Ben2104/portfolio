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
| 250ms–loaded | Astronaut floats. A percentage under it counts up with the real page load, and a thin amber ring around it fills to match. Never shorter than 1800ms. |
| loaded + 1000ms | Astronaut glides and resizes into the hero mascot slot while the overlay fades and the hero text staggers in. |
| after the glide | Overlay removed. The real `AstronautMascot` is visible, already on its `sparkle` greeting frame. |

Times are for a fast connection, where the whole intro takes about 2.8s. A slow
connection holds the count at whatever has really loaded, up to a 10s cap.

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
frames and several window listeners for a ~2.8s appearance.

Props: `onExitStart: () => void`, `onComplete: () => void`.

Phases: `holding` → `exiting` → `done`.

- The count is owned by an inline script in `<head>` (`INTRO_SCRIPT` in
  `intro-state.ts`), not by React, so it runs from the moment the HTML arrives
  and keeps moving while the JS bundle downloads. The script writes only to
  `<html>`: `data-intro="tracking"` (cancels the CSS failsafe) and the
  `--intro-progress` custom property (0–100), which `globals.css` turns into
  the number (a CSS counter on `.intro-percent::after`) and the ring's
  `stroke-dashoffset`. Nothing React hydrates is touched.
- The percentage is the settled share of: each of the 18 mascot frames
  (preloaded at low fetch priority), `document.fonts.ready`, the window `load`
  event, and hydration itself, which the overlay reports on mount through
  `window.__portfolioIntro.hydrate()`. It therefore cannot reach 100 before the
  page is interactive. The displayed value follows that share but climbs no
  faster than 0 → 100 across the 1800ms hold, measured from navigation start;
  once the hold has passed, a count held back by the network catches up at
  0 → 100 per 500ms.
- `holding` → `exiting` 200ms after the count reaches 100. A skip input forces
  the exit immediately, and a JS timer in the overlay forces it at 10s.
- On entering `exiting`, the overlay calls `onExitStart`, then performs the
  glide (below) over 1000ms while fading its background.
- When the glide ends it writes the session key and calls `onComplete`. The
  overlay astronaut then stays in place for 350ms to cover the real mascot's
  fade-in before the overlay renders `null`.

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
- A fixed-size box carrying `data-intro-target` holds the mascot slot. The
  real `AstronautMascot` mounts inside it only when `introPhase` is `"done"`,
  with a 300ms fade. Mounting on landing means its idle float and sparkle
  greeting start from rest at the landing position; mounting earlier would
  leave it mid-float and cause a visible jump at handoff.

### `projects.tsx`

`Projects` used to mount only after the boot screen, which kept three.js off
the hero's critical path. Now that content is always rendered, it accepts
`introDone: boolean` and waits for it before requesting the shelf, so parsing
three.js cannot stutter the glide.

`PortfolioContent` passes the prop through; no context needed for one
consumer.

### Skip without a flash (`layout.tsx`)

The server cannot know whether this session has already seen the intro, so it
always renders the overlay. A small inline script in `<head>` runs before
first paint and sets `data-intro="skip"` on `<html>` when the session key is
present or reduced motion is requested. CSS hides the overlay under
`[data-intro="skip"]`. Reduced motion is also handled by a plain CSS media
query, so it needs no script.

After hydration a `useIntroSkip()` hook (`useSyncExternalStore`, server
snapshot `false`) re-reads the session key and motion preference directly.
It does not read the attribute, because React clears script-set `<html>`
attributes on the Strict Mode remount in development. When it reports a skip,
the overlay renders `null` and the page treats the intro as `"done"`.

This keeps server and client markup identical on first render. `<html>` gets
`suppressHydrationWarning` for the script-set attribute.

Pattern verified against
`node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`.

### Scroll lock and layout width

The overlay sets `overflow: hidden` on `<html>` until the astronaut lands.
`html { scrollbar-gutter: stable }` keeps the layout width constant when the
lock is released; without it the hero shifts by the scrollbar width and the
landing misaligns.

### Removed

- `src/components/portfolio/terminal-preloader.tsx`
- `src/components/portfolio/linux-boot-sequence.ts`
- Session key `portfolio-linux-boot-complete` is replaced by
  `portfolio-intro-seen`.

## Failure handling

- **JS never runs or hydration stalls:** a CSS-only animation on the overlay
  fades it out and sets `pointer-events: none` at 4.2s, so the overlay itself
  can never block the page. The scroll lock is applied by JS, so it cannot
  outlive a JS failure. Known limitation, unchanged from today: the hero's
  `motion` entrance starts at `opacity: 0` in server HTML, so the hero stays
  hidden without JS; sections below it are unaffected by this change.
- **An asset fails to load:** an `error` event counts as settled, so the count
  still reaches 100. If something neither loads nor errors, the 10s JS timer
  exits anyway so the hero is never left hidden.
- **Hydration never arrives (bundle fails or takes over 10s):** the intro script
  sets `data-intro="timeout"`, which fades the overlay out. If the page hydrates
  after that, the overlay hands over at once with no glide.
- **Inline script never runs (JS disabled):** the CSS failsafe below still
  applies.
- **`sessionStorage` blocked:** reads and writes are wrapped in `try/catch`;
  the intro simply shows on every load.
- **Unmount mid-intro:** timers and listeners are cleared and the scroll lock
  is restored in effect cleanup.

## Testing

The repo has no test runner (`package.json` has only `lint`), and this change
does not add one. Verification:

1. `npm run lint` and `npm run build` pass.
2. Fresh session: intro plays, counts to 100%, exits on its own in about 2.8s,
   astronaut lands on the hero mascot with no visible jump.
3. Reload in the same session: no intro, no flash of the overlay.
4. `prefers-reduced-motion: reduce`: no intro.
5. Mobile viewport: glide lands on the top-positioned mascot.
6. Key press, click, and scroll during the hold each trigger the exit.
7. JS disabled: overlay fades at 4.2s and no longer intercepts input.
   Throttled network (DevTools "Slow 4G"): the count stalls with the load and
   the intro lasts longer, never past 10s.
8. View-source of `/` contains the hero title text.
9. No three.js chunk is requested until the astronaut has landed.
