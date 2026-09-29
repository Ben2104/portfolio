"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useAnimationControls,
  useReducedMotion,
  useSpring,
} from "motion/react";

/* Frames live in /public/astronaut, cut from one 3×3 sheet on a shared 300px box */
const MOODS = [
  "happy",
  "love",
  "sparkle",
  "surprised",
  "starstruck",
  "blush",
  "sleepy",
  "dizzy",
  "laugh",
] as const;

type Mood = (typeof MOODS)[number];

const CLICK_MOODS: Mood[] = ["laugh", "starstruck", "sparkle"];
const GREET_MS = 1600;
const REACTION_MS = 1100;
const SURPRISE_MS = 550;
const WAKE_MS = 700;
const BLUSH_AFTER_MS = 2500;
const SLEEP_AFTER_MS = 12000;
const DIZZY_CLICKS = 5;
const DIZZY_WINDOW_MS = 1500;
const DIZZY_MS = 2200;
const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;

const clamp = (value: number) => Math.min(1, Math.max(-1, value));

export function AstronautMascot({ className = "" }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [mood, setMood] = useState<Mood>("sparkle");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const moodRef = useRef<Mood>("sparkle");
  const hovering = useRef(false);
  const blushing = useRef(false);
  const keyboardFocus = useRef(false);
  const reacting = useRef(true);
  const reactionTimer = useRef<number | undefined>(undefined);
  const blushTimer = useRef<number | undefined>(undefined);
  const sleepTimer = useRef<number | undefined>(undefined);
  const clickTimes = useRef<number[]>([]);
  const clickIndex = useRef(0);

  const body = useAnimationControls();
  const pop = useAnimationControls();

  /* Look toward the cursor */
  const tilt = { stiffness: 120, damping: 16, mass: 0.6 };
  const rotateX = useSpring(0, tilt);
  const rotateY = useSpring(0, tilt);
  const shiftX = useSpring(0, tilt);
  const shiftY = useSpring(0, tilt);

  const show = useCallback(
    (next: Mood) => {
      if (moodRef.current === next) return;
      moodRef.current = next;
      setMood(next);
      if (!prefersReducedMotion) {
        pop.start({ scale: [0.95, 1], transition: { type: "spring", stiffness: 420, damping: 14 } });
      }
    },
    [pop, prefersReducedMotion],
  );

  const resting = useCallback((): Mood => {
    if (blushing.current) return "blush";
    return hovering.current ? "love" : "happy";
  }, []);

  const react = useCallback(
    (next: Mood, ms: number) => {
      window.clearTimeout(reactionTimer.current);
      reacting.current = true;
      show(next);
      reactionTimer.current = window.setTimeout(() => {
        reacting.current = false;
        show(resting());
      }, ms);
    },
    [show, resting],
  );

  /* Greeting: the sparkle frame is the initial state, settle after a beat */
  useEffect(() => {
    reactionTimer.current = window.setTimeout(() => {
      reacting.current = false;
      show(resting());
    }, GREET_MS);
    return () => window.clearTimeout(reactionTimer.current);
  }, [show, resting]);

  /* Doze off when the page goes quiet, wake up startled */
  useEffect(() => {
    const fallAsleep = () => {
      window.clearTimeout(reactionTimer.current);
      reacting.current = false;
      rotateX.set(0);
      rotateY.set(0);
      shiftX.set(0);
      shiftY.set(0);
      show("sleepy");
    };
    const onActivity = () => {
      window.clearTimeout(sleepTimer.current);
      if (moodRef.current === "sleepy") react("surprised", WAKE_MS);
      sleepTimer.current = window.setTimeout(fallAsleep, SLEEP_AFTER_MS);
    };

    sleepTimer.current = window.setTimeout(fallAsleep, SLEEP_AFTER_MS);
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }
    return () => {
      window.clearTimeout(sleepTimer.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
    };
  }, [react, show, rotateX, rotateY, shiftX, shiftY]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const onMove = (event: PointerEvent) => {
      const node = buttonRef.current;
      if (!node || moodRef.current === "sleepy") return;
      const rect = node.getBoundingClientRect();
      const nx = clamp((event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2));
      const ny = clamp((event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2));
      rotateY.set(nx * 16);
      rotateX.set(-ny * 10);
      shiftX.set(nx * 10);
      shiftY.set(ny * 6);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [prefersReducedMotion, rotateX, rotateY, shiftX, shiftY]);

  useEffect(() => () => window.clearTimeout(blushTimer.current), []);

  const startHover = useCallback(() => {
    hovering.current = true;
    react("surprised", SURPRISE_MS);
    if (!prefersReducedMotion) {
      body.start({ scale: [1, 1.07, 1], transition: { duration: 0.35, ease: "easeOut" } });
    }
    window.clearTimeout(blushTimer.current);
    blushTimer.current = window.setTimeout(() => {
      blushing.current = true;
      if (!reacting.current) show("blush");
    }, BLUSH_AFTER_MS);
  }, [body, prefersReducedMotion, react, show]);

  const endHover = useCallback(() => {
    hovering.current = false;
    blushing.current = false;
    window.clearTimeout(blushTimer.current);
    if (!reacting.current) show("happy");
  }, [show]);

  const onPointerEnter = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse") startHover();
  };
  const onPointerLeave = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse") endHover();
  };
  const onFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.matches(":focus-visible")) return;
    keyboardFocus.current = true;
    startHover();
  };
  const onBlur = () => {
    if (!keyboardFocus.current) return;
    keyboardFocus.current = false;
    endHover();
  };

  const onClick = () => {
    const now = performance.now();
    clickTimes.current = [...clickTimes.current.filter((t) => now - t < DIZZY_WINDOW_MS), now];

    if (clickTimes.current.length >= DIZZY_CLICKS) {
      clickTimes.current = [];
      react("dizzy", DIZZY_MS);
      if (!prefersReducedMotion) {
        body.start({ rotate: [0, -14, 12, -9, 6, -3, 0], transition: { duration: 1.2, ease: "easeInOut" } });
      }
      return;
    }

    react(CLICK_MOODS[clickIndex.current % CLICK_MOODS.length], REACTION_MS);
    clickIndex.current += 1;
    if (!prefersReducedMotion) {
      body.start({ y: [0, -22, 0], scale: [1, 1.06, 1], transition: { duration: 0.5, ease: "easeOut" } });
    }
  };

  const sleepy = mood === "sleepy";

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Astronaut mascot. Click to make it react."
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`relative block cursor-pointer rounded-full bg-transparent p-0 outline-none [perspective:900px] focus-visible:ring-2 focus-visible:ring-(--portfolio-accent)/60 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[12%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,145,66,0.16), transparent 68%)",
        }}
      />

      {/* Idle float — slower and tilted while asleep */}
      <motion.div
        className="h-full w-full"
        animate={
          prefersReducedMotion
            ? undefined
            : sleepy
              ? { y: [0, 6, 0], rotate: [-6, -4, -6] }
              : { y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5] }
        }
        transition={{ duration: sleepy ? 5 : 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="h-full w-full"
          style={{ rotateX, rotateY, x: shiftX, y: shiftY }}
        >
          <motion.div className="h-full w-full" animate={body}>
            <motion.div className="relative h-full w-full" animate={pop}>
              {/* All frames stay mounted and decoded; swapping opacity avoids flicker */}
              {MOODS.map((frame) => (
                <Image
                  key={frame}
                  src={`/astronaut/${frame}.webp`}
                  alt=""
                  width={300}
                  height={300}
                  unoptimized
                  loading="eager"
                  fetchPriority={frame === "sparkle" ? "high" : "auto"}
                  draggable={false}
                  className="absolute inset-0 h-full w-full select-none"
                  style={{ opacity: frame === mood ? 1 : 0 }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </button>
  );
}
