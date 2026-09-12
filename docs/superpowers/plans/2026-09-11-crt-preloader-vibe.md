# CRT Preloader Vibe Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ThreeUI-inspired CRT texture (aperture grille, persistent phosphor glow, chromatic aberration, flicker) to the existing amber-themed `TerminalPreloader`, as pure CSS — no new dependency.

**Architecture:** All changes live in one file, `src/components/portfolio/terminal-preloader.tsx`. Each effect is an additional `aria-hidden` overlay div or a CSS-only change to an existing element, following the exact pattern already used by `.boot-scanlines` / `.boot-vignette` / `.boot-bloom`. No new components, no new files, no changes to boot timing/sequence logic.

**Tech Stack:** Next.js (React 19), Tailwind v4 utility classes, `styled-jsx` (`<style jsx global>`) — all already in use in this file.

## Global Constraints

- No new npm dependency (spec: do not add `@designcodeio/threeui` or any WebGL lib).
- Color stays exactly `--portfolio-accent` (`#ff9142`) on `#050302` — no green, no ThreeUI palette.
- All new *animations* (not static textures) must be disabled under `@media (prefers-reduced-motion: reduce)`, following the existing block at the bottom of the file's `<style jsx global>`.
- No change to `linux-boot-sequence.ts`, boot phase state machine, or `onComplete` timing.
- Verification is visual (no test framework covers this component); each task ends with a type-check/lint pass, and the final task is a manual browser QA pass.

---

### Task 1: Aperture grille overlay

**Files:**
- Modify: `src/components/portfolio/terminal-preloader.tsx`

**Interfaces:**
- Consumes: existing `<style jsx global>` block and the existing overlay-div pattern (see `.boot-scanlines` div at line ~249-252 of the current file).
- Produces: new `.boot-grille` CSS class + overlay div. No exported interface change.

- [ ] **Step 1: Add the overlay div**

Insert immediately after the existing scanlines overlay div:

```tsx
      <div
        aria-hidden="true"
        className="boot-scanlines pointer-events-none absolute inset-0 z-10 opacity-35"
      />
      <div
        aria-hidden="true"
        className="boot-grille pointer-events-none absolute inset-0 z-10"
      />
```

- [ ] **Step 2: Add the CSS rule**

Add to `<style jsx global>`, near `.boot-scanlines`:

```css
        .boot-grille {
          background-image: repeating-linear-gradient(
            to right,
            rgba(255, 145, 66, 0.05) 0,
            rgba(255, 145, 66, 0.05) 1px,
            transparent 1px,
            transparent 3px
          );
        }
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/portfolio/terminal-preloader.tsx
git commit -m "feat: add CRT aperture grille texture to boot preloader"
```

---

### Task 2: Persistent phosphor glow

**Files:**
- Modify: `src/components/portfolio/terminal-preloader.tsx`

**Interfaces:**
- Consumes: existing `.boot-bloom` div (already rendered, currently `opacity: 0` at rest) and existing `.boot-exit .boot-bloom` exit-flash rule (must keep working unchanged — exit rule wins via selector specificity/source order, same as today).
- Produces: `.boot-bloom` now animates at rest via new `boot-glow-idle` keyframes; `.boot-exit .boot-bloom` is untouched and still overrides it during exit.

- [ ] **Step 1: Replace the base `.boot-bloom` rule**

Current:

```css
        .boot-bloom {
          opacity: 0;
        }
```

Replace with:

```css
        .boot-bloom {
          background: radial-gradient(
            circle at 50% 45%,
            rgba(255, 145, 66, 0.16),
            transparent 60%
          );
          animation: boot-glow-idle 5s ease-in-out infinite;
        }
```

- [ ] **Step 2: Add the idle keyframes**

