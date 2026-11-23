"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { experience } from "@/data/site";

// the data lists newest first; the timeline reads oldest to newest as you scroll
const roles = [...experience].reverse();
const N = roles.length;
const STEP = (2 * Math.PI) / N;
const FOCUS = 0.62; // radians: where the active point rests on the ellipse (lower right)
const CX = 40, CY = 50, RX = 56, RY = 32; // wide oval in % of the left pane, so it stretches with the viewport; its left edge runs off-screen

/** Scroll pins the stage: the points travel round the ellipse and the role on the right follows. Click a point to jump. */
export function Experience() {
  const track = useRef<HTMLElement>(null);
  const [pos, setPos] = useState(0);
  const active = Math.round(pos);

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setPos(Math.min(N - 1, Math.max(0, v * (N - 1)))));

  const jump = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (el.offsetHeight - window.innerHeight) * (i / (N - 1)), behavior: "smooth" });
  };

  const r = roles[active];
  return (
    <section
      ref={track}
      className="scr xp"
      id="experience"
      aria-labelledby="xp-h"
      style={{ "--steps": N } as CSSProperties}
    >
      <div className="xp__stick">
        <div className="xp__orbit">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <ellipse cx={CX} cy={CY} rx={RX} ry={RY} vectorEffect="non-scaling-stroke" />
          </svg>
          {roles.map((role, i) => {
            const a = FOCUS + (i - pos) * STEP;
            return (
              <button
                key={role.n}
                type="button"
                className={"xp__dot" + (i === active ? " on" : "")}
                style={{ left: `${CX + RX * Math.cos(a)}%`, top: `${CY + RY * Math.sin(a)}%` }}
                aria-label={`${role.role}, ${role.org}`}
                aria-current={i === active}
                onClick={() => jump(i)}
              >
                <span className="xp__lb">{role.org}</span>
              </button>
            );
          })}
        </div>

        <div className="xp__panel">
          <h2 className="giant" id="xp-h">Work experience</h2>
          <motion.article
            key={r.n}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="xp__when">{r.when}</p>
            <h3>{r.role}</h3>
            <p className="mono">{r.org} · {r.where}</p>
            <p className="xp__txt">{r.text}</p>
            <p className="xp__k">Tech stack</p>
            <ul>
              {r.tags.map((t) => <li className="tag" key={t}>{t}</li>)}
            </ul>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
