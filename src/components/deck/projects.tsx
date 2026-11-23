import { projects } from "@/data/site";
import { Photo } from "./photo";
import { Reveal } from "./reveal";

export function Selected() {
  return (
    <section className="scr story story--sel" id="selected" aria-labelledby="sel-h">
      <div className="stage">
        <Photo
          className="sel__ph"
          src="/deck/k-profile.webp"
          alt="Hoang Khoi Do in profile"
          sizes="(max-width: 860px) 80vw, 30vw"
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
                <span className="pill pill--o">{projects.length} featured projects</span>
                <span className="pill">Team collaboration</span>
                <span className="pill">Individual contributions</span>
              </div>
              <p className="lead">
                Hackathon winners, team builds and solo tools. Each one has a case study: the idea, what I owned, how it
                works and the stack behind it.
              </p>
              <a className="pill pill--w" href="#work">
                Open the archive ↗
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
