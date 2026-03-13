"use client";

import { motion } from "motion/react";

import { experiences } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Experience() {
  return (
    <section
      id="experience"
      className="relative px-6 py-40"
      style={{ background: "linear-gradient(to bottom, #04040f, #050412, #04040f)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 70% 40%, rgba(124,58,237,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading accent="#00d4ff" label="Experience" />

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-[72px] m-0 text-[clamp(32px,4.5vw,60px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-slate-50"
        >
          Where I&apos;ve worked.
        </motion.h2>

        <div className="relative">
          <div
            className="absolute bottom-0 left-4 top-0 w-px md:left-8"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,212,255,0.4), rgba(124,58,237,0.2), transparent)",
            }}
          />

          <div className="flex flex-col">
            {experiences.map((experience, index) => (
              <motion.div
                key={`${experience.company}-${experience.role}`}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative pb-14 pl-16 md:pl-24"
              >
                <div
                  className="absolute left-4 top-2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full md:left-8"
                  style={{
                    background: "#04040f",
                    border: `2px solid ${experience.color}`,
                    boxShadow: `0 0 16px ${experience.color}60`,
                  }}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: experience.color }}
                  />
                </div>

                <motion.div
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.25 }}
                  className="group cursor-default rounded-[1.25rem] border border-white/7 bg-white/[0.025] p-7 backdrop-blur-[12px]"
                >
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="m-0 text-xl font-extrabold tracking-[-0.025em] text-slate-50">
                        {experience.role}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="text-[15px] font-bold"
                          style={{ color: experience.color }}
                        >
                          {experience.company}
                        </span>
                        <span className="text-[13px] text-white/20">·</span>
                        <span className="text-[13px] text-slate-50/35">
                          {experience.location}
                        </span>
                      </div>
                    </div>
                    <span
                      className="w-fit whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.02em]"
                      style={{
                        color: experience.color,
                        background: `${experience.color}12`,
                        borderColor: `${experience.color}25`,
                      }}
                    >
                      {experience.period}
                    </span>
                  </div>

                  <p className="mb-5 mt-0 text-sm leading-[1.8] text-slate-50/48">
                    {experience.description}
                  </p>

                  <ul className="mb-6 flex flex-col gap-2">
                    {experience.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3">
                        <span
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                          style={{ background: experience.color }}
                        />
                        <span className="text-[13px] leading-[1.6] text-slate-50/60">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    {experience.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/8 bg-white/5 px-2.5 py-[3px] text-[11px] font-semibold tracking-[0.02em] text-slate-50/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
