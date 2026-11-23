import { GITHUB_URL, contributions, repos } from "@/data/site";
import { Reveal } from "./reveal";

export function OpenSource() {
  return (
    <section className="scr story osec" id="opensource" aria-labelledby="os-h">
      <div className="wrap">
        <Reveal>
          <p className="lbl">08 / Open source</p>
          <h2 className="giant" id="os-h">Open source &amp; community impact.</h2>
          <p className="lead">Open-source projects, contributions and shared resources.</p>
        </Reveal>
        <div className="osrc__cols">
          <Reveal>
            <h3 className="mono">Featured repositories</h3>
            <ul className="osrc__list">
              {repos.map((r) => (
                <li key={r.name}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    <strong>{r.name} ↗</strong>
                    <span>{r.text}</span>
                    <em className="mono">{r.stack}</em>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="mono">Contribution highlights</h3>
            <ul className="osrc__list">
              {contributions.map((c) => (
                <li key={c.title}>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      <strong>{c.title} ↗</strong>
                      <span>{c.text}</span>
                    </a>
                  ) : (
                    <div>
                      <strong>{c.title}</strong>
                      <span>{c.text}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <a className="pill pill--w" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">All repositories ↗</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
