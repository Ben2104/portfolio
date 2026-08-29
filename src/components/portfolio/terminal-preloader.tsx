"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  BOOT_EXIT_DELAY,
  BOOT_SEQUENCE_DURATION,
  type BootLine,
  LINUX_BOOT_SEQUENCE,
} from "./linux-boot-sequence";

type BootPhase = "booting" | "awaiting" | "exiting" | "complete";

type TerminalPreloaderProps = {
  onComplete: () => void;
};

// Clear this key in DevTools session storage to replay the boot locally.
const BOOT_SESSION_KEY = "portfolio-linux-boot-complete";
const BOOT_PROMPT_FAILSAFE_DELAY =
  BOOT_SEQUENCE_DURATION + BOOT_EXIT_DELAY + 1500;
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

function storeBootCompletion() {
  try {
    window.sessionStorage.setItem(BOOT_SESSION_KEY, "true");
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

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
      className={`boot-line grid w-full min-w-0 max-w-full grid-cols-[4.7rem_minmax(0,1fr)] items-baseline gap-2 text-[11px] leading-[1.55] sm:grid-cols-[5.45rem_minmax(0,1fr)] sm:gap-3 sm:text-[13px] ${toneClasses[line.tone]}`}
    >
      {line.status ? (
        <span
          className={`whitespace-nowrap font-semibold ${
            line.status === "ok"
              ? "text-(--portfolio-accent)"
              : "text-[#ffc078]"
          }`}
        >
          [ {line.status === "ok" ? "OK" : "!!"} ]
        </span>
      ) : line.timestamp ? (
        <span className="whitespace-nowrap text-[#776b64] tabular-nums">
          [{line.timestamp}]
        </span>
      ) : (
        <span />
      )}
      <span className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere]">
        {line.message}
      </span>
    </div>
  );
}

