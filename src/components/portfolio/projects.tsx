"use client";

import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/12 bg-[#222222] transition-all duration-300 hover:border-white/25 hover:shadow-[0_8px_32px_rgba(255,145,66,0.08)]"
    >
      {project.award ? (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-(--portfolio-accent)/60 bg-black/70 px-3 py-1 font-satoshi text-[10px] font-bold uppercase tracking-[0.06em] text-(--portfolio-accent)">
          🏆 {project.award}
        </span>
      ) : null}

      {/* Image preview */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#111]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="font-clash m-0 text-[18px] font-bold leading-tight text-white">
          {project.title}
        </h3>

        <p className="font-satoshi mb-0 mt-2 text-[13px] leading-[1.65] text-white/70">
          {project.desc}
        </p>

        {project.bullets.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {project.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                <span className="font-satoshi text-[12px] leading-[1.55] text-white/65">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/10 bg-white/8 px-2.5 py-1 font-satoshi text-[10px] font-medium text-white/75"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
          <a
            href={project.sourceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-satoshi text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white"
          >
            <Github size={13} />
            Code
          </a>
          {project.liveHref ? (
            <a
              href={project.liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-satoshi text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white"
            >
              <ExternalLink size={13} />
              Live
            </a>
          ) : null}
          {project.devpostHref ? (
            <a
              href={project.devpostHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-satoshi text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white"
            >
              <ExternalLink size={13} />
              Devpost
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 52% 28% at 50% 12%, rgba(255,255,255,0.12), transparent 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1200px]">
        <SectionHeading accent="var(--portfolio-accent)" label="Featured Work" />

        <h2 className="font-clash m-0 text-center text-[clamp(40px,6vw,64px)] font-bold tracking-[-0.02em] text-(--portfolio-text)">
          My Projects Highlight
        </h2>

        {projects.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
        ) : (
          <p className="font-satoshi mt-12 text-center text-[15px] text-(--portfolio-muted)">
            No projects available yet.
          </p>
        )}
      </div>
    </section>
  );
}
