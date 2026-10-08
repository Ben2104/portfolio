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
const HOLD_MS = 1400;
const EXIT_MS = 800;
/* The overlay astronaut stays put this long after landing to cover the real mascot's fade-in */
const LINGER_MS = 350;
/* Matches the CSS failsafe delay on .intro-overlay in globals.css */
const FAILSAFE_MS = 3600;
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
