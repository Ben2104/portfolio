"use client";

import { motion } from "motion/react";

import { allBadges, skillCategories } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Skills() {
  return (
    <section id="skills" className="relative bg-[var(--portfolio-bg)] px-6 py-28">
      <div className="relative mx-auto w-full max-w-[1200px]">
        <SectionHeading accent="var(--portfolio-accent)" label="Skills & Tech" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--portfolio-text)]">
          Technical Toolkit
        </h2>

        {skillCategories.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {skillCategories.map((category, categoryIndex) => (
              <motion.article
                key={category.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: categoryIndex * 0.06 }}
                className="rounded-2xl border border-white/10 bg-[var(--portfolio-surface)] p-6"
              >
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: category.color }}
                  />
                  <span className="font-satoshi text-[12px] font-bold uppercase tracking-[0.11em] text-white">
                    {category.label}
                  </span>
                </div>

                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skill.name}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-satoshi text-[14px] text-white/82">
                          {skill.name}
                        </span>
                        <span className="font-satoshi text-[12px] text-white/58">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="h-[4px] overflow-hidden rounded-full bg-white/12">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.9,
                            delay: categoryIndex * 0.06 + skillIndex * 0.04,
                          }}
                          className="h-full rounded-full"
                          style={{ background: category.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <p className="font-satoshi mt-10 text-[15px] text-[var(--portfolio-muted)]">
            Skills will be added soon.
          </p>
        )}

        {allBadges.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[var(--portfolio-surface)] p-6">
            <p className="font-satoshi m-0 text-[12px] font-semibold uppercase tracking-[0.11em] text-white/70">
              Also worked with
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {allBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/16 px-3 py-1.5 font-satoshi text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
