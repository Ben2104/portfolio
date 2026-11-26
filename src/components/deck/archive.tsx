"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { cats, projects } from "@/data/site";
import type { Project } from "@/data/site";

type Who = "all" | "team" | "solo";

const whoOptions: [Who, string][] = [
  ["all", "All projects"],
  ["team", "Team builds"],
  ["solo", "Solo builds"],
];
const catOptions = ["all", ...Object.keys(cats)];

const isSolo = (p: Project) => p.team === 1;
const okWho = (p: Project, w: Who) => w === "all" || (w === "solo") === isSolo(p);
const okCat = (p: Project, c: string) => c === "all" || p.cat === c;
const badge = (p: Project) => (p.award ? p.event : /project$/i.test(p.event) ? null : p.event);
const pad = (n: number, len: number) => String(n).padStart(len, "0");
const TOTAL = pad(projects.length, 2);
const YEARS = `${Math.min(...projects.map((p) => p.year))}–${Math.max(...projects.map((p) => p.year))}`;

/** The archive: a window-style card with two filters and a row of case-study cards. Hovering a card selects it. */
export function Archive() {
  const [who, setWho] = useState<Who>("all");
  const [cat, setCat] = useState("all");
  const [pick, setPick] = useState("");
  const row = useRef<HTMLUListElement>(null);
  const [prog, setProg] = useState(0);
  const drag = useRef<{ x: number; left: number } | null>(null);

  const onScroll = () => {
    const el = row.current;
    if (el) setProg(el.scrollWidth > el.clientWidth ? el.scrollLeft / (el.scrollWidth - el.clientWidth) : 0);
  };
  const onDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType === "mouse") drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
  };
  const onMove = (e: PointerEvent<HTMLUListElement>) => {
    if (drag.current) e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };

  const shown = projects.filter((p) => okWho(p, who) && okCat(p, cat));
  const sel = shown.find((p) => p.slug === pick) ?? shown[0];
  const n = sel ? shown.indexOf(sel) + 1 : null;

  const refilter = (w: Who, c: string) => {
    setWho(w);
    setCat(c);
    setPick("");
    row.current?.scrollTo({ left: 0, behavior: "instant" });
  };

  return (
    <div className="os">
      <div className="os__bar">
        <div className="l">
          <span className="os__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="mono">KHOI.OS / PROJECT EXPLORER</span>
        </div>
        <span className="mono os__count">{TOTAL} items · {YEARS}</span>
      </div>
      <div className="os__body">
        <div className="os__side">
          <span className="mono os__ttl">Project explorer</span>
          <ul>
            {whoOptions.map(([w, label]) => (
              <li key={w}>
                <button type="button" className={"fbtn" + (who === w ? " on" : "")} aria-pressed={who === w} onClick={() => refilter(w, cat)}>
                  {label}
                  <small aria-hidden="true">{projects.filter((p) => okWho(p, w) && okCat(p, cat)).length}</small>
                </button>
              </li>
            ))}
          </ul>
          <span className="mono">Filter by category</span>
          <ul>
            {catOptions.map((c) => (
              <li key={c}>
                <button type="button" className={"fbtn" + (cat === c ? " on" : "")} aria-pressed={cat === c} onClick={() => refilter(who, c)}>
                  {c === "all" ? "Every category" : cats[c]}
                  <small aria-hidden="true">{projects.filter((p) => okCat(p, c) && okWho(p, who)).length}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="os__main">
          <div className="os__head">
            <div>
              <h1>Project archive</h1>
              <p className="mono">A collection of ideas, experiments &amp; builds.</p>
            </div>
            <span className="os__sel mono" aria-hidden="true">
              {n === null ? "00" : pad(n, 2)} / {pad(shown.length, 2)}
            </span>
          </div>
          <p className="sr-only" role="status">
            {shown.length} {shown.length === 1 ? "project" : "projects"}
          </p>
          {shown.length === 0 && <p className="os__empty">No projects match this pair of filters.</p>}
          <ul className="row" ref={row} aria-label="Projects" tabIndex={0} onScroll={onScroll} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerLeave={() => (drag.current = null)}>
            {shown.map((p) => (
              <li
                key={p.slug}
                className={"pc" + (sel?.slug === p.slug ? " on" : "")}
                onMouseEnter={() => setPick(p.slug)}
                onFocus={() => setPick(p.slug)}
              >
                <div className="pc__img">
                  <Image src={"/deck/projects/" + p.img + ".webp"} alt="" fill sizes="(max-width: 860px) 78vw, (max-width: 1920px) 25vw, 480px" />
                </div>
                <div className="pc__in">
                  <span className="mono pc__id">CASE_{pad(projects.indexOf(p) + 1, 3)}</span>
                  <h2>{p.title}</h2>
                  {badge(p) && <span className="mono pc__badge">{badge(p)}</span>}
                  <span className="cat mono">
                    {cats[p.cat]} · {p.year} · {isSolo(p) ? "Solo build" : "Team build"}
                  </span>
                  <p>{p.line}</p>
                  <span className="pc__tags">
                    {p.stack.slice(0, 4).map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </span>
                  <Link className="pc__go" href={"/projects/" + p.slug} aria-label={`View case study for ${p.title}`}>
                    View case study ↗
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          {shown.length > 0 && (
            <div className="os__rail">
              <span className="mono">Drag to explore</span>
              <i aria-hidden="true"><b style={{ width: `${12 + prog * 88}%` }} /></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
