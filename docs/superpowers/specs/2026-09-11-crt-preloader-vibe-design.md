# CRT Preloader Vibe Upgrade

## Context

`src/components/portfolio/terminal-preloader.tsx` already renders a Linux-boot
terminal preloader with CSS-only scanlines, vignette, and an exit-only bloom
flash, on `#050302` background with `--portfolio-accent` (`#ff9142`) text.

Inspiration: ThreeUI's WebGL "Terminal — CRT" background
(https://threeui.com/backgrounds/crt/terminal) — a green-phosphor Zion boot
log with aperture-grille grain, persistent phosphor glow, and chromatic
fringing. That component ships as `@designcodeio/threeui`, a WebGL/Canvas2D
renderer that bundles its own two `three.js` copies (three@0.128 +
three@0.165, ~54.7MB unpacked) on top of the project's existing `three@0.180`
(used by the Spline scene). Decision: **do not add this dependency**. Port
the visual vibe as pure CSS/SVG instead, tuned to the site's existing amber
palette rather than ThreeUI's green, and keep the effect confined to the file
that already owns the CRT chrome.

## Scope

Single file: `src/components/portfolio/terminal-preloader.tsx` (markup +
its `<style jsx global>` block). No new dependencies, no new components,
no change to boot sequence data (`linux-boot-sequence.ts`) or timing logic.

## Changes

1. **Aperture grille** — new `aria-hidden` overlay div, fine repeating
   vertical stripe pattern (`repeating-linear-gradient`, ~2-3px pitch,
   opacity ~0.04, amber-tinted), layered alongside the existing
   `.boot-scanlines` horizontal lines. Same z-index tier as scanlines.
2. **Persistent phosphor glow** — `.boot-bloom` currently sits at
   `opacity: 0` at rest and only animates during `.boot-exit`. Add a
   standalone slow breathing keyframe (4-6s, amber radial gradient,
   opacity oscillating roughly 0.02-0.06) that runs at rest, independent of
   the existing exit-flash animation (which keeps its current behavior).
3. **Chromatic aberration** — apply to the blinking cursor
   (`.boot-cursor`) and the `startx` prompt row only (not every boot line,
   to keep it subtle). Implemented via a pseudo-element duplicate offset
   ±0.5px, using a cooler/warmer split of the same amber accent (not a
   full RGB split — the site is single-accent, not green Matrix-style).
4. **CRT flicker** — subtle opacity jitter (99-100%) on the outer
   `fixed inset-0` container via an irregular-timing keyframe, mimicking
   analog refresh instability.

All four effects must respect `prefers-reduced-motion`, following the
existing pattern in this file (`@media (prefers-reduced-motion: reduce)`
block already zeroes out `.boot-line`, `.boot-cursor`, `.boot-continue`,
`.boot-exit` animations — extend that block to also disable the new grille
animation/flicker, or simply make the new effects static/off under reduced
motion).

## Non-goals

- No screen curvature/barrel-distortion warp (ThreeUI's demo doesn't show
  strong curvature either; skipping keeps this CSS-only and simple).
- No change to color: stays exactly `--portfolio-accent` / `#050302`,
  matching khoido.com, not ThreeUI's green phosphor.
- No WebGL, no new npm dependency, no change to `PortfolioPage` usage of
  `<TerminalPreloader onComplete={...} />`.

## Testing

Visual only — run `npm run dev`, load the site with the boot session
storage key cleared (`portfolio-linux-boot-complete` in `sessionStorage`),
confirm the four effects render, confirm reduced-motion disables them, and
confirm the existing boot sequence/exit timing is unaffected.
