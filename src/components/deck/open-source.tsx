import { GITHUB_URL, contributions, repos } from "@/data/site";
import { Reveal } from "./reveal";

const pad = (n: number) => String(n).padStart(2, "0");

/** Deck page 28: featured repositories and contribution highlights, side by side. */
export function OpenSource() {
  return (
    <section className="scr story osec" id="opensource" aria-labelledby="os-h">
      <div className="wrap">
        <Reveal>
          <p className="lbl">08 / Open source</p>
          <h2 className="cs__h2" id="os-h">Open source &amp; community impact.</h2>
          <p className="cs__sub">Explore open-source projects, contributions, and shared resources.</p>
        </Reveal>
        <div className="cs__two">
          <Reveal className="cs__panel">
            <p className="lbl">01 / Open source projects</p>
            <h3>Featured repositories</h3>
            <ul className="cs__rows">
              {repos.map((r, k) => (
                <li key={r.name}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    <span className="lbl">Repo_{pad(k + 1)}</span>
                    <strong>{r.name}</strong>
                    <span className="osrc__txt">{r.text}</span>
                    <span className="mono">{r.stack}</span>
                    <b aria-hidden="true">↗</b>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="cs__panel" delay={0.1}>
            <p className="lbl">02 / Community contributions</p>
            <h3>Contribution highlights</h3>
            <ul className="cs__rows">
              {contributions.map((c, k) => {
                const body = (
                  <>
                    <span className="lbl">Contribution_{pad(k + 1)}</span>
                    <strong>{c.title}</strong>
                    <span className="osrc__txt">{c.text}</span>
                  </>
                );
                return (
                  <li key={c.title}>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        {body}
                        <b aria-hidden="true">↗</b>
                      </a>
                    ) : (
                      <div className="osrc__plain">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <a className="pill pill--w osrc__all" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">All repositories ↗</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
