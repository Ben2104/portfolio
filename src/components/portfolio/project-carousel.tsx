"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";

const DOT_ACCENT = "#00d4ff";

export function ProjectCarousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const pages = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    setPageCount(pages);
    setActivePage(Math.min(pages - 1, Math.round(el.scrollLeft / el.clientWidth)));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    sync();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const goToPage = useCallback(
    (page: number) => {
      const el = trackRef.current;
      if (!el) return;
      const target = Math.max(0, Math.min(pageCount - 1, page));
      el.scrollTo({
        left: target * el.clientWidth,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [pageCount, prefersReducedMotion],
  );

  const atStart = activePage <= 0;
  const atEnd = activePage >= pageCount - 1;

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/22 bg-black/50 text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="relative mt-14">
      <button
        type="button"
        onClick={() => goToPage(activePage - 1)}
        disabled={atStart}
        aria-label="Previous projects"
        className={`${arrowClass} absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 lg:flex`}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => goToPage(activePage + 1)}
        disabled={atEnd}
        aria-label="Next projects"
        className={`${arrowClass} absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 lg:flex`}
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goToPage(activePage + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToPage(activePage - 1);
          }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <div className="shrink-0 basis-[86%] snap-start sm:basis-[47%] lg:basis-[30.5%]">
            {child}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goToPage(activePage - 1)}
          disabled={atStart}
          aria-label="Previous projects"
          className={`${arrowClass} lg:hidden`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              aria-label={`Go to project page ${page + 1}`}
              aria-current={page === activePage}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: page === activePage ? 18 : 6,
                background: page === activePage ? DOT_ACCENT : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goToPage(activePage + 1)}
          disabled={atEnd}
          aria-label="Next projects"
          className={`${arrowClass} lg:hidden`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
