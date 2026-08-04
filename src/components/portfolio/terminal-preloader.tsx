"use client";

import { useEffect, useRef, useState } from "react";

import {
  BOOT_EXIT_DELAY,
  BOOT_SEQUENCE_DURATION,
  type BootLine,
  LINUX_BOOT_SEQUENCE,
} from "./linux-boot-sequence";

type BootPhase = "booting" | "exiting" | "complete";

type TerminalPreloaderProps = {
  onComplete: () => void;
};

// Clear this key in DevTools session storage to replay the boot locally.
const BOOT_SESSION_KEY = "portfolio-linux-boot-complete";
const BOOT_FAILSAFE_DELAY = BOOT_SEQUENCE_DURATION + BOOT_EXIT_DELAY + 1500;
const REDUCED_BOOT_DURATION = 650;
const REDUCED_BOOT_EXIT_DELAY = 150;
const reducedBootLineIds = new Set([
  "kernel",
  "target",
  "login-success",
  "prompt",
]);
const reducedBootSequence = LINUX_BOOT_SEQUENCE.filter((line) =>
  reducedBootLineIds.has(line.id),
);

const toneClasses: Record<BootLine["tone"], string> = {
  kernel: "text-[#bfb8b3]",
  service: "text-[#ded8d4]",
  portfolio: "text-[#ffd8bd]",
  warning: "text-[#ffc078]",
  login: "text-[#e8e1dc]",
  prompt: "text-[#fff8f3]",
};

function BootLineRow({ line }: { line: BootLine }) {
  if (line.tone === "prompt") {
    return (
      <div className="boot-line mt-4 flex min-w-0 items-baseline text-[13px] font-semibold tracking-[-0.01em] sm:mt-5 sm:text-[15px]">
        <span className="text-(--portfolio-accent)">khoi@portfolio</span>
        <span className="text-[#9a8d85]">:~$</span>
        <span className="ml-2 text-[#fff8f3]">startx</span>
        <span className="boot-cursor ml-1.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-(--portfolio-accent)" />
      </div>
    );
  }

  return (
    <div
      className={`boot-line flex min-w-0 items-baseline gap-2 text-[11px] leading-[1.55] sm:gap-3 sm:text-[13px] ${toneClasses[line.tone]}`}
    >
      {line.status ? (
        <span
          className={`w-[3.1rem] shrink-0 whitespace-nowrap font-semibold sm:w-[3.6rem] ${
            line.status === "ok"
              ? "text-(--portfolio-accent)"
              : "text-[#ffc078]"
          }`}
        >
          [ {line.status === "ok" ? "OK" : "!!"} ]
        </span>
      ) : line.timestamp ? (
        <span className="w-[4.7rem] shrink-0 whitespace-nowrap text-[#776b64] tabular-nums sm:w-[5.45rem]">
          [{line.timestamp}]
        </span>
      ) : (
        <span className="w-[3.1rem] shrink-0 sm:w-[3.6rem]" />
      )}
      <span className="min-w-0 [overflow-wrap:anywhere]">{line.message}</span>
    </div>
  );
}

