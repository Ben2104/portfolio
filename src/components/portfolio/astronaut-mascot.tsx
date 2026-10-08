"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, PointerEvent as ReactPointerEvent } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";

import { FRAMES } from "./astronaut-frames";
import type { Direction, Reaction } from "./astronaut-frames";

/* Head aim, ported from page-mascot: clockwise from the right to match atan2 with y down */
const CLOCKWISE: Direction[] = [
  "right",
  "down-right",
  "down",
  "down-left",
  "left",
  "up-left",
  "up",
  "up-right",
];
const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
const HYSTERESIS = 0.12;
const DEAD_ZONE_RATIO = 0.5; // of the mascot's width

const CLICK_REACTIONS: Reaction[] = ["laugh", "starstruck", "sparkle"];
const GREET_MS = 1600;
const REACTION_MS = 1100;
const SURPRISE_MS = 550;
const WAKE_MS = 700;
const BLINK_MS = 150;
const BLINK_EVERY_MS = [2800, 6000] as const;
const BLUSH_AFTER_MS = 2500;
const SLEEP_AFTER_MS = 12000;
const DIZZY_CLICKS = 5;
const DIZZY_WINDOW_MS = 1500;
const DIZZY_MS = 2200;
const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;

const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

export function AstronautMascot({ className = "" }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [direction, setDirection] = useState<Direction>("center");
  /* null shows the direction frame; a reaction overrides it */
  const [reaction, setReaction] = useState<Reaction | null>("sparkle");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const reactionRef = useRef<Reaction | null>("sparkle");
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

  const show = useCallback(
    (next: Reaction | null, { bounce = true } = {}) => {
      if (reactionRef.current === next) return;
      reactionRef.current = next;
      setReaction(next);
      if (bounce && next && !prefersReducedMotion) {
        pop.start({ scale: [0.95, 1], transition: { type: "spring", stiffness: 420, damping: 14 } });
      }
    },
    [pop, prefersReducedMotion],
  );

  const resting = useCallback((): Reaction | null => {
    if (blushing.current) return "blush";
    return hovering.current ? "love" : null;
  }, []);

  const react = useCallback(
    (next: Reaction, ms: number, options?: { bounce?: boolean }) => {
      window.clearTimeout(reactionTimer.current);
      reacting.current = true;
      show(next, options);
      reactionTimer.current = window.setTimeout(() => {
        reacting.current = false;
        show(resting(), { bounce: false });
      }, ms);
    },
    [show, resting],
  );

  /* Greeting: sparkle is the initial frame, settle after a beat */
  useEffect(() => {
    reactionTimer.current = window.setTimeout(() => {
      reacting.current = false;
      show(resting(), { bounce: false });
    }, GREET_MS);
    return () => window.clearTimeout(reactionTimer.current);
  }, [show, resting]);

  /* Blink now and then while idle */
  useEffect(() => {
    let timer: number | undefined;
    const schedule = () => {
      const [min, max] = BLINK_EVERY_MS;
      timer = window.setTimeout(() => {
        if (reactionRef.current === null) react("blink", BLINK_MS, { bounce: false });
        schedule();
      }, min + Math.random() * (max - min));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [react]);

  /* Doze off when the page goes quiet, wake up startled */
  useEffect(() => {
    const fallAsleep = () => {
      window.clearTimeout(reactionTimer.current);
      reacting.current = false;
      show("sleepy");
    };
    const onActivity = () => {
      window.clearTimeout(sleepTimer.current);
      if (reactionRef.current === "sleepy") react("surprised", WAKE_MS);
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
  }, [react, show]);

  /* Turn the head toward the cursor; fine pointers only */
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let sector = -1;
    let pointer: { x: number; y: number } | null = null;

    const aim = () => {
      const node = buttonRef.current;
      if (!node || !pointer) return;
      const rect = node.getBoundingClientRect();
      const dx = pointer.x - (rect.left + rect.width / 2);
      const dy = pointer.y - (rect.top + rect.height / 2);

      if (Math.hypot(dx, dy) < rect.width * DEAD_ZONE_RATIO) {
        sector = -1;
        setDirection("center");
        return;
      }

      // Hold the current sector until the pointer is well past its edge
      const angle = Math.atan2(dy, dx);
      if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) {
        return;
      }
      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      setDirection(CLOCKWISE[sector]);
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      aim();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", aim, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", aim);
    };
  }, []);

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
    if (!reacting.current) show(null);
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

    react(CLICK_REACTIONS[clickIndex.current % CLICK_REACTIONS.length], REACTION_MS);
    clickIndex.current += 1;
    if (!prefersReducedMotion) {
      body.start({ y: [0, -22, 0], scale: [1, 1.06, 1], transition: { duration: 0.5, ease: "easeOut" } });
    }
  };

  const sleepy = reaction === "sleepy";
  const visibleFrame = reaction ?? `look-${direction}`;

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
      className={`relative block cursor-pointer rounded-full bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-(--portfolio-accent)/60 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[12%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,145,66,0.16), transparent 68%)",
        }}
      />

      {/* Idle float — slower and tilted while asleep. Children ignore the pointer so
          only the round button face counts as hover, not the square's empty corners */}
      <motion.div
        className="pointer-events-none h-full w-full"
        animate={
          prefersReducedMotion
            ? undefined
            : sleepy
              ? { y: [0, 6, 0], rotate: [-6, -4, -6] }
              : { y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5] }
        }
        transition={{ duration: sleepy ? 5 : 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div className="h-full w-full" animate={body}>
          <motion.div className="relative h-full w-full" animate={pop}>
            {/* All frames stay mounted and decoded; swapping opacity avoids flicker */}
            {FRAMES.map((frame) => (
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
                style={{ opacity: frame === visibleFrame ? 1 : 0 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </button>
  );
}
