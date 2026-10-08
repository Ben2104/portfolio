# Astronaut Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the click-gated terminal boot preloader with a ~1.5s, text-free astronaut intro that dismisses itself and hands the astronaut off to the hero mascot slot.

**Architecture:** A fixed overlay (`IntroOverlay`) sits on top of the always-rendered portfolio. Its entrance, ring, skip-hiding and 3s failsafe are plain CSS in `globals.css`, so they work before hydration. After hydration it measures the hero's `[data-intro-target]` box and glides its own astronaut image there (manual FLIP via `motion`), then the hero mounts the real `AstronautMascot` underneath. An inline `<head>` script plus `useSyncExternalStore` skip the intro for repeat sessions without a flash or hydration mismatch.

**Tech Stack:** Next.js 16.3.3 (App Router), React 19.2.4, `motion` 12, Tailwind CSS 4, TypeScript 5.

**Spec:** `docs/superpowers/specs/2026-10-07-astronaut-intro-design.md`

## Global Constraints

- No new dependencies. No test runner (repo has only `lint`); verification is `npm run lint`, `npx tsc --noEmit`, `npm run build`, and the browser checks listed in each task.
- This is Next.js 16 — APIs differ from older versions. The inline-script pattern used here is taken from `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`. Read that guide before changing the pattern.
- No visible text in the intro. The only text is one `sr-only` status: `Loading portfolio`.
- No click is ever required. The intro must dismiss itself.
- Session key is exactly `portfolio-intro-seen` (value `"true"`), stored in `sessionStorage`.
- Timings: hold ends 900ms after navigation start, glide 600ms, overlay lingers 350ms after landing, failsafe at 3000ms.
- Colours come from existing tokens: `--portfolio-bg` (`#1a1a1a`), `--portfolio-accent` (`#ff9142`). Do not reuse the old CRT black `#050302`.
- Do not change `src/components/portfolio/astronaut-mascot.tsx`.
- Work on branch `feat/astronaut-intro`. End every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `AGENTS.md` is rewritten by `next dev`. If it shows up modified, commit it with your work.

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| `src/components/portfolio/intro-state.ts` | Create | Server-safe constants and types: session key, `IntroPhase`, inline skip script. No `"use client"` so `layout.tsx` can import real strings. |
| `src/components/portfolio/intro-overlay.tsx` | Create | Client overlay: hold → glide → land → unmount. Exports `IntroOverlay` and `useIntroSkip`. |
| `src/app/layout.tsx` | Modify | Inject skip script; `suppressHydrationWarning` on `<html>`. |
| `src/app/globals.css` | Modify | Intro CSS (entrance, ring, failsafe, skip, reduced motion); `scrollbar-gutter`. |
| `src/components/portfolio/portfolio-page.tsx` | Modify | Always render content; own `introPhase`; mount overlay. |
| `src/components/portfolio/hero.tsx` | Modify | Gate text entrance on intro; expose `[data-intro-target]`; mount mascot on landing. |
| `src/components/portfolio/projects.tsx` | Modify | Delay three.js shelf request until the intro is done. |
| `src/components/portfolio/terminal-preloader.tsx` | Delete | Replaced. |
| `src/components/portfolio/linux-boot-sequence.ts` | Delete | Replaced. |
| `README.md` | Modify | Replace terminal-preloader references. |

---

### Task 1: Skip plumbing and intro CSS

Nothing visible changes in this task. It lands the pieces that must exist before hydration: the skip script, the CSS, and the shared constants.

**Files:**
- Create: `src/components/portfolio/intro-state.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `INTRO_SESSION_KEY: "portfolio-intro-seen"` (string constant)
  - `INTRO_SKIP_SCRIPT: string` (self-invoking JS source)
  - `type IntroPhase = "holding" | "exiting" | "done"`
  - CSS classes `intro-overlay`, `intro-backdrop`, `intro-astronaut`, `intro-enter`, `intro-ring`; attribute hooks `data-phase` (`holding` | `exiting` | `landed`) and `data-glide` (`true` | `false`) on `.intro-overlay`; `html[data-intro="skip"]`.

- [ ] **Step 1: Create the shared state module**

Create `src/components/portfolio/intro-state.ts`:

```ts
/* Shared by the server layout and the client overlay, so this file must not be
   a client module: layout.tsx needs the real strings, not client references. */

