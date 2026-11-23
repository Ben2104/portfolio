import { education, facts } from "@/data/site";
import { Photo } from "./photo";
import { Reveal } from "./reveal";

export function Intro() {
  return (
    <section className="scr lit story story--intro" id="intro" aria-labelledby="intro-h">
      <div className="stage">
        <Photo
          className="intro__ph"
          src="/deck/k-intro.webp"
          alt="Hoang Khoi Do standing, looking to the side"
          sizes="(max-width: 860px) 80vw, 30vw"
        />
        <div className="intro__copy">
          <div className="wrap">
            <Reveal>
              <p className="lbl">01 / Introduction</p>
              <h2 id="intro-h">From the first idea to the shipped product.</h2>
              <p className="lead">
                I&apos;m a Computer Science student passionate about building innovative solutions at the intersection of
                design and engineering. I like the whole path: the sketch, the code, the launch.
              </p>
            </Reveal>
          </div>
        </div>
        <Reveal className="giant story__word intro__word" y={90}>
          <p aria-hidden="true">Introduction</p>
        </Reveal>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="scr story story--about" id="about" aria-labelledby="about-h">
      <div className="stage">
        <Photo
          className="about__ph"
          src="/deck/k-about.webp"
          alt="Hoang Khoi Do adjusting his cuff"
          sizes="(max-width: 860px) 80vw, 42vw"
        />
        <div className="about__copy">
          <Reveal>
            <p className="lbl">02 / About me</p>
            <h2 className="giant" id="about-h">
              Khoi do
            </h2>
            <p className="lead">
              I enjoy taking ideas from concept to execution. I design the interface, build the front end and wire it
              to the model or the API behind it, then keep polishing until it feels right in someone&apos;s hands.
            </p>
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="mono">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Education() {
  return (
    <section className="scr lit story story--edu" id="education" aria-labelledby="edu-h">
      <div className="stage">
        <div className="edu__list">
          <div className="wrap">
            <Reveal>
              <p className="lbl">03 / Education</p>
              <h2 className="sr" id="edu-h">
                Education
              </h2>
              <ol>
                {education.map((e) => (
                  <li key={e.school}>
                    <span className="yr">{e.year}</span>
                    <h3>{e.school}</h3>
                    <p>{e.detail}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
        <Photo
          className="edu__ph"
          src="/deck/k-edu.webp"
          alt="Hoang Khoi Do full length, hand at his chin"
          sizes="(max-width: 860px) 70vw, 28vw"
        />
        <p className="giant edu__word" aria-hidden="true">
          Education
        </p>
      </div>
    </section>
  );
}
