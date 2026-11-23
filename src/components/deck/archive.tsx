"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cats, projects } from "@/data/site";
import type { Project } from "@/data/site";

type Collection = "all" | "team" | "solo";

const collections: [Collection, string][] = [
  ["all", "All projects"],
  ["team", "Team builds"],
  ["solo", "Solo builds"],
];
const categories = [["all", "Every category"], ...Object.entries(cats)];

const matchesCollection = (project: Project, collection: Collection) =>
  collection === "all" || (collection === "solo") === (project.team === 1);
const matchesCategory = (project: Project, category: string) =>
  category === "all" || project.cat === category;

export function Archive() {
  const [collection, setCollection] = useState<Collection>("all");
  const [category, setCategory] = useState("all");

  const shown = projects.filter(
    (project) => matchesCollection(project, collection) && matchesCategory(project, category),
  );

  return (
    <>
      <div className="arc__filters">
        <fieldset>
          <legend className="mono">Collection</legend>
          {collections.map(([value, label]) => (
            <button className="fbtn" type="button" key={value} aria-pressed={collection === value} onClick={() => setCollection(value)}>
              {label}
            </button>
          ))}
        </fieldset>
        <fieldset>
          <legend className="mono">Category</legend>
          {categories.map(([value, label]) => (
            <button className="fbtn" type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>
              {label}
            </button>
          ))}
        </fieldset>
      </div>

      <p className="arc__count mono" role="status">
        {shown.length} {shown.length === 1 ? "project" : "projects"}
      </p>
      {shown.length === 0 && <p className="lead">No projects match these filters.</p>}
      <ul className="arc__grid" aria-label="Projects">
        {shown.map((project) => (
          <li key={project.slug}>
            <Link className="pc" href={`/projects/${project.slug}`}>
              <div className="pc__img">
                <Image
                  src={`/deck/projects/${project.img}.webp`}
                  alt=""
                  fill
                  sizes="(max-width: 580px) 95vw, (max-width: 1050px) 48vw, 32vw"
                />
              </div>
              <p className="mono">{cats[project.cat]} · {project.year} · {project.team === 1 ? "Solo build" : "Team build"}</p>
              <h2>{project.title}</h2>
              <p>{project.line}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