export type IntroPhase = "holding" | "exiting" | "done";

// Clear this key in DevTools session storage to replay the intro locally.
export const INTRO_SESSION_KEY = "portfolio-intro-seen";

/* Runs during HTML parsing, before first paint, so a repeat session never sees
   the overlay flash. See next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md */
export const INTRO_SKIP_SCRIPT = `(function(){try{if(sessionStorage.getItem("${INTRO_SESSION_KEY}")==="true")document.documentElement.setAttribute("data-intro","skip")}catch(e){}})()`;
```

- [ ] **Step 2: Inject the script in the root layout**

In `src/app/layout.tsx`, add the import below the existing `import "./globals.css";` line:

```tsx
import { INTRO_SKIP_SCRIPT } from "@/components/portfolio/intro-state";
```

Replace the `<html lang="en">` opening tag and the start of `<head>` so the block reads:

```tsx
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SKIP_SCRIPT }} />
        {/* Fontshare: Clash Display (headlines) + Satoshi (body) */}
```

`suppressHydrationWarning` is required because the script adds `data-intro` to `<html>` before React hydrates. Leave the rest of the file unchanged.

- [ ] **Step 3: Add the intro CSS**

In `src/app/globals.css`, change the existing `html` rule to add a stable scrollbar gutter (prevents a 6px layout shift when the intro's scroll lock is released, which would misalign the landing):

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 110px;
  /* Keep layout width fixed while the intro locks scrolling */
  scrollbar-gutter: stable;
}
```

Append to the end of `src/app/globals.css`:

```css
/* Intro overlay. CSS-driven so it behaves correctly before hydration. */

/* Failsafe: the overlay removes itself even if JS never runs */
.intro-overlay {
  animation: intro-failsafe 400ms ease-out 3s forwards;
}

.intro-overlay:not([data-phase="holding"]) {
  pointer-events: none;
}

/* Repeat session (set by the inline script in layout.tsx) */
[data-intro="skip"] .intro-overlay {
  display: none;
}

.intro-backdrop {
  transition: opacity 600ms cubic-bezier(0.65, 0, 0.35, 1);
}

.intro-overlay:not([data-phase="holding"]) .intro-backdrop {
  opacity: 0;
}

.intro-astronaut {
  transition: opacity 600ms ease-out;
}

/* No measurable hero target: fade the astronaut with the backdrop instead of gliding */
.intro-overlay[data-glide="false"]:not([data-phase="holding"]) .intro-astronaut {
  opacity: 0;
}

.intro-enter {
  animation: intro-enter 250ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.intro-ring {
  transition: opacity 200ms ease-out;
}

.intro-ring circle {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: intro-ring 650ms ease-in-out 250ms forwards;
}

.intro-overlay:not([data-phase="holding"]) .intro-ring {
  opacity: 0;
}

@keyframes intro-enter {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes intro-ring {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes intro-failsafe {
  to {
    opacity: 0;
    visibility: hidden;
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro-overlay {
    display: none;
  }
}
```

- [ ] **Step 4: Verify lint, types, build**

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: all three exit 0. No new warnings mentioning `intro-state.ts` or `layout.tsx`.

- [ ] **Step 5: Verify the script is in the server HTML**

Run:

```bash
npx next start -p 3111 >/dev/null 2>&1 &
SERVER_PID=$!
sleep 4
curl -s http://localhost:3111 | grep -c 'portfolio-intro-seen'
kill $SERVER_PID
```

Expected: prints `1` or higher.

- [ ] **Step 6: Commit**