Add near the other `@keyframes` blocks (e.g. after `boot-bloom`'s keyframes):

```css
        @keyframes boot-glow-idle {
          0%,
          100% {
            opacity: 0.02;
          }
          50% {
            opacity: 0.06;
          }
        }
```

- [ ] **Step 3: Gate it under reduced motion**

In the existing `@media (prefers-reduced-motion: reduce)` block, add `.boot-bloom` to the animation-disabling selector list and force it back to invisible:

```css
        @media (prefers-reduced-motion: reduce) {
          .boot-line,
          .boot-cursor,
          .boot-continue,
          .boot-exit,
          .boot-exit .boot-bloom,
          .boot-bloom {
            animation: none;
          }

          .boot-bloom {
            opacity: 0;
          }

          .boot-exit {
            opacity: 0;
          }

          .boot-scanlines {
            opacity: 0.16;
          }
        }
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/terminal-preloader.tsx
git commit -m "feat: add persistent phosphor glow to boot preloader"
```

---

### Task 3: Chromatic aberration on cursor + prompt line

**Files:**
- Modify: `src/components/portfolio/terminal-preloader.tsx`

**Interfaces:**
- Consumes: existing `.boot-cursor` span (in `BootLineRow`'s prompt branch) and the `startx` text span next to it.
- Produces: `.boot-cursor` gains `::before`/`::after` fringe layers; `startx` span gains a `boot-prompt-text` class with a text-shadow fringe. No prop/type changes.

- [ ] **Step 1: Tag the prompt text span**

Current (in `BootLineRow`, prompt branch):

```tsx
        <span className="ml-2 text-[#fff8f3]">startx</span>
```

Change to:

```tsx
        <span className="boot-prompt-text ml-2 text-[#fff8f3]">startx</span>
```

- [ ] **Step 2: Add text fringe CSS**

```css
        .boot-prompt-text {
          text-shadow:
            -0.5px 0 rgba(255, 200, 120, 0.6),
            0.5px 0 rgba(255, 90, 40, 0.6);
        }
```

- [ ] **Step 3: Add cursor fringe CSS**

Update the existing `.boot-cursor` rule to add `position: relative` (needed for the pseudo-elements), then add the two pseudo-element rules:

```css
        .boot-cursor {
          position: relative;
          animation: boot-cursor-blink 700ms steps(1, end) infinite;
          box-shadow: 0 0 12px rgba(255, 145, 66, 0.48);
        }

        .boot-cursor::before,
        .boot-cursor::after {
          content: "";
          position: absolute;
          inset: 0;
          background: inherit;
          mix-blend-mode: screen;
        }

        .boot-cursor::before {
          transform: translateX(-0.5px);
          background: rgba(255, 200, 120, 0.55);
        }

        .boot-cursor::after {
          transform: translateX(0.5px);
          background: rgba(255, 90, 40, 0.55);
        }
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/terminal-preloader.tsx
git commit -m "feat: add chromatic aberration fringe to boot cursor and prompt"
```

---

### Task 4: CRT flicker on the outer screen

**Files:**
- Modify: `src/components/portfolio/terminal-preloader.tsx`

**Interfaces:**
- Consumes: the outer `fixed inset-0` container's conditional className (currently `phase === "exiting" ? "boot-exit" : ""`).
- Produces: that ternary's else-branch becomes `"boot-flicker"` instead of `""`, so flicker and exit-flash never animate the same `opacity` property on the same element at once.

- [ ] **Step 1: Swap the className ternary**

Current:

```tsx
      className={`fixed inset-0 z-[9999] isolate overflow-hidden bg-[#050302] font-mono text-[#ded8d4] ${
        phase === "exiting" ? "boot-exit" : ""
      }`}
```

Change to:

```tsx
      className={`fixed inset-0 z-[9999] isolate overflow-hidden bg-[#050302] font-mono text-[#ded8d4] ${
        phase === "exiting" ? "boot-exit" : "boot-flicker"
      }`}
```

- [ ] **Step 2: Add the flicker CSS**

```css
        .boot-flicker {
          animation: boot-flicker 6.4s steps(1, end) infinite;
        }

        @keyframes boot-flicker {
          0%,
          91%,
          100% {
            opacity: 1;
          }
          92% {
            opacity: 0.985;
          }
          93% {
            opacity: 1;
          }
          96% {
            opacity: 0.99;
          }
          97% {
            opacity: 1;
          }
        }
```

- [ ] **Step 3: Gate it under reduced motion**

Add `.boot-flicker` to the reduced-motion selector list from Task 2 Step 3, so the final list reads:

```css
          .boot-line,
          .boot-cursor,
          .boot-continue,
          .boot-exit,
          .boot-exit .boot-bloom,
          .boot-bloom,
          .boot-flicker {
            animation: none;
          }
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/terminal-preloader.tsx
git commit -m "feat: add CRT flicker to boot preloader screen"
```

---

### Task 5: Manual visual QA

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Clear the boot session flag and load the page**

In the browser devtools console on `http://localhost:3000`:
```js
sessionStorage.removeItem("portfolio-linux-boot-complete")
```
Then reload.

- [ ] **Step 3: Confirm all four effects are visible and on-brand**

- Fine vertical grille texture visible over the scanlines, amber-tinted, subtle (not distracting).
- A faint amber glow breathing in/out behind the text even before the exit animation starts.
- The blinking cursor block and the `startx` prompt text show a soft warm/cool amber fringe, not a jarring RGB split.
- The whole screen has an occasional near-imperceptible flicker.
- Click "Click to continue" — the existing exit-flash animation still plays correctly and is not fighting with the new flicker (screen should NOT visibly jump/flash-then-flicker at the same time).

- [ ] **Step 4: Confirm reduced motion still works**

In devtools, emulate `prefers-reduced-motion: reduce` (Rendering tab in Chrome DevTools), reload with the session flag cleared again, confirm: no grille/glow pulsing, no flicker, boot lines appear near-instantly per existing reduced-motion behavior, exit is a plain fade.

- [ ] **Step 5: Confirm boot timing is unaffected**

Confirm the boot sequence still completes and calls through to the portfolio page exactly as before (no regression to `BOOT_SEQUENCE_DURATION` / `BOOT_EXIT_DELAY` behavior) — this task only added visual layers, no logic changed.
