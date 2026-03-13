"use client";

import { motion } from "motion/react";

import { allBadges, skillCategories } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Skills() {
  return (
    <section
      id="skills"
      className="relative bg-[var(--portfolio-bg)] px-6 py-40"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 30% 60%, rgba(0,212,255,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading accent="#f97316" label="Skills & Tech" />

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-15 m-0 text-[clamp(32px,4.5vw,60px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-slate-50"
        >
          My tech stack.
        </motion.h2>

        <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="rounded-[1.25rem] border border-white/7 bg-white/[0.025] p-7 backdrop-blur-[12px]"
            >
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: category.color,
                    boxShadow: `0 0 10px ${category.color}`,
                  }}
                />
                <span
                  className="text-[13px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: category.color }}
                >
                  {category.label}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skill.name}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[13px] font-medium text-slate-50/75">
                        {skill.name}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-50/50">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/6">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1.1,
                          delay: categoryIndex * 0.1 + skillIndex * 0.06,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${category.color}, ${category.color}88)`,
                          boxShadow: `0 0 8px ${category.color}60`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-[12px]"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-cyan-400/70 to-transparent" />
            <p className="m-0 text-[14px] font-bold uppercase tracking-[0.18em] text-slate-50/70">
              Also worked with
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {allBadges.map((badge, index) => (
              <motion.span
                key={badge}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.025 }}
                whileHover={{
                  scale: 1.06,
                  borderColor: "rgba(0,212,255,0.45)",
                  backgroundColor: "rgba(0,212,255,0.08)",
                  color: "#f8fafc",
                  boxShadow:
                    "0 0 0 1px rgba(0,212,255,0.12), 0 18px 38px rgba(0,0,0,0.35)",
                }}
                className="inline-block cursor-default rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-[13px] font-semibold tracking-[0.01em] text-slate-50/70 transition-all duration-200"
              >
                {badge}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
