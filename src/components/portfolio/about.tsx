"use client";

import Image from "next/image";
import { Code2, Layers, Zap } from "lucide-react";
import { motion } from "motion/react";

import { pillars, profile, stats } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

const iconMap = {
  code2: Code2,
  layers: Layers,
  zap: Zap,
} as const;

const PROFILE_IMAGE = "/profile/profilepicture.JPEG";

function scrollToTarget(target: string) {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

export function About() {
  return (
    <section id="about" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 36% 24% at 18% 34%, rgba(255,145,66,0.1), transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <SectionHeading accent="var(--portfolio-accent)" label="About Me" />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1fr)_454px] md:items-start">
          <div>
            <h2 className="font-clash m-0 max-w-[640px] text-[clamp(38px,5vw,56px)] font-bold leading-[1.06] tracking-[-0.02em] text-(--portfolio-text)">
              {profile.aboutHeading}
            </h2>
            <p className="font-satoshi mb-0 mt-7 max-w-[640px] text-[16px] leading-[1.75] text-(--portfolio-muted)">
              {profile.aboutBody}
            </p>

            <button
              type="button"
              onClick={() => scrollToTarget("#contact")}
              className="mt-9 rounded-full bg-(--portfolio-accent) px-8 py-3.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.11em] text-(--portfolio-text) shadow-[0_18px_40px_rgba(255,145,66,0.24)]"
            >
              Discover More About Me
            </button>

            <div className="mt-10 grid max-w-[460px] grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-clash m-0 text-4xl font-bold leading-none text-white">
                    {stat.value}
                  </p>
                  <p className="font-satoshi mb-0 mt-2 text-[12px] uppercase tracking-[0.1em] text-(--portfolio-subtle)">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative w-full overflow-hidden rounded-[30px] border border-white/10"
          >
            <div className="relative aspect-[454/506] w-full bg-[#1f1f1f]">
              <Image
                src={PROFILE_IMAGE}
                alt={`${profile.name} profile photo`}
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 454px"
                priority={false}
              />
            </div>
            <div
              className="pointer-events-none absolute left-[-20px] top-[56%] h-[178px] w-[55px] rounded-[30px] border"
              style={{ borderColor: "rgba(255,145,66,0.7)" }}
            />
            <div
              className="pointer-events-none absolute right-[18px] top-[8%] h-[34px] w-[110px] rounded-[30px] border"
              style={{ borderColor: "rgba(255,145,66,0.7)" }}
            />
          </motion.div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = iconMap[pillar.icon];

            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/6">
                  <Icon size={18} style={{ color: pillar.color }} />
                </div>
                <h3 className="font-clash m-0 text-[24px] font-bold text-(--portfolio-text)">
                  {pillar.title}
                </h3>
                <p className="font-satoshi mb-0 mt-3 text-[15px] leading-[1.65] text-(--portfolio-muted)">
                  {pillar.desc}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