export function TerminalPreloader({ onComplete }: TerminalPreloaderProps) {
  const [visibleLines, setVisibleLines] = useState<readonly BootLine[]>([]);
  const [phase, setPhase] = useState<BootPhase>("booting");
  const viewportRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const timers: number[] = [];

    const storeCompletion = () => {
      try {
        window.sessionStorage.setItem(BOOT_SESSION_KEY, "true");
      } catch {
        // Storage can be unavailable in private or restricted browser contexts.
      }
    };

    const finish = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      storeCompletion();
      setPhase("complete");
      onComplete();
    };

    timers.push(window.setTimeout(finish, BOOT_FAILSAFE_DELAY));

    try {
      if (window.sessionStorage.getItem(BOOT_SESSION_KEY) === "true") {
        finish();
        return () => timers.forEach((timer) => window.clearTimeout(timer));
      }
    } catch {
      // Continue without session persistence when storage access is blocked.
    }

    let prefersReducedMotion = false;
    try {
      prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    } catch {
      // Default to the full sequence if media queries are unavailable.
    }
    reducedMotionRef.current = prefersReducedMotion;

    const sequence = prefersReducedMotion
      ? reducedBootSequence
      : LINUX_BOOT_SEQUENCE;
    const exitAt = prefersReducedMotion
      ? REDUCED_BOOT_DURATION
      : BOOT_SEQUENCE_DURATION;
    const exitDelay = prefersReducedMotion
      ? REDUCED_BOOT_EXIT_DELAY
      : BOOT_EXIT_DELAY;

    try {
      sequence.forEach((line, index) => {
        const lineDelay = prefersReducedMotion ? index * 90 : line.at;
        timers.push(
          window.setTimeout(
            () => setVisibleLines(sequence.slice(0, index + 1)),
            lineDelay,
          ),
        );
      });

      timers.push(
        window.setTimeout(() => {
          storeCompletion();
          setPhase("exiting");
        }, exitAt),
        window.setTimeout(finish, exitAt + exitDelay),
      );
    } catch {
      finish();
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [onComplete]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || visibleLines.length === 0) return;

    const animationFrame = window.requestAnimationFrame(() => {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior:
          reducedMotionRef.current || visibleLines.length <= 3
            ? "auto"
            : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [visibleLines]);

  useEffect(() => {
    if (phase === "complete") return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [phase]);

  if (phase === "complete") return null;

  return (
    <div
      aria-busy="true"
      aria-label="Loading portfolio."
      className={`fixed inset-0 z-[9999] isolate overflow-hidden bg-[#050302] font-mono text-[#ded8d4] ${
        phase === "exiting" ? "boot-exit" : ""
      }`}
      role="status"
    >
      <div aria-hidden="true" className="contents">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,145,66,0.09),transparent_58%)]" />
        <div className="boot-vignette pointer-events-none absolute inset-0 z-20" />
        <div className="boot-scanlines pointer-events-none absolute inset-0 z-10 opacity-35" />
        <div className="boot-bloom pointer-events-none absolute inset-0 z-30" />

        <div className="relative z-0 mx-auto flex h-full w-full max-w-[1120px] flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <header className="flex shrink-0 items-center justify-between border-b border-(--portfolio-accent)/15 pb-3 text-[9px] uppercase tracking-[0.2em] text-[#776b64] sm:text-[10px]">
            <span>
              <span className="text-(--portfolio-accent)">KHOI</span>/OS 6.8.12
            </span>
            <span className="hidden sm:inline">tty1 · portfolio session</span>
            <span className="text-[#9a8d85]">booting</span>
          </header>

          <div
            className="mt-[clamp(1.5rem,6vh,4.5rem)] min-h-0 flex-1 overflow-hidden"
            ref={viewportRef}
          >
            <div className="flex min-h-full flex-col justify-end pb-5 sm:pb-8">
              <div className="space-y-[2px] sm:space-y-1">
                {visibleLines.map((line) => (
                  <BootLineRow key={line.id} line={line} />
                ))}
              </div>
            </div>
          </div>

          <footer className="flex shrink-0 items-center gap-3 border-t border-(--portfolio-accent)/10 pt-3 text-[8px] uppercase tracking-[0.18em] text-[#665b54] sm:text-[9px]">
            <span className="h-px flex-1 overflow-hidden bg-[#241711]">
              <span
                className="block h-full bg-(--portfolio-accent)/70 transition-[width] duration-200 ease-out"
                style={{
                  width: `${Math.round(
                    (visibleLines.length /
                      (reducedMotionRef.current
                        ? reducedBootSequence.length
                        : LINUX_BOOT_SEQUENCE.length)) *
                      100,
                  )}%`,
                }}
              />
            </span>
            <span className="tabular-nums">
              {String(visibleLines.length).padStart(2, "0")}/
              {reducedMotionRef.current
                ? reducedBootSequence.length
                : LINUX_BOOT_SEQUENCE.length}
            </span>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        .boot-line {
          animation: boot-line-in 180ms cubic-bezier(0.22, 1, 0.36, 1) both;
          text-shadow: 0 0 12px rgba(255, 145, 66, 0.1);
        }

        .boot-cursor {
          animation: boot-cursor-blink 700ms steps(1, end) infinite;
          box-shadow: 0 0 12px rgba(255, 145, 66, 0.48);
        }

        .boot-scanlines {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 2px,
            rgba(0, 0, 0, 0.28) 3px,
            rgba(0, 0, 0, 0.28) 4px
          );
          background-size: 100% 4px;
        }

        .boot-vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 48%,
            rgba(0, 0, 0, 0.48) 100%
          );
        }

        .boot-bloom {
          opacity: 0;
        }

        .boot-exit {
          animation: boot-screen-exit ${BOOT_EXIT_DELAY}ms
            cubic-bezier(0.76, 0, 0.24, 1) forwards;
          transform-origin: center top;
        }

        .boot-exit .boot-bloom {
          animation: boot-bloom ${BOOT_EXIT_DELAY}ms ease-out forwards;
          background: #ffd2b2;
        }

        @keyframes boot-line-in {
          from {
            opacity: 0;
            transform: translateY(5px);
            filter: blur(1.5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes boot-cursor-blink {
          0%,
          52% {
            opacity: 1;
          }
          53%,
          100% {
            opacity: 0;
          }
        }

        @keyframes boot-screen-exit {
          0% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
            filter: brightness(1);
          }
          28% {
            opacity: 1;
            filter: brightness(1.55);
          }
          100% {
            opacity: 0;
            transform: translateY(-2.5vh) scaleY(0.985);
            filter: brightness(1.8);
          }
        }

        @keyframes boot-bloom {
          0% {
            opacity: 0;
            transform: scaleY(0.01);
          }
          25% {
            opacity: 0.18;
            transform: scaleY(0.012);
          }
          100% {
            opacity: 0;
            transform: scaleY(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .boot-line,
          .boot-cursor,
          .boot-exit,
          .boot-exit .boot-bloom {
            animation: none;
          }

          .boot-exit {
            opacity: 0;
          }

          .boot-scanlines {
            opacity: 0.16;
          }
        }
      `}</style>
    </div>
  );
}
