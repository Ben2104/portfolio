"use client";

import { motion } from "motion/react";
import { Trophy } from "lucide-react";

import { awards } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Awards() {
  return (
    <section id="awards" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="Awards" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Awards
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {awards.map((award, index) => (
            <motion.article
              key={`${award.event}-${award.title}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--portfolio-accent)/12">
                <Trophy size={18} className="text-(--portfolio-accent)" />
              </span>
              <div>
                <h3 className="font-clash m-0 text-[20px] font-bold leading-[1.25] text-(--portfolio-text)">
                  {award.title}
                </h3>
                <p className="font-satoshi mb-0 mt-1.5 text-[14px] leading-[1.6] text-(--portfolio-muted)">
                  {award.event} · {award.year}
                </p>
                <p className="font-satoshi mb-0 mt-1 text-[13px] text-white/55">
                  for {award.project}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
