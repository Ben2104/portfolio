"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
export const badge = (p: Project) => (p.award ? p.event : /project$/i.test(p.event) ? null : p.event);
/** Code / Demo / Devpost links, rendered only when the project has them. */
export function QuickLinks({ p }: { p: Project }) {
  const items: [string | undefined, string, string][] = [
    [p.links.source, "Code", "source code"],
    [p.links.live, "Demo", "live demo"],
    [p.links.devpost, "Devpost", "Devpost page"],
  ];
  return items.map(([href, label, what]) =>
    href ? (
      <a key={label} className="ql" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} ${what} (opens in new tab)`}>
        {label} ↗
      </a>
    ) : null,
  );
}

const pad = (n: number, len: number) => String(n).padStart(len, "0");
const TOTAL = pad(projects.length, 2);
const YEARS = `${Math.min(...projects.map((p) => p.year))}–${Math.max(...projects.map((p) => p.year))}`;

/** The archive: a window-style card with two filters and a grid of case-study cards. */
export function Archive() {
  const [who, setWho] = useState<Who>("all");
  const [cat, setCat] = useState("all");
  const shown = projects.filter((p) => okWho(p, who) && okCat(p, cat));

  const refilter = (w: Who, c: string) => {
    setWho(w);
    setCat(c);
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
              {shown.length} shown
            </span>
          </div>
          <p className="sr-only" role="status">
            {shown.length} {shown.length === 1 ? "project" : "projects"}
          </p>
          {shown.length === 0 && <p className="os__empty">No projects match this pair of filters.</p>}
          <ul className="row" aria-label="Projects">
            {shown.map((p) => (
              <li key={p.slug} className="pc">
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
                  <div className="pc__links">
                    <Link className="pc__go" href={"/projects/" + p.slug} aria-label={`View case study for ${p.title}`}>
                      Case study ↗
                    </Link>
                    <QuickLinks p={p} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
