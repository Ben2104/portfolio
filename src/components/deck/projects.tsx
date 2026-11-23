import Link from "next/link";
import { projects } from "@/data/site";
import { Reveal } from "./reveal";

export function Selected() {
  return (
    <section className="scr selected" id="selected" aria-labelledby="sel-h">
      <div className="wrap selected__layout">
        <Reveal>
          <h2 className="giant" id="sel-h">Selected projects</h2>
          <p className="lead">Hackathon winners, team builds, and solo tools.</p>
          <Link className="pill pill--w" href="/projects">Open the archive ↗</Link>
        </Reveal>
        <ul className="selected__list">
          {projects.slice(0, 3).map((project) => (
            <li key={project.slug}>
              <Link href={`/projects/${project.slug}`}>
                <span>
                  <strong>{project.title}</strong>
                  <span>{project.short}</span>
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
