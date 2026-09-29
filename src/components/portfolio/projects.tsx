"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { projects } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

/* Three.js and the shelf only download when the section nears the viewport */
const LAZY_ROOT_MARGIN = "400px 0px";

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

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || nearViewport) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: LAZY_ROOT_MARGIN },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [nearViewport]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-label="Projects"
      className="relative h-svh min-h-[620px] bg-(--portfolio-bg)"
      /* html has scroll-padding-top: 110px for the floating navbar; this stage is
         full-height, so anchor jumps should land its top edge at 0 */
      style={{ scrollMarginTop: -110 }}
    >
      {(projects as readonly unknown[]).length === 0 ? (
        <div className="section-y">
          <ShelfHeader />
          <p className="font-satoshi mt-12 text-center text-[15px] text-(--portfolio-muted)">
            No projects available yet.
          </p>
        </div>
      ) : nearViewport ? (
        <ProjectShelf header={<ShelfHeader />} sectionRef={sectionRef} />
      ) : (
        <ShelfPoster />
      )}
    </section>
  );
}
