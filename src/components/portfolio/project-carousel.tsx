"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";
import { useReducedMotion } from "motion/react";

const DOT_ACCENT = "#00d4ff";

function readMetrics(el: HTMLDivElement | null) {
  if (!el || el.clientWidth === 0) return null;
  const count = el.children.length;
  const first = el.firstElementChild as HTMLElement | null;
  if (!first || count === 0) return null;
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
  const step = first.getBoundingClientRect().width + gap;
  if (step <= 0) return null;
  const perView = Math.max(1, Math.floor((el.clientWidth + gap) / step));
  const lastIndex = Math.max(0, count - perView);
  const pages = Math.ceil(lastIndex / perView) + 1;
  return { el, step, perView, lastIndex, pages };
}

export function ProjectCarousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    didDrag: false,
    startScrollLeft: 0,
    startX: 0,
  });
  const prefersReducedMotion = useReducedMotion();
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const sync = useCallback(() => {
    const m = readMetrics(trackRef.current);
    if (!m) return;
    const { el, step, perView, lastIndex, pages } = m;
    const index = Math.round(el.scrollLeft / step);
    setPageCount(pages);
    setActivePage(Math.min(pages - 1, Math.round(index / perView)));
    setAtStart(index <= 0);
    setAtEnd(index >= lastIndex);
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
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sync]);

  const goToPage = useCallback(
    (page: number) => {
      const m = readMetrics(trackRef.current);
      if (!m) return;
      const { el, step, perView, lastIndex } = m;
      const index = Math.max(0, Math.min(lastIndex, page * perView));
      el.scrollTo({
        left: index * step,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const track = trackRef.current;
    if (!track) return;

    dragState.current = {
      active: true,
      didDrag: false,
      startScrollLeft: track.scrollLeft,
      startX: event.clientX,
    };
    track.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !dragState.current.active) return;

    const distance = event.clientX - dragState.current.startX;
    if (Math.abs(distance) > 4) {
      dragState.current.didDrag = true;
      event.preventDefault();
    }

    track.scrollLeft = dragState.current.startScrollLeft - distance;
  };

  const finishDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!dragState.current.active) return;

    dragState.current.active = false;
    setIsDragging(false);

    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    window.setTimeout(() => {
      dragState.current.didDrag = false;
    }, 0);
  };

  const arrowClass =
    "flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/45 bg-(--portfolio-accent) text-[#171717] shadow-[0_8px_26px_rgba(255,145,66,0.34)] transition-[background-color,border-color,box-shadow,color] duration-200 hover:border-white/70 hover:bg-[#ffa661] hover:shadow-[0_10px_30px_rgba(255,145,66,0.46)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-(--portfolio-bg) disabled:cursor-not-allowed disabled:border-white/15 disabled:bg-white/8 disabled:text-white/30 disabled:shadow-none";

  return (
    <div className="relative mt-14">
      <button
        type="button"
        onClick={() => goToPage(activePage - 1)}
        disabled={atStart}
        aria-label="Previous projects"
        className={`${arrowClass} absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 lg:flex`}
      >
        <ChevronLeft aria-hidden="true" size={26} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => goToPage(activePage + 1)}
        disabled={atEnd}
        aria-label="Next projects"
        className={`${arrowClass} absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 lg:flex`}
      >
        <ChevronRight aria-hidden="true" size={26} strokeWidth={2.5} />
      </button>

      <p
        id="projects-carousel-instructions"
        className="font-satoshi mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/60"
      >
        <MoveHorizontal aria-hidden="true" size={17} />
        Drag to explore
      </p>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        aria-describedby="projects-carousel-instructions"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
        onClickCapture={(event) => {
          if (dragState.current.didDrag) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onDragStart={(event) => event.preventDefault()}
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
        className={`flex touch-pan-y gap-5 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--portfolio-accent) [&::-webkit-scrollbar]:hidden ${
          isDragging
            ? "cursor-grabbing select-none snap-none"
            : "cursor-grab snap-x snap-mandatory"
        }`}
      >
        {Children.map(children, (child) => (
          <div className="flex shrink-0 basis-[86%] snap-start last:snap-end sm:basis-[47%] lg:basis-[30.5%] [&>*]:w-full">
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
          <ChevronLeft aria-hidden="true" size={26} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              aria-label={`Go to project page ${page + 1}`}
              aria-current={page === activePage ? "page" : undefined}
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
          <ChevronRight aria-hidden="true" size={26} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
