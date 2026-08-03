"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import {
  leadershipExperience,
  professionalExperience,
  teachingExperience,
  volunteerExperience,
} from "@/data/portfolio";

import { SectionHeading } from "./section-heading";
import { TimelineEntryCard } from "./timeline-entry";

const SPINE_ACCENT = "#00d4ff";

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
] as const;

function periodStartRank(period: string) {
  const [start] = period.split("—").map((part) => part.trim());
  const [month, year] = start.split(" ");
  const monthIndex = MONTHS.indexOf(month.toLowerCase().slice(0, 3) as (typeof MONTHS)[number]);
  return Number(year) * 12 + (monthIndex === -1 ? 0 : monthIndex);
}

const timeline = [
  ...professionalExperience.map((entry) => ({ ...entry, category: "Professional" as const })),
  ...teachingExperience.map((entry) => ({ ...entry, category: "Teaching" as const })),
  ...leadershipExperience.map((entry) => ({
    ...entry,
    category: "Leadership & Research" as const,
  })),
  ...volunteerExperience.map((entry) => ({
    ...entry,
    category: "Technical / Volunteer" as const,
  })),
].sort((a, b) => periodStartRank(b.period) - periodStartRank(a.period));

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative bg-(--portfolio-bg) px-6 py-28"
    >
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent={SPINE_ACCENT} label="Experience" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Experience
        </h2>

        <div className="relative mt-12">
          <div className="absolute left-2 top-0 h-full w-0.5 -translate-x-1/2 bg-white/10 md:left-1/2" />
          <motion.div
            style={{
              scaleY: prefersReducedMotion ? 1 : spineScale,
              background: SPINE_ACCENT,
            }}
            className="absolute left-2 top-0 h-full w-0.5 origin-top -translate-x-1/2 md:left-1/2"
          />

          <div className="space-y-8">
            {timeline.map((entry, index) => (
              <TimelineEntryCard
                key={`${entry.company}-${entry.role}`}
                entry={entry}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
