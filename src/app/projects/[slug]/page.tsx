import { Analytics } from "@vercel/analytics/next";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseSide } from "@/components/deck/case-side";
import { Reveal } from "@/components/deck/reveal";
import { cats, projects, toolIcons } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title + " | Khoi Do", description: p.line } : {};
}

const SECTIONS = [
  ["overview", "Overview"],
  ["idea", "The idea"],
  ["role", "My role"],
  ["workflow", "Workflow"],
  ["features", "Key features"],
  ["stack", "Tech stack"],
  ["team", "Team & links"],
] as const;

const pad = (n: number, len: number) => String(n).padStart(len, "0");

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  const total = pad(projects.length, 2);
  const solo = p.team === 1;
  const links = (
    [
      ["Live site", p.links.live],
      ["Devpost", p.links.devpost],
      ["Source code", p.links.source],
    ] as [string, string | undefined][]
  ).filter((l): l is [string, string] => !!l[1]);
  // long titles get a smaller headline so they still fit
  const ts = p.title.length <= 5 ? 1 : p.title.length <= 10 ? 0.8 : p.title.length <= 16 ? 0.6 : 0.42;

  return (
    <div className="cs">
      <header className="cs__bar">
        <div className="l">
          <span className="cs__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <Link className="mono" href="/#work">
            <b>KHOI.OS</b> / PROJECT_{pad(i + 1, 3)}
          </Link>
        </div>
        <span className="mono">
          Case study / {pad(i + 1, 2)} — {total}
        </span>
      </header>

      <div className="cs__shell">
        <CaseSide items={SECTIONS} />
        <main className="cs__main">
          <section className="cs__sec cs__ov lit" id="overview" aria-labelledby="cs-title">
            <div className="cs__ovtop">
              <p className="lbl">01 / Overview</p>
              {p.award && <span className="pill pill--o cs__award">{p.award}</span>}
            </div>
            <h1 id="cs-title" style={{ "--ts": ts } as CSSProperties}>
              {p.title}
            </h1>
            <p className="lead">{p.short}</p>
            <div className="cs__ovrow">
              <div className="cs__frame">
                <Image src={"/deck/projects/" + p.img + ".webp"} alt={p.title + " project preview"} fill priority sizes="(max-width: 860px) 100vw, 760px" />
              </div>
              <dl className="cs__meta">
                <div>
                  <dt className="mono">Year</dt>
                  <dd>{p.year}</dd>
                </div>
                <div>
                  <dt className="mono">Category</dt>
                  <dd>{cats[p.cat]}</dd>
                </div>
                <div>
                  <dt className="mono">Team</dt>
                  <dd>{solo ? "Solo build" : p.team + " people"}</dd>
                </div>
                <div>
                  <dt className="mono">Built at</dt>
                  <dd>{p.event}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="cs__sec" id="idea" aria-labelledby="idea-h">
            <Reveal>
              <p className="lbl">02 / The idea</p>
              <h2 className="cs__h2" id="idea-h">
                Why it exists
              </h2>
              <div className="cs__two">
                <div className="cs__box">
                  <p className="mono">The problem</p>
                  <h3>What was broken</h3>
                  <p>{p.problem}</p>
                </div>
                <div className="cs__box cs__box--o">
                  <p className="mono">The solution</p>
                  <h3>What it does</h3>
                  <p>{p.solution}</p>
                </div>
              </div>
            </Reveal>
          </section>

          <section className="cs__sec" id="role" aria-labelledby="role-h">
            <Reveal>
              <p className="lbl">03 / My role</p>
              <h2 className="cs__h2" id="role-h">
                What I owned
              </h2>
              <p className="cs__rolelead">{p.role}</p>
            </Reveal>
          </section>

          <section className="cs__sec lit" id="workflow" aria-labelledby="flow-h">
            <Reveal>
              <p className="lbl">04 / Workflow</p>
              <h2 className="cs__h2" id="flow-h">
                How it works
              </h2>
              <ol className="cs__flow">
                {p.flow.map((step, k) => (
                  <li key={step}>
                    <div className="cs__node">
                      <b>Step {pad(k + 1, 2)}</b>
                      <p>{step}</p>
                    </div>
                    <span className="cs__wire" aria-hidden="true" />
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          <section className="cs__sec" id="features" aria-labelledby="feat-h">
            <Reveal>
              <p className="lbl">05 / Key features</p>
              <h2 className="cs__h2" id="feat-h">
                What you get
              </h2>
              <ul className="cs__feat">
                {p.features.map(([name, text], k) => (
                  <li key={name}>
                    <span className="n" aria-hidden="true">
                      {pad(k + 1, 2)}
                    </span>
                    <h3>{name}</h3>
                    <p>{text}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section className="cs__sec" id="stack" aria-labelledby="stack-h">
            <Reveal>
              <p className="lbl">06 / Tech stack</p>
              <h2 className="cs__h2" id="stack-h">
                Built with
              </h2>
              <ul className="cs__chips">
                {p.stack.map((t) => (
                  <li className="cs__chip" key={t}>
                    {toolIcons[t] && <Image src={"/deck/icons/" + toolIcons[t] + ".svg"} alt="" width={18} height={18} unoptimized />}
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section className="cs__sec" id="team" aria-labelledby="team-h">
            <Reveal>
              <p className="lbl">07 / Team & links</p>
              <h2 className="cs__h2" id="team-h">
                Where to find it
              </h2>
              <div className="cs__two">
                <div className="cs__box">
                  <p className="mono">Team</p>
                  <h3>{solo ? "Solo build" : p.team + " people"}</h3>
                  <p>
                    {p.event}, {p.year}.
                  </p>
                </div>
                {links.length > 0 && (
                  <ul className="cs__res">
                    {links.map(([label, href]) => (
                      <li key={label}>
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {label} <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="cs__next">
                <div>
                  <p className="mono">
                    Next case study / {pad((i + 1) % projects.length + 1, 2)}
                  </p>
                  <Link className="big" href={"/projects/" + next.slug}>
                    {next.title} →
                  </Link>
                </div>
                <Link className="pill" href="/#work">
                  ← Back to archive
                </Link>
              </div>
            </Reveal>
          </section>
        </main>
      </div>
      <Analytics />
    </div>
  );
}
