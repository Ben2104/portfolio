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

import { INTRO_MAX_WAIT_MS, INTRO_SESSION_KEY } from "./intro-state";

type OverlayPhase = "holding" | "exiting" | "landed" | "done";
type Glide = { x: number; y: number; scale: number };

type IntroOverlayProps = {
  skip: boolean;
  onExitStart: () => void;
  onComplete: () => void;
};

/* Lets 100% and the closed ring register before the astronaut leaves */
const FULL_BEAT_MS = 200;
const EXIT_MS = 1000;
/* The overlay astronaut stays put this long after landing to cover the real mascot's fade-in */
const LINGER_MS = 350;
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
  /* False when hydration arrived after the intro script had given up and hidden the overlay */
  const owned = useRef(false);
  const exitTimers = useRef<number[]>([]);

  const startExit = useCallback(() => {
    if (started.current) return;
    started.current = true;

    /* The overlay is already hidden; just hand over */
    const late = !owned.current;
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

  /* The inline intro script (intro-state.ts) has been counting since the HTML arrived.
     Report hydration to it and leave when its count reaches 100; any input skips ahead */
  useEffect(() => {
    if (skip) return;

    const intro = window.__portfolioIntro;
    owned.current = !!intro && intro.state !== "timeout";

    let beatTimer = 0;
    if (owned.current) {
      intro?.hydrate(() => {
        beatTimer = window.setTimeout(startExit, FULL_BEAT_MS);
      });
    }

    const maxTimer = window.setTimeout(
      startExit,
      owned.current ? Math.max(0, INTRO_MAX_WAIT_MS - performance.now()) : 0,
    );

    for (const event of SKIP_EVENTS) {
      window.addEventListener(event, startExit, { passive: true });
    }

    return () => {
      intro?.hydrate(null);
      window.clearTimeout(beatTimer);
      window.clearTimeout(maxTimer);
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

      {/* Sits just under the ring; stays behind when the astronaut glides away.
          The number itself is drawn by CSS from --intro-progress (globals.css) */}
      <p
        aria-hidden="true"
        className="intro-percent absolute left-1/2 top-1/2 m-0 mt-[calc(var(--astronaut-size)*0.41_+_1rem)] -translate-x-1/2 font-satoshi text-sm font-medium tabular-nums tracking-[0.11em] text-white/70"
      />
    </div>
  );
}