```bash
git add src/components/portfolio/intro-state.ts src/app/layout.tsx src/app/globals.css
git commit -m "Add intro skip script, shared state, and overlay CSS

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: IntroOverlay replaces the terminal preloader

After this task the site shows the astronaut intro and dismisses it without a click. The astronaut fades out rather than glides, because the hero does not expose a target until Task 3. Portfolio content is now server-rendered.

**Files:**
- Create: `src/components/portfolio/intro-overlay.tsx`
- Modify: `src/components/portfolio/portfolio-page.tsx` (whole file)
- Delete: `src/components/portfolio/terminal-preloader.tsx`
- Delete: `src/components/portfolio/linux-boot-sequence.ts`
- Modify: `README.md:26-28`, `README.md:40`, `README.md:90`

**Interfaces:**
- Consumes from Task 1: `INTRO_SESSION_KEY`, `IntroPhase`, the CSS classes and `data-phase` / `data-glide` hooks.
- Produces:
  - `useIntroSkip(): boolean` — `false` on the server and during hydration; afterwards `true` when the session key is set or reduced motion is requested.
  - `IntroOverlay(props: { skip: boolean; onExitStart: () => void; onComplete: () => void })` — calls `onExitStart` once when the exit begins and `onComplete` once when the astronaut has landed. Calls neither when `skip` is true.
  - DOM contract for Task 3: the overlay glides to the first element matching `[data-intro-target]`.

- [ ] **Step 1: Create the overlay component**

Create `src/components/portfolio/intro-overlay.tsx`:

```tsx
"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { motion } from "motion/react";

import { INTRO_SESSION_KEY } from "./intro-state";

type OverlayPhase = "holding" | "exiting" | "landed" | "done";
type Glide = { x: number; y: number; scale: number };

type IntroOverlayProps = {
  skip: boolean;
  onExitStart: () => void;
  onComplete: () => void;
};

/* Measured from navigation start (performance.now), not from mount, so a slow
   hydration doesn't add to the wait */
const HOLD_MS = 900;
const EXIT_MS = 600;
/* The overlay astronaut stays put this long after landing to cover the real mascot's fade-in */
const LINGER_MS = 350;
/* Matches the CSS failsafe delay on .intro-overlay in globals.css */
const FAILSAFE_MS = 3000;
const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
const GLIDE_EASE = [0.65, 0, 0.35, 1] as const;
const REST: Glide = { x: 0, y: 0, scale: 1 };

const subscribe = () => () => {};

function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
    return false;
  }
}

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function readIntroSkip() {
  return hasSeenIntro() || prefersReducedMotion();
}

function storeIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "true");
  } catch {
    // Without storage the intro simply plays on every load.
  }
}

/* The server can't read session storage, so it always answers false; React swaps
   in the client answer right after hydration without a mismatch */
export function useIntroSkip() {
  return useSyncExternalStore(subscribe, readIntroSkip, () => false);
}

/* FLIP: offset and scale that carry the overlay astronaut onto the hero mascot slot */
function measureGlide(astronaut: HTMLElement): Glide | null {
  const target = document.querySelector<HTMLElement>("[data-intro-target]");
  if (!target) return null;

  const to = target.getBoundingClientRect();
  const from = astronaut.getBoundingClientRect();
  const onScreen =
    to.width > 0 &&
    to.height > 0 &&
    from.width > 0 &&
    to.bottom > 0 &&
    to.right > 0 &&
    to.top < window.innerHeight &&
    to.left < window.innerWidth;
  if (!onScreen) return null;

  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
    scale: to.width / from.width,
  };
}

