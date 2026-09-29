"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "motion/react";

import { skillCategories } from "@/data/portfolio";
import { SectionHeading } from "./section-heading";

/* ── Flatten skills into orb data ─────────────────────────────── */

type OrbSkill = {
  name: string;
  level: number;
  color: string;
  category: string;
  icon: string;
};

function flattenSkills(): OrbSkill[] {
  const out: OrbSkill[] = [];
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      if (!skill.icon) continue;
      out.push({
        name: skill.name,
        level: skill.level,
        color: cat.color,
        category: cat.label,
        icon: skill.icon,
      });
    }
  }
  return out;
}

/* ── Fibonacci sphere distribution ────────────────────────────── */

function fibonacciSphere(count: number, radius: number) {
  const points: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]);
  }
  return points;
}

/* ── Preload images ───────────────────────────────────────────── */

function preloadImages(skills: OrbSkill[]): Promise<Map<string, HTMLImageElement>> {
  return new Promise((resolve) => {
    const map = new Map<string, HTMLImageElement>();
    let loaded = 0;
    const total = skills.length;

    for (const skill of skills) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = img.onerror = () => {
        map.set(skill.name, img);
        loaded++;
        if (loaded >= total) resolve(map);
      };
      img.src = skill.icon;
    }

    if (total === 0) resolve(map);
  });
}

/* ── Main component ───────────────────────────────────────────── */

