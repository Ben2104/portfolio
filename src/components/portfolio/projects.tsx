"use client";

import Image from "next/image";
import { ExternalLink, Github, Star } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, type MouseEvent } from "react";

import { projects } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) {
      return;
    }

    const bounds = cardRef.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16;
    const y = -((event.clientY - bounds.top) / bounds.height - 0.5) * 16;
    setTilt({ x, y });
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
    setHovering(false);
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={resetTilt}
      style={{
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${hovering ? 1.025 : 1})`,
        transition: hovering
          ? "transform 0.05s linear, border-color 0.3s, box-shadow 0.3s"
          : "transform 0.5s ease, border-color 0.5s, box-shadow 0.5s",
        borderColor: hovering ? `${project.color}40` : "rgba(255,255,255,0.07)",
        boxShadow: hovering
          ? `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${project.color}15`
          : "0 8px 32px rgba(0,0,0,0.3)",
      }}
      className="overflow-hidden rounded-[20px] border bg-white/[0.025] backdrop-blur-[20px]"
    >
      <div className="relative h-[200px] overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          style={{
            transform: hovering ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.6s ease",
            filter: "brightness(0.55) saturate(1.1)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${project.color}18, rgba(4,4,15,0.9))`,
          }}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: project.color,
              boxShadow: `0 0 8px ${project.color}`,
            }}
          />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: project.color }}
          >
            {project.subtitle}
          </span>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-lg">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-slate-50">
            {project.stars}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="m-0 text-[22px] font-extrabold tracking-[-0.025em] text-slate-50">
          {project.title}
        </h3>
        <p className="mb-0 mt-2.5 text-sm leading-[1.7] text-slate-50/45">
          {project.desc}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 bg-white/6 px-2.5 py-[3px] text-[11px] font-semibold tracking-[0.02em] text-slate-50/55"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            href={project.liveHref}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.02em]"
            style={{
              background: `${project.color}18`,
              borderColor: `${project.color}35`,
              color: project.color,
            }}
          >
            <ExternalLink size={12} />
            Live Demo
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            href={project.sourceHref}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.02em] text-slate-50/60"
          >
            <Github size={12} />
            Source
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}

export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const headerY = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  return (
    <section
      id="projects"
      ref={ref}
      className="relative px-6 py-40"
      style={{ background: "linear-gradient(to bottom, #04040f, #06040f, #04040f)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div style={{ y: headerY }} className="mb-20">
          <SectionHeading accent="#7c3aed" label="Featured Projects" />

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="m-0 text-[clamp(32px,4.5vw,60px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-slate-50"
            >
              Things I&apos;ve built
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #00d4ff)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                & shipped.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="m-0 max-w-[340px] text-[15px] leading-[1.7] text-slate-50/40"
            >
              A selection of products I&apos;ve engineered, from concept to
              production.
            </motion.p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
