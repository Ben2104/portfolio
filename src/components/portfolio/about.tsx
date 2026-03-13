"use client";

import { Code2, Layers, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { pillars, profile, stats } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

const iconMap = {
  code2: Code2,
  layers: Layers,
  zap: Zap,
} as const;

export function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="about"
      ref={ref}
      className="relative bg-[var(--portfolio-bg)] px-6 py-40"
    >
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute left-0 top-0 h-full w-px"
        aria-hidden
      >
        <div
          className="h-full w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(0,212,255,0.2), transparent)",
          }}
        />
      </motion.div>

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading accent="#00d4ff" label="About" />

        <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="m-0 text-[clamp(32px,4vw,56px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-slate-50"
            >
              Building the future,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                one commit at a time.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mb-0 mt-7 text-base leading-[1.8] text-slate-50/70"
            >
              {profile.aboutBody}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-12 grid grid-cols-2 gap-6"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-4xl font-extrabold leading-none tracking-[-0.04em]"
                    style={{
                      background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1.5 text-[13px] tracking-[0.01em] text-slate-50/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex flex-col gap-5">
            {pillars.map((pillar, index) => {
              const Icon = iconMap[pillar.icon];

              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  whileHover={{ x: 6, scale: 1.01 }}
                  className="flex cursor-default items-start gap-5 rounded-[1.25rem] border border-white/6 bg-white/[0.028] p-6 backdrop-blur-[10px]"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                      background: `${pillar.color}14`,
                      borderColor: `${pillar.color}30`,
                    }}
                  >
                    <Icon size={18} style={{ color: pillar.color }} />
                  </div>
                  <div>
                    <h3 className="m-0 text-base font-bold tracking-[-0.01em] text-slate-50">
                      {pillar.title}
                    </h3>
                    <p className="mb-0 mt-1.5 text-sm leading-[1.65] text-slate-50/60">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

