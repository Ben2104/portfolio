import { education, skills } from "@/data/site";
import { Photo } from "./photo";
import { Reveal } from "./reveal";

export function Intro() {
  return (
    <section className="scr deck deck--intro" id="intro" aria-labelledby="intro-h">
      <Reveal className="deck__copy">
        <p className="deck__lbl">01 / Introduction</p>
        <p>
          I&apos;m a Computer Science student passionate about building innovative solutions at the intersection of
          design and engineering. I enjoy transforming creative ideas into meaningful digital experiences through
          technology and problem-solving.
        </p>
        <p>
          Beyond coding, I actively contribute to open-source projects and mentor fellow students throughout their
          learning journeys. I believe in continuous growth, sharing knowledge, and creating a positive impact through
          technology.
        </p>
      </Reveal>
      <h2 className="deck__word" id="intro-h">Introduction</h2>
      <Photo className="deck__ph" src="/deck/k-intro.webp" alt="Hoang Khoi Do in a black suit, hands clasped" sizes="(max-width: 860px) 70vw, 30vw" />
    </section>
  );
}

export function About() {
  return (
    <section className="scr deck deck--about" id="about" aria-labelledby="about-h">
      <Photo className="deck__ph" src="/deck/k-about.webp" alt="Hoang Khoi Do adjusting his cuff" sizes="(max-width: 860px) 80vw, 36vw" />
      <h2 className="deck__name" id="about-h">Do Hoang Khoi</h2>
      <Reveal className="deck__copy">
        <h3>About Me</h3>
        <p>
          I enjoy taking ideas from concept to execution, turning complex challenges into practical solutions. Through
          hands-on projects, research coordination, and teaching, I&apos;ve developed a strong appreciation for
          collaboration, problem-solving, and continuous improvement. I&apos;m driven by the opportunity to build
          meaningful things while helping the people around me grow.
        </p>
      </Reveal>
    </section>
  );
}

export function Education() {
  return (
    <section className="scr deck deck--edu" id="education" aria-labelledby="edu-h">
      <Reveal className="deck__copy">
        {education.map((e) => (
          <article key={e.school}>
            <h3>
              {e.school} <span>{e.year}</span>
            </h3>
            <p>{e.detail}</p>
          </article>
        ))}
      </Reveal>
      <Photo className="deck__ph" src="/deck/k-profile.webp" alt="Hoang Khoi Do in a dark suit" sizes="(max-width: 860px) 60vw, 30vw" />
      <h2 className="deck__vert" id="edu-h">Education</h2>
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
