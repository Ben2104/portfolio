"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { projects } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

function ShelfHeader() {
  return (
    <div className="container-fluid">
      <SectionHeading accent="var(--portfolio-accent)" label="Featured Work" />
      <h2 className="font-clash m-0 text-(length:--fs-h2) font-bold leading-[1.02] tracking-[-0.02em] text-(--portfolio-text)">
        My Projects Highlight
      </h2>
    </div>
  );
}

/* Lightweight stand-in while the shelf loads: same frame, CSS-only book silhouettes */
function ShelfPoster() {
  const heights = [62, 56, 60, 66, 58, 61, 64];
  return (
    <div className="relative h-full overflow-hidden bg-(--portfolio-bg)" aria-hidden="true">
      <div className="absolute inset-x-0 top-[clamp(6.5rem,9vw,9rem)]">
        <ShelfHeader />
      </div>
      <div className="absolute inset-x-0 bottom-[30%] flex items-end justify-center gap-[3vw]">
        {heights.map((height, index) => (
          <div
            key={index}
            className="w-[clamp(64px,9vw,150px)] animate-pulse rounded-[3px] bg-white/[0.06]"
            style={{ height: `${height / 2}svh`, animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-[calc(30%-14px)] h-[14px] bg-[linear-gradient(180deg,#3a2118,#1c0e0a)] opacity-70" />
    </div>
  );
}

const ProjectShelf = dynamic(() => import("./project-shelf/project-shelf"), {
  ssr: false,
  loading: () => <ShelfPoster />,
});

/* Scroll distance the pinned shelf spends on each book after the first */
const SCROLL_PER_BOOK = "70svh";

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

  const bookCount = (projects as readonly unknown[]).length;

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-label="Projects"
      className="relative bg-(--portfolio-bg)"
      /* Runway: one pinned screen plus scroll distance per extra book. html has
         scroll-padding-top: 110px for the floating navbar; the pinned stage is
         full-height, so anchor jumps should land its top edge at 0 */
      style={{
        scrollMarginTop: -110,
        height: bookCount > 1 ? `calc(max(100svh, 620px) + ${bookCount - 1} * ${SCROLL_PER_BOOK})` : undefined,
      }}
    >
      <div className="sticky top-0 h-svh min-h-[620px] overflow-hidden">
        {bookCount === 0 ? (
          <div className="section-y">
            <ShelfHeader />
            <p className="font-satoshi mt-12 text-center text-[15px] text-(--portfolio-muted)">
              No projects available yet.
            </p>
          </div>
        ) : shelfRequested ? (
          <ProjectShelf header={<ShelfHeader />} sectionRef={sectionRef} />
        ) : (
          <ShelfPoster />
        )}
      </div>
    </section>
  );
}
