"use client";

import { Briefcase, GraduationCap, Users, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export type TimelineCategory =
  | "Professional"
  | "Teaching"
  | "Leadership & Research"
  | "Technical / Volunteer";

export type TimelineEntry = {
  role: string;
  company: string;
  period: string;
  location: string;
  color: string;
  description: string;
  highlights: readonly string[];
  tags: readonly string[];
  category: TimelineCategory;
};

const categoryIcon = {
  Professional: Briefcase,
  Teaching: GraduationCap,
  "Leadership & Research": Users,
  "Technical / Volunteer": Wrench,
} as const;

export function TimelineEntryCard({
  entry,
  index,
}: {
  entry: TimelineEntry;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = categoryIcon[entry.category];
  const isRight = index % 2 === 1;

  const notchClass = isRight
    ? "absolute -left-[7px] top-5 h-3 w-3 rotate-45 border-b border-l border-white/10 bg-(--portfolio-surface)"
    : "absolute -left-[7px] top-5 h-3 w-3 rotate-45 border-b border-l border-white/10 bg-(--portfolio-surface) md:left-auto md:-right-[7px] md:border-b-0 md:border-l-0 md:border-r md:border-t";

  return (
    <div className="relative grid grid-cols-1 pl-10 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:pl-0">
      <span
        className="absolute left-2 top-3 z-10 flex h-[34px] w-[34px] -translate-x-1/2 items-center justify-center rounded-full bg-(--portfolio-surface) md:left-1/2"
        style={{
          boxShadow: `0 0 0 1px ${entry.color}73, 0 0 14px ${entry.color}40`,
        }}
      >
        <Icon size={14} style={{ color: entry.color }} />
      </span>

      <motion.article
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -20% 0px" }}
        transition={{ duration: 0.45 }}
        className={`relative rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6 md:row-start-1 ${
          isRight ? "md:col-start-3" : "md:col-start-1"
        }`}
      >
        <span className={notchClass} />

        <span
          className="font-satoshi inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{
            color: entry.color,
            borderColor: `${entry.color}88`,
            background: `${entry.color}1a`,
          }}
        >
          {entry.category}
        </span>

        <span className="font-satoshi mt-3 block text-[11px] font-bold uppercase tracking-[0.08em] text-(--portfolio-subtle) md:hidden">
          {entry.period}
        </span>

        <h4 className="font-clash m-0 mt-3 text-[24px] font-bold leading-[1.2] text-(--portfolio-text)">
          {entry.role}
        </h4>

        <p className="font-satoshi mb-0 mt-2 text-[15px] leading-[1.55] text-(--portfolio-muted)">
          <span style={{ color: entry.color }}>{entry.company}</span>
          {" · "}
          {entry.location}
        </p>

        {entry.highlights.length > 0 ? (
          <ul className="mt-5 space-y-2.5">
            {entry.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: entry.color }}
                />
                <span className="font-satoshi text-[14px] leading-[1.7] text-white/78">
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {entry.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="font-satoshi rounded-full border border-white/16 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </motion.article>

      <div
        className={`hidden md:row-start-1 md:block md:pt-4 ${
          isRight ? "md:col-start-1 md:pr-6 md:text-right" : "md:col-start-3 md:pl-6"
        }`}
      >
        <span className="font-satoshi text-[11px] font-bold uppercase tracking-[0.08em] text-(--portfolio-subtle)">
          {entry.period}
        </span>
      </div>
    </div>
  );
}
