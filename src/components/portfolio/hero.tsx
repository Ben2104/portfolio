"use client";

import { Github, Linkedin } from "lucide-react";
import { motion } from "motion/react";

import { profile, socials } from "@/data/portfolio";
import { SplineScene } from "./spline-scene";

function scrollToTarget(target: string) {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  const githubHref = socials.find((social) => social.icon === "github")?.href ?? "";
  const linkedinHref = socials.find((social) => social.icon === "linkedin")?.href ?? "";

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-(--portfolio-bg)"
    >
      {/* Ambient background glow effects */}
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

      {/* 12-col grid: text spans 7, robot spans 5 */}
      <div className="container-fluid relative grid min-h-svh grid-cols-1 content-center items-center gap-y-12 pb-[clamp(4rem,6vw,8rem)] pt-[clamp(7rem,8vw,10rem)] md:grid-cols-12 md:gap-x-[clamp(1rem,2vw,3rem)]">
        {/* Left side — text content */}
        <div className="flex min-w-0 flex-col items-center text-center md:col-span-7 md:items-start md:text-left">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-full border border-white/5 bg-white/5 px-[1.45em] py-[0.75em] font-satoshi text-(length:--fs-label) font-semibold uppercase tracking-[0.14em] text-(--portfolio-muted)"
          >
            {profile.availability}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-clash mt-[clamp(1.5rem,2.5vw,3rem)] text-(length:--fs-hero) font-bold leading-[0.95] tracking-[-0.035em] text-(--portfolio-text)"
          >
            {profile.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-[clamp(1.5rem,2.5vw,3rem)] flex flex-wrap items-center justify-center gap-[0.9em] text-(length:--fs-label) md:justify-start"
          >
            {profile.roles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-white/12 px-[1.45em] py-[0.55em] font-satoshi font-medium uppercase tracking-[0.11em] text-white/70"
              >
                {role}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-[clamp(2rem,3vw,3.5rem)] flex flex-wrap items-center justify-center gap-[clamp(0.6rem,0.8vw,1rem)] md:justify-start xl:flex-nowrap"
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

        {/* Right side — Spline 3D Robot */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
           className="relative flex w-full items-center justify-center md:col-span-5 md:justify-end"
        >
          <div className="aspect-square w-(--robot-size) max-w-full">
            <SplineScene
              scene="https://prod.spline.design/nr48L-rggf90uxqF/scene.splinecode"
              className="h-full w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