export function IntroOverlay({ skip, onExitStart, onComplete }: IntroOverlayProps) {
  const [phase, setPhase] = useState<OverlayPhase>("holding");
  const [glide, setGlide] = useState<Glide | null>(null);
  const astronautRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const exitTimers = useRef<number[]>([]);

  const startExit = useCallback(() => {
    if (started.current) return;
    started.current = true;

    /* Past the CSS failsafe the overlay is already invisible; just hand over */
    const late = performance.now() >= FAILSAFE_MS;
    const astronaut = astronautRef.current;
    setGlide(late || !astronaut ? null : measureGlide(astronaut));
    setPhase("exiting");
    onExitStart();

    exitTimers.current.push(
      window.setTimeout(
        () => {
          storeIntroSeen();
          setPhase("landed");
          onComplete();
          exitTimers.current.push(
            window.setTimeout(() => setPhase("done"), LINGER_MS),
          );
        },
        late ? 0 : EXIT_MS,
      ),
    );
  }, [onComplete, onExitStart]);

  /* Leave once the hold has elapsed and the astronaut frame has settled; any input skips ahead */
  useEffect(() => {
    if (skip) return;

    const image = astronautRef.current?.querySelector("img");
    let ready = !image || image.complete;
    let held = false;

    const maybeExit = () => {
      if (ready && held) startExit();
    };
    const onReady = () => {
      ready = true;
      maybeExit();
    };

    image?.addEventListener("load", onReady);
    image?.addEventListener("error", onReady);

    const now = performance.now();
    const holdTimer = window.setTimeout(
      () => {
        held = true;
        maybeExit();
      },
      Math.max(0, HOLD_MS - now),
    );
    /* A frame that neither loads nor errors must not strand the visitor */
    const failsafeTimer = window.setTimeout(
      startExit,
      Math.max(0, FAILSAFE_MS - now),
    );

    for (const event of SKIP_EVENTS) {
      window.addEventListener(event, startExit, { passive: true });
    }

    return () => {
      image?.removeEventListener("load", onReady);
      image?.removeEventListener("error", onReady);
      window.clearTimeout(holdTimer);
      window.clearTimeout(failsafeTimer);
      for (const event of SKIP_EVENTS) {
        window.removeEventListener(event, startExit);
      }
    };
  }, [skip, startExit]);

  useEffect(
    () => () => {
      for (const timer of exitTimers.current) window.clearTimeout(timer);
    },
    [],
  );

  /* Hold the page still until the astronaut lands; the glide targets a fixed viewport position */
  useEffect(() => {
    if (skip || (phase !== "holding" && phase !== "exiting")) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [phase, skip]);

  if (phase === "done" || (skip && phase === "holding")) return null;

  return (
    <div
      className="intro-overlay fixed inset-0 z-[9999] flex items-center justify-center"
      data-glide={glide ? "true" : "false"}
      data-phase={phase}
    >
      <span className="sr-only" role="status">
        Loading portfolio
      </span>

      <div
        aria-hidden="true"
        className="intro-backdrop absolute inset-0 bg-(--portfolio-bg)"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,145,66,0.12), transparent 55%)",
          }}
        />
      </div>

      <motion.div
        ref={astronautRef}
        aria-hidden="true"
        className="intro-astronaut relative aspect-square w-[calc(var(--astronaut-size)*0.7)]"
        animate={glide ?? REST}
        transition={{ duration: EXIT_MS / 1000, ease: GLIDE_EASE }}
      >
        <svg
          className="intro-ring absolute -inset-[8%] -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            pathLength={1}
            stroke="var(--portfolio-accent)"
            strokeLinecap="round"
            strokeWidth="0.6"
          />
        </svg>

        <div className="intro-enter h-full w-full">
          <motion.div
            className="h-full w-full"
            animate={phase === "holding" ? { y: [0, -10, 0] } : { y: 0 }}
            transition={
              phase === "holding"
                ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                : { duration: EXIT_MS / 1000, ease: GLIDE_EASE }
            }
          >
            {/* Same file the mascot greets with, so the handoff reuses the decoded frame */}
            <Image
              src="/astronaut/sparkle.webp"
              alt=""
              width={300}
              height={300}
              unoptimized
              loading="eager"
              fetchPriority="high"
              draggable={false}
              className="h-full w-full select-none"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
