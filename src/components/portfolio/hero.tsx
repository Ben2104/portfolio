"use client";

import { motion } from "motion/react";

import { profile } from "@/data/portfolio";

function scrollToTarget(target: string) {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[var(--portfolio-bg)] px-6 pb-32 pt-40 md:pt-44"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 44% 30% at 50% 18%, rgba(255,255,255,0.18), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-16 h-[320px] w-[520px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,145,66,0.14), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[360px] w-[560px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,145,66,0.08), transparent 75%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-full border border-white/16 bg-white/5 px-4 py-2 font-rubik text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80"
        >
          {profile.availability}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-syne mt-8 max-w-[940px] text-[clamp(42px,7vw,76px)] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--portfolio-text)]"
        >
          {profile.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {profile.roles.map((role) => (
            <span
              key={role}
              className="rounded-full border border-white/12 px-4 py-1.5 font-rubik text-[11px] font-medium uppercase tracking-[0.11em] text-white/70"
            >
              {role}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={() => scrollToTarget("#projects")}
            className="rounded-full bg-[var(--portfolio-accent)] px-9 py-4 font-rubik text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--portfolio-text)] shadow-[0_20px_60px_rgba(255,145,66,0.25)] transition hover:brightness-105"
          >
            Explore Works
          </button>
          <button
            type="button"
            onClick={() => scrollToTarget("#contact")}
            className="rounded-full border border-white/28 bg-black/30 px-9 py-4 font-rubik text-[12px] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/5"
          >
            Get In Touch
          </button>
        </motion.div>
      </div>
    </section>
  );
}
