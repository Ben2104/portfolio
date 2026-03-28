"use client";

import { motion } from "motion/react";

import { experiences } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Experience() {
  return (
    <section id="experience" className="relative bg-[var(--portfolio-bg)] px-6 py-28">
      <div className="relative mx-auto w-full max-w-[1200px]">
        <SectionHeading accent="var(--portfolio-accent)" label="Experience" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--portfolio-text)]">
          Work History
        </h2>

        {experiences.length > 0 ? (
          <div className="mt-10 space-y-5">
            {experiences.map((experience, index) => (
              <motion.article
                key={`${experience.company}-${experience.role}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="rounded-2xl border border-white/10 bg-[var(--portfolio-surface)] p-6"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-clash m-0 text-[27px] font-bold leading-[1.2] text-[var(--portfolio-text)]">
                      {experience.role}
                    </h3>
                    <p className="font-satoshi mb-0 mt-2 text-[15px] leading-[1.55] text-[var(--portfolio-muted)]">
                      <span style={{ color: experience.color }}>{experience.company}</span>
                      {" · "}
                      {experience.location}
                    </p>
                  </div>
                  <span
                    className="w-fit rounded-full border px-4 py-1.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{
                      color: experience.color,
                      borderColor: `${experience.color}88`,
                      background: `${experience.color}1a`,
                    }}
                  >
                    {experience.period}
                  </span>
                </div>

                {experience.description ? (
                  <p className="font-satoshi mb-0 mt-4 text-[15px] leading-[1.72] text-[var(--portfolio-muted)]">
                    {experience.description}
                  </p>
                ) : null}

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
            ))}
          </div>
        ) : (
          <p className="font-satoshi mt-10 text-[15px] text-[var(--portfolio-muted)]">
            Experience details are not available right now.
          </p>
        )}
      </div>
    </section>
  );
}