export function TerminalPreloader({ onComplete }: TerminalPreloaderProps) {
  const [visibleLines, setVisibleLines] = useState<readonly BootLine[]>([]);
  const [phase, setPhase] = useState<BootPhase>(() => {
    try {
      if (window.sessionStorage.getItem(BOOT_SESSION_KEY) === "true") {
        return "complete";
      }
    } catch {
      // Continue without session persistence when storage access is blocked.
    }
    return "booting";
  });
  const [reducedMotion] = useState(() => {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });
  const viewportRef = useRef<HTMLDivElement>(null);
  const exitTimerRef = useRef<number | null>(null);
  const didCompleteRef = useRef(false);
  const didContinueRef = useRef(false);

  const completeBoot = useCallback(() => {
    if (didCompleteRef.current) return;

    didCompleteRef.current = true;
    setPhase("complete");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const timers: number[] = [];

    if (phase === "complete") {
      if (!didCompleteRef.current) {
        didCompleteRef.current = true;
        onComplete();
      }
      return;
    }

    const sequence = reducedMotion ? reducedBootSequence : LINUX_BOOT_SEQUENCE;
    const exitAt = reducedMotion
      ? REDUCED_BOOT_DURATION
      : BOOT_SEQUENCE_DURATION;

    const showContinuePrompt = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      setVisibleLines(sequence);
      setPhase("awaiting");
    };

    timers.push(
      window.setTimeout(showContinuePrompt, BOOT_PROMPT_FAILSAFE_DELAY),
    );

    try {
      sequence.forEach((line, index) => {
        const lineDelay = reducedMotion ? index * 90 : line.at;
        timers.push(
          window.setTimeout(
            () => setVisibleLines(sequence.slice(0, index + 1)),
            lineDelay,
          ),
        );
      });

      timers.push(window.setTimeout(showContinuePrompt, exitAt));
    } catch {
      showContinuePrompt();
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `phase` is intentionally excluded; adding it would restart this timer sequence on every phase change.
  }, [onComplete, reducedMotion]);

  useEffect(
    () => () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    },
    [],
  );

  const handleContinue = useCallback(() => {
    if (phase !== "awaiting" || didContinueRef.current) return;

    didContinueRef.current = true;
    storeBootCompletion();
    setPhase("exiting");

    const exitDelay = reducedMotion
      ? REDUCED_BOOT_EXIT_DELAY
      : BOOT_EXIT_DELAY;

    try {
      exitTimerRef.current = window.setTimeout(completeBoot, exitDelay);
    } catch {
      completeBoot();
    }
  }, [completeBoot, phase, reducedMotion]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || visibleLines.length === 0) return;

    const animationFrame = window.requestAnimationFrame(() => {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior:
          reducedMotion || visibleLines.length <= 3
            ? "auto"
            : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [visibleLines, reducedMotion]);

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
      className={`fixed inset-0 z-[9999] isolate overflow-hidden bg-[#050302] font-mono text-[#ded8d4] ${
        phase === "exiting" ? "boot-exit" : ""
      }`}
    >
      <span aria-live="polite" className="sr-only" role="status">
        {phase === "awaiting"
          ? "Portfolio ready. Click to continue."
          : "Loading portfolio."}
      </span>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,145,66,0.09),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="boot-vignette pointer-events-none absolute inset-0 z-20"
      />
      <div
        aria-hidden="true"
        className="boot-scanlines pointer-events-none absolute inset-0 z-10 opacity-35"
      />
      <div
        aria-hidden="true"
        className="boot-bloom pointer-events-none absolute inset-0 z-30"
      />

      <div className="relative z-0 mx-auto flex h-full w-full max-w-[1120px] flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <header
          aria-hidden="true"
          className="flex shrink-0 items-center justify-between border-b border-(--portfolio-accent)/15 pb-3 text-[9px] uppercase tracking-[0.2em] text-[#776b64] sm:text-[10px]"
        >
          <span>
            <span className="text-(--portfolio-accent)">KHOI</span>/OS 6.8.12
          </span>
          <span className="hidden sm:inline">tty1 · portfolio session</span>
          <span className="text-[#9a8d85]">
            {phase === "booting" ? "booting" : "ready"}
          </span>
        </header>

        <div
          className="mt-[clamp(1.5rem,6vh,4.5rem)] min-h-0 flex-1 overflow-hidden"
          ref={viewportRef}
        >
          <div className="flex min-h-full flex-col justify-end pb-5 sm:pb-8">
            <div aria-hidden="true" className="space-y-[2px] sm:space-y-1">
              {visibleLines.map((line) => (
                <BootLineRow key={line.id} line={line} />
              ))}
            </div>

            {phase === "awaiting" ? (
              <button
                className="boot-continue mt-5 inline-flex w-fit items-center gap-2.5 border border-(--portfolio-accent)/35 bg-(--portfolio-accent)/8 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--portfolio-accent) transition-colors hover:bg-(--portfolio-accent)/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--portfolio-accent)/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050302] sm:mt-6 sm:text-[11px]"
                onClick={handleContinue}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 bg-(--portfolio-accent) shadow-[0_0_10px_rgba(255,145,66,0.7)]"
                />
                Click to continue
                <span aria-hidden="true" className="text-[#9a8d85]">
                  ↵
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <footer
          aria-hidden="true"
          className="flex shrink-0 items-center gap-3 border-t border-(--portfolio-accent)/10 pt-3 text-[8px] uppercase tracking-[0.18em] text-[#665b54] sm:text-[9px]"
        >
          <span className="h-px flex-1 overflow-hidden bg-[#241711]">
            <span
              className="block h-full bg-(--portfolio-accent)/70 transition-[width] duration-200 ease-out"
              style={{
                width: `${Math.round(
                  (visibleLines.length /
                    (reducedMotion
                      ? reducedBootSequence.length
                      : LINUX_BOOT_SEQUENCE.length)) *
                    100,
                )}%`,
              }}
            />
          </span>
          <span className="tabular-nums">
            {String(visibleLines.length).padStart(2, "0")}/
            {reducedMotion
              ? reducedBootSequence.length
              : LINUX_BOOT_SEQUENCE.length}
          </span>
        </footer>
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

        .boot-continue {
          animation: boot-continue-in 280ms cubic-bezier(0.22, 1, 0.36, 1)
            both;
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

        @keyframes boot-continue-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
          .boot-continue,
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
