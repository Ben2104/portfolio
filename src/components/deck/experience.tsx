"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { experience } from "@/data/site";
import { activeAt } from "./experience-math";

const Scene = dynamic(() => import("./experience-scene"), { ssr: false });

/** The tunnel flies from the first role to the latest, so it reads as a timeline. */
const roles = [...experience].reverse();
const N = roles.length;
const total = String(N).padStart(2, "0");

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotionPref = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
// server and hydration assume no preference, then it flips, so the markup never mismatches
const useReduceMotion = () => useSyncExternalStore(subscribeMotionPref, () => window.matchMedia(QUERY).matches, () => false);

/**
 * Work experience. A sticky stage holds a three.js tunnel; scrolling flies the camera through one frame per role
 * while the card beside it and the numbered rail follow. With reduced motion it is a plain list instead.
 */
export function Experience() {
  const reduce = useReduceMotion();
  const track = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const [glFailed, setGlFailed] = useState(false);
  const onFail = useCallback(() => setGlFailed(true), []);

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
    setActive(activeAt(v, N));
  });
  const hint = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  const jump = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (el.offsetHeight - window.innerHeight) * (i / (N - 1)) });
  };

  const r = roles[active];
  return (
    <section
      ref={track}
      id="experience"
      className="exp lit"
      data-mode={reduce ? "list" : "3d"}
      data-active={active}
      aria-labelledby="exp-h"
      style={{ "--steps": N - 1 } as CSSProperties}
    >
      <div className="exp__stick">
        <div className="exp__in">
          <p className="lbl">04 / Experience</p>
          <h2 className="giant exp__title" id="exp-h">
            Work experience
          </h2>
        </div>

        {!reduce && (
          <>
            {!glFailed && <Scene roles={roles} progress={progress} onFail={onFail} />}
            <div className="exp__in exp__ui">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={r.n}
                  className="exp__card"
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="exp__no mono">
                    <b>{r.n}</b> / {total}
                  </p>
                  <p className="yr">{r.when}</p>
                  <h3>{r.role}</h3>
                  <p className="exp__org">{r.org}</p>
                  <p className="mono exp__where">{r.where}</p>
                  <p className="exp__txt">{r.text}</p>
                  <ul>
                    {r.tags.map((t) => (
                      <li className="tag" key={t}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              </AnimatePresence>
              <motion.p className="mono exp__hint" style={{ opacity: hint }} aria-hidden="true">
                Scroll to travel through the years
              </motion.p>
              <nav className="exp__rail" aria-label="Work experience timeline">
                <span className="exp__line" aria-hidden="true">
                  <motion.span style={{ scaleX: scrollYProgress }} />
                </span>
                {roles.map((x, i) => (
                  <button
                    key={x.n}
                    type="button"
                    className={i === active ? "on" : undefined}
                    aria-label={"Show " + x.role + ", " + x.org}
                    aria-current={i === active ? "step" : undefined}
                    onClick={() => jump(i)}
                  >
                    {x.n}
                  </button>
                ))}
              </nav>
            </div>
          </>
        )}

        <ol className="exp__list exp__in">
          {experience.map((x) => (
            <li key={x.n}>
              <p className="yr">{x.when}</p>
              <div>
                <h3>{x.role}</h3>
                <p className="exp__org">
                  {x.org} <span className="mono exp__where">· {x.where}</span>
                </p>
                <p className="exp__txt">{x.text}</p>
                <ul>
                  {x.tags.map((t) => (
                    <li className="tag" key={t}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
