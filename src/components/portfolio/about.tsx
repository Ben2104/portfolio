"use client";

import { useRef } from "react";
import Image from "next/image";
import { Github, Linkedin } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { profile, socials } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

const PROFILE_IMAGE = "/photos/portrait.jpg";

function scrollToTarget(target: string) {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

export function About() {
  const githubHref = socials.find((social) => social.icon === "github")?.href ?? "";
  const linkedinHref = socials.find((social) => social.icon === "linkedin")?.href ?? "";
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
      className="relative bg-(--portfolio-bg) section-y"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 36% 24% at 18% 34%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />
      <div className="container-fluid relative">
        <SectionHeading accent="var(--portfolio-accent)" label="About Me" />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-start md:gap-x-[clamp(2rem,4vw,6rem)]">
          <div className="md:col-span-7">
            <h2 className="font-clash m-0 text-(length:--fs-h2) font-bold leading-[1.02] tracking-[-0.02em] text-(--portfolio-text)">
              {profile.aboutHeading}
            </h2>
            <p className="font-satoshi mb-0 mt-[1.75em] max-w-[60ch] text-(length:--fs-body) leading-[1.75] text-(--portfolio-muted)">
              {profile.aboutBody}
            </p>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-[clamp(2rem,3vw,3.5rem)] flex flex-wrap items-center gap-[clamp(0.6rem,0.8vw,1rem)] xl:flex-nowrap"
            >
              <button
                type="button"
                onClick={() => scrollToTarget("#projects")}
                className="rounded-full bg-(--portfolio-accent) px-[2.6em] py-[1.2em] font-satoshi text-(length:--fs-label) font-bold uppercase tracking-[0.12em] whitespace-nowrap text-(--portfolio-text) shadow-[0_20px_60px_rgba(255,145,66,0.25)] transition hover:brightness-105"
              >
                View Projects
              </button>
              {githubHref ? (
                <a
                  href={githubHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[0.6em] rounded-full border border-white/28 bg-black/30 px-[2.6em] py-[1.2em] font-satoshi text-(length:--fs-label) font-bold uppercase tracking-[0.12em] whitespace-nowrap text-white/90 transition hover:bg-white/5"
                >
                  <Github aria-hidden="true" className="size-[1.2em]" />
                  GitHub
                </a>
              ) : null}
              {linkedinHref ? (
                <a
                  href={linkedinHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[0.6em] rounded-full border border-white/28 bg-black/30 px-[2.6em] py-[1.2em] font-satoshi text-(length:--fs-label) font-bold uppercase tracking-[0.12em] whitespace-nowrap text-white/90 transition hover:bg-white/5"
                >
                  <Linkedin aria-hidden="true" className="size-[1.2em]" />
                  LinkedIn
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => scrollToTarget("#contact")}
                className="rounded-full border border-white/28 bg-black/30 px-[2.6em] py-[1.2em] font-satoshi text-(length:--fs-label) font-bold uppercase tracking-[0.12em] whitespace-nowrap text-white/90 transition hover:bg-white/5"
              >
                Contact Me
              </button>
            </motion.div>
          </div>

          <div className="md:sticky md:top-28 md:col-span-5 md:self-start">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              style={{ y: prefersReducedMotion ? 0 : parallaxY }}
              className="relative mx-auto w-full max-w-[min(100%,calc((100svh-9rem)*2/3))] overflow-hidden rounded-[clamp(24px,2vw,40px)] border border-white/10 md:mr-0"
            >
              <div className="relative aspect-[2/3] w-full bg-(--portfolio-surface)">
                <Image
                  src={PROFILE_IMAGE}
                  alt={`${profile.name} portrait`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
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
