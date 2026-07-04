"use client";

import { motion } from "motion/react";

import { education } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Education() {
  return (
    <section id="education" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="Education" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Education
        </h2>

        <div className="mt-10 space-y-5">
          {education.map((entry) => (
            <motion.article
              key={entry.school}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-clash m-0 text-[24px] font-bold leading-[1.2] text-(--portfolio-text)">
                    {entry.school}
                  </h3>
                  <p className="font-satoshi mb-0 mt-2 text-[15px] leading-[1.55] text-(--portfolio-muted)">
                    {entry.degree} · {entry.location}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-(--portfolio-accent)/50 bg-(--portfolio-accent)/10 px-4 py-1.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.08em] text-(--portfolio-accent)">
                  {entry.period}
                </span>
              </div>

              {entry.activities.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {entry.activities.map((activity) => (
                    <span
                      key={activity}
                      className="rounded-full border border-white/16 px-3 py-1.5 font-satoshi text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
