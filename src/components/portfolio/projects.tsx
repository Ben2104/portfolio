"use client";

import Image from "next/image";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { motion } from "motion/react";

import { projects } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="overflow-hidden rounded-2xl border border-white/8 bg-[var(--portfolio-surface)]"
    >
      <div className="relative aspect-[560/420] w-full overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4">
          <h3 className="font-syne m-0 text-[24px] font-bold leading-[1.2] text-[var(--portfolio-text)]">
            {project.title}
          </h3>
          <div
            className="h-px min-w-12 flex-1"
            style={{ background: "rgba(255,145,66,0.7)" }}
          />
        </div>

        <p className="font-rubik mb-0 mt-4 text-[15px] leading-[1.72] text-[var(--portfolio-muted)]">
          {project.desc}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/12 px-3 py-1.5 font-rubik text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.liveHref ? (
            <a
              href={project.liveHref}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-rubik text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--portfolio-accent)]"
              style={{ borderColor: "rgba(255,145,66,0.7)" }}
            >
              <ExternalLink size={13} />
              Live Demo
            </a>
          ) : null}
          <a
            href={project.sourceHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/18 px-4 py-2 font-rubik text-[11px] font-bold uppercase tracking-[0.1em] text-white/82"
          >
            <Github size={13} />
            Source Code
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative bg-[var(--portfolio-bg)] px-6 py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 52% 28% at 50% 12%, rgba(255,255,255,0.12), transparent 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1200px]">
        <SectionHeading accent="var(--portfolio-accent)" label="Featured Work" />

        <h2 className="font-syne m-0 text-center text-[clamp(40px,6vw,64px)] font-bold tracking-[-0.02em] text-[var(--portfolio-text)]">
          My Projects Highlight
        </h2>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() =>
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 font-rubik text-[11px] font-bold uppercase tracking-[0.12em] text-white"
            style={{ borderColor: "rgba(255,145,66,0.75)" }}
          >
            Explore More
            <ArrowRight size={12} />
          </button>
        </div>

        {projects.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
        ) : (
          <p className="font-rubik mt-12 text-center text-[15px] text-[var(--portfolio-muted)]">
            No projects available yet.
          </p>
        )}
      </div>
    </section>
  );
}