export function Skills() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<OrbSkill | null>(null);

  /* Rotation state stored in refs so the animation loop reads fresh values */
  const rotX = useRef(-0.3);
  const rotY = useRef(0);
  const autoRotSpeed = useRef(0.002);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const velocityY = useRef(0);
  const velocityX = useRef(0);
  const mousePos = useRef({ x: -9999, y: -9999 });
  const animationId = useRef<number>(0);
  const skills = useRef(flattenSkills());

  /* ── Projected position cache for hover detection ── */
  const projectedOrbs = useRef<{ x: number; y: number; r: number; skill: OrbSkill; z: number }[]>(
    []
  );

  /* ── Pointer handlers ────────────────────────────── */

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velocityY.current = 0;
    velocityX.current = 0;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    velocityY.current = dx * 0.004;
    velocityX.current = dy * 0.004;
    rotY.current += dx * 0.004;
    rotX.current += dy * 0.004;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onPointerLeave = useCallback(() => {
    dragging.current = false;
    mousePos.current = { x: -9999, y: -9999 };
    setHoveredSkill(null);
  }, []);

  /* ── Canvas render loop ──────────────────────────── */

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const canvasNode: HTMLCanvasElement = canvas;
    const wrapperNode: HTMLDivElement = wrapper;

    const ctx = canvasNode.getContext("2d")!;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = wrapperNode.getBoundingClientRect();
      canvasNode.width = rect.width * dpr;
      canvasNode.height = rect.height * dpr;
      canvasNode.style.width = `${rect.width}px`;
      canvasNode.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const data = skills.current;
    const count = data.length;
    /* Unit sphere; scaled to the canvas each frame so resizes stay in proportion */
    const positions = fibonacciSphere(count, 1);

    /* Per-orb animation offsets */
    const offsets = data.map(() => ({
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.6,
      amplitude: 3 + Math.random() * 6,
    }));

    let time = 0;
    let imageMap: Map<string, HTMLImageElement> = new Map();

    /* Preload all skill icons */
    preloadImages(data).then((map) => {
      imageMap = map;
    });

    function frame() {
      const w = canvasNode.width / dpr;
      const h = canvasNode.height / dpr;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.34;
      /* Grow icons, depth and drift past the original 560px canvas; unchanged below it */
      const grow = Math.max(1, radius / 190);

      ctx.clearRect(0, 0, w, h);

      time += 0.016;

      /* Auto-rotate when not dragging */
      if (!dragging.current) {
        rotY.current += autoRotSpeed.current;
        /* Momentum decay */
        rotY.current += velocityY.current;
        rotX.current += velocityX.current;
        velocityY.current *= 0.95;
        velocityX.current *= 0.95;
      }

      const cosY = Math.cos(rotY.current);
      const sinY = Math.sin(rotY.current);
      const cosX = Math.cos(rotX.current);
      const sinX = Math.sin(rotX.current);

      /* Project and sort by Z */
      const projected: {
        x: number;
        y: number;
        z: number;
        r: number;
        skill: OrbSkill;
        floatX: number;
        floatY: number;
      }[] = [];

      for (let i = 0; i < count; i++) {
        const [ux, uy, uz] = positions[i];
        const px = ux * radius;
        const py = uy * radius;
        const pz = uz * radius;
        const off = offsets[i];

        /* Rotate Y then X */
        let x = px * cosY - pz * sinY;
        let z = px * sinY + pz * cosY;
        let y = py * cosX - z * sinX;
        z = py * sinX + z * cosX;

        /* Floating animation */
        const floatX = Math.sin(time * off.speed + off.phase) * off.amplitude * grow;
        const floatY = Math.cos(time * off.speed * 0.8 + off.phase) * off.amplitude * grow;

        /* Perspective */
        const perspective = 800 * grow;
        const scale = perspective / (perspective + z);

        const screenX = cx + (x + floatX) * scale;
        const screenY = cy + (y + floatY) * scale;

        /* Orb size: uniform for all skills, only scaled by perspective */
        const orbRadius = 40 * grow * scale;

        projected.push({
          x: screenX,
          y: screenY,
          z,
          r: orbRadius,
          skill: data[i],
          floatX,
          floatY,
        });
      }

      /* Sort back to front */
      projected.sort((a, b) => b.z - a.z);

      /* Find hovered orb */
      let foundHover: OrbSkill | null = null;

      /* Store projected orbs for external hover detection */
      projectedOrbs.current = projected.map((p) => ({
        x: p.x,
        y: p.y,
        r: p.r,
        skill: p.skill,
        z: p.z,
      }));

      /* Draw orbs */
      for (const orb of projected) {
        const depth = (orb.z + radius) / (radius * 2); // 0 (back) → 1 (front)
        const opacity = 0.45 + depth * 0.55; // higher minimum so back icons stay visible

        /* Check hover */
        const dx = mousePos.current.x - orb.x;
        const dy = mousePos.current.y - orb.y;
        const isHovered = Math.sqrt(dx * dx + dy * dy) < orb.r + 6;

        if (isHovered && depth > 0.3) {
          foundHover = orb.skill;
        }

        /* ── Draw PNG icon (no colored glare) ── */
        const img = imageMap.get(orb.skill.name);
        if (img && img.complete && img.naturalWidth > 0) {
          const iconSize = orb.r * 1.6;
          ctx.save();
          ctx.globalAlpha = opacity * (isHovered ? 1 : 0.88);
          ctx.drawImage(
            img,
            orb.x - iconSize / 2,
            orb.y - iconSize / 2,
            iconSize,
            iconSize
          );
          ctx.restore();
        }
      }

      setHoveredSkill(foundHover);
      animationId.current = requestAnimationFrame(frame);
    }

    animationId.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationId.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section id="skills" className="relative bg-(--portfolio-bg) section-y">
      <div className="container-fluid relative">
        <SectionHeading accent="var(--portfolio-accent)" label="Skills & Tech" />

        <h2 className="font-clash m-0 text-(length:--fs-h2) font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Technical Toolkit
        </h2>

        <p className="font-satoshi mt-3 max-w-[60ch] text-(length:--fs-body) text-(--portfolio-muted)">
          Drag to explore
        </p>

        {/* ── 3D Orb Cloud ───────────────────────────── */}
        <div className="mt-[clamp(2.5rem,4vw,5rem)] grid grid-cols-1 items-center justify-items-center gap-8 lg:grid-cols-12 lg:gap-x-[clamp(2rem,4vw,6rem)]">
          <div
            ref={wrapperRef}
            className="relative aspect-square w-full max-w-[560px] lg:col-span-5 lg:max-w-(--orb-size)"
          >
            <canvas
              ref={canvasRef}
              className="h-full w-full cursor-grab active:cursor-grabbing"
              style={{ touchAction: "none" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerLeave}
            />

            {/* Hovered skill tooltip */}
            {hoveredSkill && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-white/15 bg-[#1a1a1a]/90 px-5 py-3 backdrop-blur-md"
              >
                <p className="font-satoshi m-0 text-[12px] font-bold uppercase tracking-[0.1em] text-white/60">
                  {hoveredSkill.category}
                </p>
                <p className="font-clash m-0 mt-1 text-[20px] font-bold text-white">
                  {hoveredSkill.name}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-[4px] w-24 overflow-hidden rounded-full bg-white/12">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${hoveredSkill.level}%`,
                        background: hoveredSkill.color,
                      }}
                    />
                  </div>
                  <span className="font-satoshi text-[12px] text-white/60">
                    {hoveredSkill.level}%
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Category legend ──────────────────────── */}
          <div className="grid w-full grid-cols-1 gap-[clamp(0.625rem,0.8vw,1rem)] text-[clamp(0.75rem,0.75vw,1rem)] sm:grid-cols-2 lg:col-span-7">
            {skillCategories.map((cat, ci) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: ci * 0.08 }}
                className="rounded-[1.1em] border border-white/10 bg-(--portfolio-surface) p-[1.3em]"
              >
                <div className="mb-[0.8em] flex items-center gap-[0.7em]">
                  <span
                    className="size-[0.7em] shrink-0 rounded-full"
                    style={{ background: cat.color }}
                  />
                  <span className="font-satoshi text-[0.95em] font-bold uppercase tracking-[0.09em] text-white">
                    {cat.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-[0.5em]">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-[0.4em] rounded-full border border-white/12 px-[0.75em] py-[0.4em] font-satoshi text-[1.02em] text-white/75"
                    >
                      <span
                        className="inline-block size-[0.5em] rounded-full"
                        style={{
                          background: cat.color,
                          opacity: skill.level / 100,
                        }}
                      />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
