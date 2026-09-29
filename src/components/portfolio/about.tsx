"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { profile } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

const PROFILE_IMAGE = "/photos/cutout-experience.png";

function scrollToTarget(target: string) {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-24, 24]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-(--portfolio-bg) px-6 py-28"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 36% 24% at 18% 34%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="About Me" />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1fr)_454px] md:items-start">
          <div>
            <h2 className="font-clash m-0 max-w-160 text-[clamp(38px,5vw,56px)] font-bold leading-[1.06] tracking-[-0.02em] text-(--portfolio-text)">
              {profile.aboutHeading}
            </h2>
            <p className="font-satoshi mb-0 mt-7 max-w-160 text-[16px] leading-[1.75] text-(--portfolio-muted)">
              {profile.aboutBody}
            </p>

            <button
              type="button"
              onClick={() => scrollToTarget("#contact")}
              className="mt-9 rounded-full bg-(--portfolio-accent) px-8 py-3.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.11em] text-(--portfolio-text) shadow-[0_18px_40px_rgba(255,145,66,0.24)]"
            >
              Discover More About Me
            </button>
          </div>

          <div className="md:sticky md:top-28 md:self-start">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              style={{ y: prefersReducedMotion ? 0 : parallaxY }}
              className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-[30px] border border-white/10"
            >
              <div className="relative aspect-[2/3] w-full bg-(--portfolio-surface)">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 55% at 50% 82%, rgba(0,212,255,0.16), transparent 72%)",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                    backgroundSize: "26px 26px",
                  }}
                />
                <div className="pointer-events-none absolute bottom-4 left-1/2 h-px w-2/3 -translate-x-1/2 bg-white/16" />
                <Image
                  src={PROFILE_IMAGE}
                  alt={`${profile.name} portrait cutout`}
                  fill
                  className="object-contain object-bottom"
                  sizes="(min-width: 768px) 380px, 100vw"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