```

Notes for the implementer:
- Three nested layers each own one transform so they never fight: outer `motion.div` = glide, `.intro-enter` = CSS entrance scale, inner `motion.div` = float. `astronautRef` is on the outer layer, which has no transform while holding, so the measured `from` rect is the true resting box.
- The `Image` props mirror `astronaut-mascot.tsx:318-330`. Keep them identical.
- If `npm run lint` reports the `absolute -inset-[8%]` SVG as unsized, do not add width/height classes; `inset` already sizes an absolutely positioned SVG.

- [ ] **Step 2: Rewrite the page composition**

Replace the entire contents of `src/components/portfolio/portfolio-page.tsx` with:

```tsx
"use client";

import { useCallback, useState } from "react";

import { About } from "./about";
import { Contact } from "./contact";
import { Education } from "./education";
import { Experience } from "./experience";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { IntroOverlay, useIntroSkip } from "./intro-overlay";
import type { IntroPhase } from "./intro-state";
import { Navbar } from "./navbar";
import { Projects } from "./projects";
import { Skills } from "./skills";

function PortfolioContent() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Education />
      <Contact />
      <Footer />
    </>
  );
}

export function PortfolioPage() {
  const skipIntro = useIntroSkip();
  const [, setIntroPhase] = useState<IntroPhase>("holding");
  const handleIntroExitStart = useCallback(() => setIntroPhase("exiting"), []);
  const handleIntroComplete = useCallback(() => setIntroPhase("done"), []);

  return (
    <main className="min-h-screen overflow-x-clip bg-(--portfolio-bg)">
      <IntroOverlay
        skip={skipIntro}
        onExitStart={handleIntroExitStart}
        onComplete={handleIntroComplete}
      />
      <PortfolioContent />
    </main>
  );
}
```

The phase value is unused until Task 3 wires it into `Hero`; the setter is kept so the overlay's callbacks have somewhere to land.

- [ ] **Step 3: Delete the old preloader**

```bash
git rm src/components/portfolio/terminal-preloader.tsx src/components/portfolio/linux-boot-sequence.ts
```

Then confirm nothing still references them:

Run: `grep -rn "terminal-preloader\|linux-boot-sequence\|TerminalPreloader\|portfolio-linux-boot-complete" src`
Expected: no output.

- [ ] **Step 4: Update the README**

In `README.md`, replace line 26:

```markdown
This is not a static résumé page. The experience opens with an astronaut drifting into place, moves through a focused project narrative, and closes with a direct path to connect.
```

Replace line 28:

```markdown
- **Astronaut arrival** — a brief, no-click intro hands the mascot off to the hero.
```

Replace line 40 (inside the mermaid block):

```
    B --> D["Astronaut intro"]
```

Replace line 90 (inside the project map):

```
│   ├── intro-overlay.tsx        # Opening astronaut intro
```

- [ ] **Step 5: Verify lint, types, build**

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: all three exit 0.

- [ ] **Step 6: Verify content is server-rendered**

Run:

```bash
npx next start -p 3111 >/dev/null 2>&1 &
SERVER_PID=$!
sleep 4
curl -s http://localhost:3111 | grep -c 'Crafting digital experiences'
curl -s http://localhost:3111 | grep -c 'intro-overlay'
kill $SERVER_PID
```

Expected: both counts are `1` or higher. (Before this task the first count was `0`.)

- [ ] **Step 7: Verify in the browser**

Run `npm run dev`, open `http://localhost:3000` in a fresh tab (or clear `portfolio-intro-seen` from DevTools → Application → Session Storage, then reload). Check each:

1. Astronaut appears centred on a `#1a1a1a` background with an amber ring drawing around it. No text is visible.
2. Without touching anything, the overlay fades away on its own and the hero is visible and scrollable.
3. Reload in the same tab: no intro and no flash of the overlay.
4. Clear the session key, reload, and press any key during the intro: it exits immediately.
5. DevTools console shows no hydration errors.

Note: in this task the astronaut fades rather than glides. That is expected until Task 3.

- [ ] **Step 8: Commit**

