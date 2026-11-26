import Image from "next/image";
import Link from "next/link";
import { badge, projects } from "@/data/site";
import { QuickLinks } from "./archive";
import { Photo } from "./photo";
import { Reveal } from "./reveal";

const featured = ["shape-sign", "911-operator-assistant", "lobe"].map((slug) => projects.find((p) => p.slug === slug)!);

export function Selected() {
  return (
    <section className="scr selected" id="selected" aria-labelledby="sel-h">
      <div className="stage">
        <Photo
          className="sel__ph"
          src="/deck/k-profile.webp"
          alt="Hoang Khoi Do in profile"
          sizes="(max-width: 860px) 76vw, 30vw"
        />
        <div className="sel__copy">
          <div className="wrap">
            <Reveal>
              <p className="lbl">05 / Projects</p>
              <h2 className="giant" id="sel-h">
                Selected
                <br />
                projects
              </h2>
              <div className="sel__pills">
                <span className="pill pill--o">{featured.length} featured · {projects.length} total</span>
              </div>
              <p className="lead">
                Hackathon winners, team builds and solo tools. Each one has a case study: the idea, what I owned, how it
                works and the stack behind it.
              </p>
              <ul className="sel__cards">
                {featured.map((p) => (
                  <li className="sc" key={p.slug}>
                    <span className="sc__img">
                      <Image src={"/deck/projects/" + p.img + ".webp"} alt="" fill sizes="(max-width: 860px) 90vw, 20vw" />
                    </span>
                    {badge(p) && <span className="mono sc__badge">{badge(p)}</span>}
                    <h3>
                      <Link href={"/projects/" + p.slug}>{p.title}</Link>
                    </h3>
                    <span className="mono sc__role">{p.roleTitle}</span>
                    <span className="sc__line">{p.line}</span>
                    <span className="sc__tags">
                      {p.stack.slice(0, 3).map((t) => (
                        <span className="tag" key={t}>{t}</span>
                      ))}
                    </span>
                    <span className="sc__links">
                      <QuickLinks p={p} />
                    </span>
                  </li>
                ))}
              </ul>
              <Link className="pill pill--w" href="/projects">
                View all {projects.length} projects →
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
