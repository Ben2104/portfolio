"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import {
  leadershipExperience,
  professionalExperience,
  profile,
  teachingExperience,
  volunteerExperience,
} from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

const CUTOUT_IMAGE = "/photos/cutout-experience.png";

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
  ...professionalExperience.map((entry) => ({ ...entry, category: "Professional" })),
  ...teachingExperience.map((entry) => ({ ...entry, category: "Teaching" })),
  ...leadershipExperience.map((entry) => ({ ...entry, category: "Leadership & Research" })),
  ...volunteerExperience.map((entry) => ({ ...entry, category: "Technical / Volunteer" })),
].sort((a, b) => periodStartRank(b.period) - periodStartRank(a.period));

type TimelineEntry = (typeof timeline)[number];

function TimelineNode({ color }: { color: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      initial={{ scale: prefersReducedMotion ? 1 : 0.5, opacity: 0.35 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-10% 0px -40% 0px" }}
      transition={{ duration: 0.4 }}
      className="absolute -left-[33px] top-6 h-[10px] w-[10px] rounded-full"
      style={{ background: color, boxShadow: `0 0 0 4px ${color}22, 0 0 16px ${color}66` }}
    />
  );
}

function TimelineCard({ experience, index }: { experience: TimelineEntry; index: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -20% 0px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.05 }}
      className="relative rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6"
    >
      <TimelineNode color={experience.color} />

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <span
            className="font-satoshi mb-2 inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{
              color: experience.color,
              borderColor: `${experience.color}88`,
              background: `${experience.color}1a`,
            }}
          >
            {experience.category}
          </span>
          <h4 className="font-clash m-0 text-[24px] font-bold leading-[1.2] text-(--portfolio-text)">
            {experience.role}
          </h4>
          <p className="font-satoshi mb-0 mt-2 text-[15px] leading-[1.55] text-(--portfolio-muted)">
            <span style={{ color: experience.color }}>{experience.company}</span>
            {" · "}
            {experience.location}
          </p>
        </div>
        <span className="font-satoshi w-fit shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-(--portfolio-subtle)">
          {experience.period}
        </span>
      </div>

      {experience.highlights.length > 0 ? (
        <ul className="mt-5 space-y-2.5">
          {experience.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: experience.color }}
              />
              <span className="font-satoshi text-[14px] leading-[1.7] text-white/78">
                {highlight}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {experience.tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {experience.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/16 px-3 py-1.5 font-satoshi text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress: parallaxProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(parallaxProgress, [0, 1], [-24, 24]);

  const { scrollYProgress: fillProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const spineScale = useTransform(fillProgress, [0, 1], [0, 1]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative bg-(--portfolio-bg) px-6 py-28"
    >
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="Experience" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Experience
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[454px_minmax(0,1fr)] md:items-start">
          <div className="md:sticky md:top-28 md:self-start">
            <motion.div
              style={{ y: prefersReducedMotion ? 0 : parallaxY }}
              className="relative mx-auto aspect-2/3 w-full max-w-90"
            >
              <div
                className="pointer-events-none absolute inset-x-0 bottom-6 h-32"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(255,145,66,0.28), transparent 72%)",
                }}
              />
              <Image
                src={CUTOUT_IMAGE}
                alt={`${profile.name} portrait cutout`}
                fill
                className="object-contain object-bottom"
                style={{ filter: "drop-shadow(0 24px 28px rgba(0,0,0,0.55))" }}
                sizes="(max-width: 900px) 70vw, 360px"
              />
              <div
                className="pointer-events-none absolute inset-x-10 bottom-6 h-px"
                style={{ background: "rgba(255,255,255,0.14)" }}
              />
            </motion.div>
          </div>

          <div className="relative pl-8">
            <div className="absolute left-0 top-0 h-full w-[2px] bg-white/10" />
            <motion.div
              style={{ scaleY: prefersReducedMotion ? 1 : spineScale }}
              className="absolute left-0 top-0 h-full w-[2px] origin-top bg-(--portfolio-accent)"
            />

            <div className="space-y-6">
              {timeline.map((experience, index) => (
                <TimelineCard
                  key={`${experience.company}-${experience.role}`}
                  experience={experience}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
