import { education, facts, skills } from "@/data/site";
import { Photo } from "./photo";
import { Reveal } from "./reveal";

export function Intro() {
  return (
    <section className="scr story" id="intro" aria-labelledby="intro-h">
      <div className="wrap story__layout">
        <Reveal>
          <p className="lbl">Introduction</p>
          <h2 className="giant" id="intro-h">From the first idea to the shipped product.</h2>
        </Reveal>
        <Reveal className="story__detail">
          <p className="lead">
            I&apos;m a Computer Science student passionate about building innovative solutions at the intersection of
            design and engineering. I like the whole path: the sketch, the code, the launch.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="scr story" id="about" aria-labelledby="about-h">
      <div className="wrap story__layout">
        <Reveal>
          <p className="lbl">About me</p>
          <h2 className="giant" id="about-h">Khoi Do</h2>
          <p className="lead">
            I enjoy taking ideas from concept to execution. I design the interface, build the front end and wire it
            to the model or the API behind it, then keep polishing until it feels right in someone&apos;s hands.
          </p>
          <dl className="facts">
            {facts.map(([key, value]) => (
              <div key={key}>
                <dt className="mono">{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Photo
          className="about__ph"
          src="/deck/k-about.webp"
          alt="Hoang Khoi Do adjusting his cuff"
          sizes="(max-width: 860px) 90vw, 40vw"
        />
      </div>
    </section>
  );
}

export function Education() {
  return (
    <section className="scr story" id="education" aria-labelledby="edu-h">
      <div className="wrap story__layout">
        <Reveal>
          <h2 className="giant" id="edu-h">Education</h2>
        </Reveal>
        <Reveal>
          <ol className="edu__list">
            {education.map((entry) => (
              <li key={entry.school}>
                <span className="yr">{entry.year}</span>
                <h3>{entry.school}</h3>
                <p>{entry.detail}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

export function Skills() {
  return (
    <section className="scr story skills" id="skills" aria-labelledby="skills-h">
      <div className="wrap">
        <Reveal>
          <h2 className="giant" id="skills-h">Technical skills</h2>
          <div className="skills__grid">
            {skills.map((s) => (
              <div key={s.title}>
                <h3 className="pill pill--o skills__pill">{s.title}</h3>
                <p className="lead">{s.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
