"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
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
const pad = (n: number, len: number) => String(n).padStart(len, "0");
const TOTAL = pad(projects.length, 2);

/** The archive: a window-style card with two filters and a row of case-study cards. Hovering a card selects it. */
export function Archive() {
  const [who, setWho] = useState<Who>("all");
  const [cat, setCat] = useState("all");
  const [pick, setPick] = useState("");
  const row = useRef<HTMLUListElement>(null);

  const shown = projects.filter((p) => okWho(p, who) && okCat(p, cat));
  const sel = shown.find((p) => p.slug === pick) ?? shown[0];
  const n = sel ? projects.indexOf(sel) + 1 : null;

  const refilter = (w: Who, c: string) => {
    setWho(w);
    setCat(c);
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
          <span className="mono">KHOI.OS / {n === null ? "PROJECTS" : `PROJECT_${pad(n, 3)}`}</span>
        </div>
        {n !== null && <span className="mono os__count">Case study / {pad(n, 2)} — {TOTAL}</span>}
      </div>
      <div className="os__body">
        <div className="os__side">
          <span className="mono">Collection</span>
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
          <span className="mono">Category</span>
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
          <p className="os__meta mono">
            <span role="status">
              {shown.length} {shown.length === 1 ? "project" : "projects"}
            </span>
            <span className="os__sel">{sel?.title}</span>
          </p>
          {shown.length === 0 && <p className="os__empty">No projects match this pair of filters.</p>}
          <ul className="row" ref={row} aria-label="Projects" tabIndex={0}>
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
                  <span className="mono">CASE_{pad(projects.indexOf(p) + 1, 3)}</span>
                  <h2>{p.title}</h2>
                  <span className="cat mono">
                    {cats[p.cat]} · {p.year} · {isSolo(p) ? "Solo build" : "Team build"}
                  </span>
                  <p>{p.line}</p>
                  <Link className="pc__go" href={"/projects/" + p.slug} aria-label={`View case study for ${p.title}`}>
                    View case study ↗
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
