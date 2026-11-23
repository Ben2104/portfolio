"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const RAIL = [
  ["top", "Home"],
  ["intro", "Intro"],
  ["about", "About"],
  ["education", "Education"],
  ["experience", "Experience"],
  ["selected", "Projects"],
  ["contact", "Contact"],
] as const;

const SECTION_IDS = RAIL.map(([id]) => id);

/** Fixed glass pill. A goo-filtered blob slides to the section you are in and pops a burst of droplets. */
export function GooeyNav() {
  const [active, setActive] = useState(0);
  const [burst, setBurst] = useState(0);
  const [box, setBox] = useState<{ x: number; w: number } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.4 });

  // Activate sections as they reach the area just under the fixed navigation.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setScrolled(window.scrollY > 48);
      if (performance.now() < lockUntil.current) return;
      const line = 112;
      let found: (typeof SECTION_IDS)[number] = "top";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) found = id;
      }
      const idx = RAIL.findIndex(([id]) => id === found);
      setActive((prev) => {
        if (prev !== idx) setBurst((b) => b + 1);
        return idx;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // measure the active item so the blob can sit exactly behind it
  useLayoutEffect(() => {
    const measure = () => {
      const li = items.current[active];
      if (li) setBox({ x: li.offsetLeft, w: li.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (scroller.current) ro.observe(scroller.current);
    return () => ro.disconnect();
  }, [active]);

  // on narrow screens the pill scrolls sideways: keep the active item centred
  useEffect(() => {
    const s = scroller.current;
    const li = items.current[active];
    if (s && li && s.scrollWidth > s.clientWidth) {
      s.scrollTo({ left: li.offsetLeft - (s.clientWidth - li.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [active]);

  const go = useCallback((i: number) => {
    const idx = Math.min(RAIL.length - 1, Math.max(0, i));
    const el = document.getElementById(RAIL[idx][0]);
    if (!el) return;
    lockUntil.current = performance.now() + 1100;
    setActive(idx);
    setBurst((b) => b + 1);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const centre = box ? box.x + box.w / 2 : 0;

  return (
    <nav className="gn" aria-label="Main" data-scrolled={scrolled || undefined}>
      <svg className="gn__defs" width="0" height="0" aria-hidden="true">
        <filter id="gn-goo" x="-60%" y="-200%" width="220%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
      </svg>
      <button type="button" className="gn__arrow" aria-label="Previous section" disabled={active === 0} onClick={() => go(active - 1)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="gn__scroll" ref={scroller}>
        <div className="gn__track">
          <span className="gn__fx" aria-hidden="true" style={{ "--cx": `${centre}px` } as React.CSSProperties}>
            <span
              className="gn__blob"
              data-ready={box ? "" : undefined}
              style={{ width: box?.w ?? 0, transform: `translateX(${box?.x ?? 0}px)` }}
            />
            {box && burst > 0 && (
              <span className="gn__burst" key={burst}>
                {Array.from({ length: 12 }, (_, n) => (
                  <i key={n} className={`p p${n}`} />
                ))}
              </span>
            )}
          </span>
          <ul className="gn__list">
            {RAIL.map(([id, label], i) => (
              <li key={id} ref={(el) => void (items.current[i] = el)} className={i === active ? "on" : undefined}>
                <a
                  href={`#${id}`}
                  aria-current={i === active ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    go(i);
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button type="button" className="gn__arrow" aria-label="Next section" disabled={active === RAIL.length - 1} onClick={() => go(active + 1)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <motion.span className="gn__bar" style={{ scaleX: progress }} aria-hidden="true" />
    </nav>
  );
}
