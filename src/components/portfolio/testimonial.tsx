"use client";

import { motion } from "motion/react";

import { profile } from "@/data/portfolio";

export function Testimonial() {
  return (
    <section id="testimonial" className="relative bg-[var(--portfolio-bg)] px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 35% 20% at 22% 36%, rgba(255,255,255,0.12), transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <div className="relative rounded-2xl border border-white/10 bg-[var(--portfolio-surface)] p-8 md:p-10">
          <div
            className="absolute right-8 top-8 text-[64px] leading-none"
            style={{ color: "rgba(255,145,66,0.5)" }}
          >
            ""
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-clash m-0 text-[clamp(36px,5vw,64px)] font-bold text-[var(--portfolio-text)]"
          >
            Testimonial
          </motion.h2>
          <p className="font-satoshi mt-6 max-w-[880px] text-[17px] leading-[1.8] text-[var(--portfolio-subtle)]">
            "{profile.aboutBody}"
          </p>
          <p className="font-clash mb-0 mt-7 text-[24px] font-bold text-white">
            - {profile.name}
          </p>
        </div>
      </div>
    </section>
  );
}