```bash
git add -A src/components/portfolio README.md
git commit -m "Replace terminal preloader with self-dismissing astronaut intro

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Hero handoff and glide

After this task the overlay astronaut glides into the hero mascot slot, the hero text enters as the overlay leaves, and the three.js shelf waits for the intro to finish.

**Files:**
- Modify: `src/components/portfolio/hero.tsx` (whole file)
- Modify: `src/components/portfolio/portfolio-page.tsx`
- Modify: `src/components/portfolio/projects.tsx:50-63`

**Interfaces:**
- Consumes from Task 1: `type IntroPhase = "holding" | "exiting" | "done"`.
- Consumes from Task 2: `IntroOverlay` glides to the first `[data-intro-target]` element; `useIntroSkip(): boolean`.
- Produces:
  - `Hero(props: { introPhase: IntroPhase })`
  - `Projects(props: { introDone: boolean })`

- [ ] **Step 1: Rewrite the hero**

Replace the entire contents of `src/components/portfolio/hero.tsx` with:

```tsx
"use client";

import { motion } from "motion/react";

import { profile } from "@/data/portfolio";
import { AstronautMascot } from "./astronaut-mascot";
import type { IntroPhase } from "./intro-state";

export function Hero({ introPhase }: { introPhase: IntroPhase }) {
  /* Text enters as the intro overlay starts to leave, not on mount, or it would finish unseen */
  const revealed = introPhase !== "holding";

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-(--portfolio-bg)"
    >
      {/* Ambient background glow effects */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 44% 30% at 50% 18%, rgba(255,255,255,0.18), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-16 h-[320px] w-[520px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,145,66,0.14), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[360px] w-[560px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,145,66,0.08), transparent 75%)",
        }}
      />

      {/* 12-col grid: text spans 7, astronaut spans 5 */}
      <div className="container-fluid relative grid min-h-svh grid-cols-1 content-center items-center gap-y-6 pb-[clamp(2.5rem,6vw,8rem)] pt-[clamp(5.5rem,8vw,10rem)] md:gap-y-12 md:grid-cols-12 md:gap-x-[clamp(1rem,2vw,3rem)]">
        {/* Left side — text content */}
        <div className="flex min-w-0 flex-col items-center text-center md:col-span-7 md:items-start md:text-left">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.45 }}
            className="rounded-full border border-white/5 bg-white/5 px-[1.45em] py-[0.75em] font-satoshi text-(length:--fs-label) font-semibold uppercase tracking-[0.14em] text-(--portfolio-muted)"
          >
            {profile.availability}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-clash mt-[clamp(1.5rem,2.5vw,3rem)] text-(length:--fs-hero) font-bold leading-[0.95] tracking-[-0.035em] text-(--portfolio-text)"
          >
            {profile.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-[clamp(1.5rem,2.5vw,3rem)] flex flex-wrap items-center justify-center gap-[0.9em] text-(length:--fs-label) md:justify-start"
          >
            {profile.roles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-white/12 px-[1.45em] py-[0.55em] font-satoshi font-medium uppercase tracking-[0.11em] text-white/70"
              >
                {role}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right side — interactive astronaut */}
        <div className="relative order-first flex w-full items-center justify-center md:order-none md:col-span-5 md:justify-end">
          {/* The intro overlay glides its astronaut onto this box, so it keeps its size
              while empty. The mascot mounts on landing so its float and greeting start there */}
          <div
            data-intro-target
            className="aspect-square w-(--astronaut-size) max-w-full"
          >
            {introPhase === "done" ? (
              <motion.div
                className="h-full w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AstronautMascot className="h-full w-full" />
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
```

What changed from the old file, so you can sanity-check the diff:
- New `introPhase` prop and `revealed` flag.
- The three text `motion` elements switch `animate` on `revealed` instead of animating on mount.
- The astronaut's old `motion.div` (scale 0.9 → 1 entrance) becomes a plain `div`; inside it a fixed-size `[data-intro-target]` box mounts the mascot only when `introPhase === "done"`, with a 300ms fade. The overlay astronaut sits on top for 350ms (`LINGER_MS`), which hides that fade after a glide.

- [ ] **Step 2: Gate the three.js shelf on the intro**

In `src/components/portfolio/projects.tsx`, replace the component signature, the comment, and the effect (currently lines 50-63) with:

```tsx
export function Projects({ introDone }: { introDone: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [shelfRequested, setShelfRequested] = useState(false);

  /* Wait for the intro to finish before pulling in Three.js and the shelf, so parsing
     it can't stutter the astronaut's glide or the hero's first paint */
  useEffect(() => {
    if (!introDone) return;

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(() => setShelfRequested(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(() => setShelfRequested(true), 200);
    return () => window.clearTimeout(handle);
  }, [introDone]);
```

Leave everything after the effect unchanged.

- [ ] **Step 3: Pass the phase through the page**

In `src/components/portfolio/portfolio-page.tsx`, replace `PortfolioContent` and `PortfolioPage` (keep the imports as they are) with:

```tsx
function PortfolioContent({ introPhase }: { introPhase: IntroPhase }) {
  return (
    <>
      <Navbar />
      <Hero introPhase={introPhase} />
      <About />
      <Experience />
      <Projects introDone={introPhase === "done"} />
      <Skills />
      <Education />
      <Contact />
      <Footer />
    </>
  );
}

export function PortfolioPage() {
  const skipIntro = useIntroSkip();
  const [introPhase, setIntroPhase] = useState<IntroPhase>("holding");
  const handleIntroExitStart = useCallback(() => setIntroPhase("exiting"), []);
  const handleIntroComplete = useCallback(() => setIntroPhase("done"), []);

  /* A skipped intro never reports back, so treat it as already finished */
  const effectivePhase: IntroPhase =
    skipIntro && introPhase === "holding" ? "done" : introPhase;

  return (
    <main className="min-h-screen overflow-x-clip bg-(--portfolio-bg)">
      <IntroOverlay
        skip={skipIntro}
        onExitStart={handleIntroExitStart}
        onComplete={handleIntroComplete}
      />
      <PortfolioContent introPhase={effectivePhase} />
    </main>
  );
}
```

- [ ] **Step 4: Verify lint, types, build**

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: all three exit 0.

- [ ] **Step 5: Verify in the browser — full matrix**

Run `npm run dev`, open `http://localhost:3000`. Before each fresh-session check, clear `portfolio-intro-seen` in DevTools → Application → Session Storage and reload.

1. **Fresh session, desktop width:** astronaut appears centred, ring draws, then the astronaut glides right and grows into the hero slot while the hero text fades up. Total about 1.5s, no click. After landing there is no visible jump or double image, and the mascot then tracks the cursor and reacts to clicks.
2. **Repeat session:** reload without clearing the key. No intro, no flash. Hero text and mascot fade in.
3. **Reduced motion:** DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", clear the key, reload. No intro.
4. **Mobile width (DevTools device toolbar, 390px):** astronaut glides up to the mascot slot above the text and lands without a jump.
5. **Skip input:** during the hold, separately test a key press, a click, and a mouse-wheel scroll. Each starts the exit immediately.
6. **Failsafe:** DevTools → Settings → Debugger → "Disable JavaScript", clear the key, reload. The overlay fades at about 3s and no longer intercepts clicks. Re-enable JavaScript afterwards.
7. **Shelf timing:** DevTools → Network, filter `three`, clear the key, reload. No three.js chunk request starts until after the astronaut has landed.
8. **Console:** no hydration errors or warnings on any of the above.

If check 1 or 4 shows a jump at landing, do not tune timings blindly: log `measureGlide`'s result and the target's `getBoundingClientRect()` one frame after `onComplete` and compare. A mismatch of exactly the scrollbar width means `scrollbar-gutter: stable` from Task 1 is missing or unsupported in that browser.

- [ ] **Step 6: Commit**

```bash
git add src/components/portfolio/hero.tsx src/components/portfolio/portfolio-page.tsx src/components/portfolio/projects.tsx
git commit -m "Glide intro astronaut into the hero and defer shelf until landing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
