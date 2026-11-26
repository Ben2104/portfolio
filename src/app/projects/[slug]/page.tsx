import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseFeatures } from "@/components/deck/case-features";
import { CaseSide } from "@/components/deck/case-side";
import { Reveal } from "@/components/deck/reveal";
import { cats, imgH, projects, toolIcons } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  const title = p.title + " | Khoi Do";
  return {
    title,
    description: p.line,
    openGraph: { title, description: p.line, images: ["/deck/projects/" + p.img + ".webp"] },
    twitter: { card: "summary_large_image" },
  };
}

const SECTIONS = [
  ["overview", "Overview"],
  ["role", "My role"],
  ["workflow", "Workflow"],
  ["features", "Key features"],
  ["stack", "Tech stack"],
  ["team", "Team & links"],
] as const;

const FLOW = ["Input", "Process", "Core logic", "Output"];

// stack layers from the deck; any tool not listed lands in Backend
const LAYERS: [string, string, string, string[]][] = [
  ["Frontend", "User interface and presentation layer.", "Client layer", ["TypeScript", "JavaScript", "React", "React Three Fiber", "NiiVue", "Next.js", "Tailwind CSS", "Vite", "HTML", "CSS", "Google Maps", "MediaPipe"]],
  ["Backend", "Server-side logic and services.", "Server layer", []],
  ["Data & storage", "Data storage and retrieval systems.", "Data layer", ["Convex", "MongoDB", "Firebase", "SQLite"]],
  ["Infra & tools", "Deployment and development tools.", "Platform layer", ["Docker", "Vercel", "GitHub Actions", "Chrome", "Playwright"]],
];
const layerOf = (t: string) => {
  const k = LAYERS.findIndex(([, , , list]) => list.includes(t));
  return k < 0 ? 1 : k;
};

const pad = (n: number, len: number) => String(n).padStart(len, "0");

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const n = (i + 1) % projects.length;
  const next = projects[n];
  const total = pad(projects.length, 2);
  const solo = p.team === 1;
  const links = (
    [
      ["GitHub repository", p.links.source],
      ["Live demo", p.links.live],
      ["Devpost page", p.links.devpost],
    ] as [string, string | undefined][]
  ).filter((l): l is [string, string] => !!l[1]);
  const platform = p.stack.includes("Playwright") ? "Scheduled job" : p.stack.includes("Chrome") ? "Chrome extension" : "Web";
  const details: [string, string, string][] = [
    ["Platform", platform, "Where the feature runs."],
    ["Framework", p.stack.slice(0, 2).join(" / "), "Core technologies used to build the feature."],
    ["Status", "Completed", "Implementation and validation completed."],
  ];
  const layers = LAYERS.map((l, k) => [l, p.stack.filter((t) => layerOf(t) === k)] as const).filter(([, tools]) => tools.length);
  const role = [
    ["Ownership", "Primary ownership", solo ? "Built end to end, alone: design, code and shipping." : `One of ${p.team} on the team.`, "Ownership scope", p.roleTitle],
    ["Execution", "Technical execution", `Built with ${p.stack.slice(0, 4).join(", ")}.`, "Key deliverable", p.features[0][0]],
    ["Impact", "Teamwork & impact", p.line, "Result", p.award ?? p.event],
  ];
  // long titles get a smaller headline so they still fit
  const ts = p.title.length <= 10 ? 1 : p.title.length <= 16 ? 0.8 : 0.62;

  return (
    <div className="cs">
      <header className="cs__bar">
        <div className="l">
          <span className="cs__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <Link className="mono" href="/projects">
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
          <section className="cs__sec cs__ov" id="overview" aria-labelledby="cs-title">
            <div className="cs__ovtop">
              <p className="lbl">CASE_{pad(i + 1, 3)} / Project overview</p>
              {p.award && <span className="cs__award">{p.event}</span>}
            </div>
            <h1 id="cs-title" style={{ "--ts": ts } as CSSProperties}>
              {p.title}
            </h1>
            <p className="mono">
              {cats[p.cat]} · {solo ? "Solo" : "Team"} · {p.year}
              {!p.award && !/project$/.test(p.event) && ` · ${p.event}`}
            </p>
            <div className="cs__ovrow">
              <div className="cs__frame">
                <Image src={"/deck/projects/" + p.img + ".webp"} alt={p.title + " project preview"} width={1400} height={imgH[p.img]} priority sizes="(max-width: 860px) 100vw, 900px" />
              </div>
              <div className="cs__panel cs__snap">
                <p className="lbl">Project snapshot</p>
                <dl>
                  <div>
                    <dt className="mono">Project type</dt>
                    <dd>{solo ? "Solo build" : "Team build"}</dd>
                  </div>
                  <div>
                    <dt className="mono">Team size</dt>
                    <dd>{p.team} {solo ? "member" : "members"}</dd>
                  </div>
                  <div>
                    <dt className="mono">My role</dt>
                    <dd>{p.roleTitle}</dd>
                  </div>
                  <div>
                    <dt className="mono">Timeline</dt>
                    <dd>{p.year}</dd>
                  </div>
                </dl>
                <div className="cs__btns">
                  {(
                    [
                      ["Live demo", p.links.live],
                      ["Devpost", p.links.devpost],
                      ["Source", p.links.source],
                    ] as [string, string | undefined][]
                  ).map(
                    ([label, href]) =>
                      href && (
                        <a key={label} className="cs__btn" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in new tab)`}>
                          {label} ↗
                        </a>
                      ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="cs__sec" id="idea" aria-labelledby="idea-h">
            <Reveal>
              <p className="lbl">01 / Project overview</p>
              <h2 className="cs__h2" id="idea-h">
                The idea behind the build
              </h2>
              <p className="cs__sub">A closer look at the problem, the thinking, and the solution behind this project.</p>
              <div className="cs__ps">
                <div className="cs__panel">
                  <p className="lbl">01 / Challenge</p>
                  <h3>The problem</h3>
                  <p>{p.problem}</p>
                </div>
                <span className="cs__arrow" aria-hidden="true">›</span>
                <div className="cs__panel">
                  <p className="lbl">02 / Approach</p>
                  <h3>The solution</h3>
                  <p>{p.solution}</p>
                </div>
              </div>
            </Reveal>
          </section>

          <section className="cs__sec" id="role" aria-labelledby="role-h">
            <Reveal>
              <p className="lbl">02 / My role</p>
              <h2 className="cs__h2" id="role-h">
                What I owned. What I built.
              </h2>
              <p className="cs__sub">A breakdown of my responsibilities, technical ownership, and contributions to the team.</p>
              <div className="cs__panel cs__prole">
                <div>
                  <p className="lbl">Primary role</p>
                  <h3>{p.roleTitle}</h3>
                </div>
                <div>
                  <p className="lbl">Role summary</p>
                  <p>{p.role}</p>
                </div>
              </div>
              <ul className="cs__three">
                {role.map(([tag, h, text, fk, fv], k) => (
                  <li className="cs__panel" key={tag}>
                    <p className="lbl">
                      {pad(k + 1, 2)} / {tag}
                    </p>
                    <h3>{h}</h3>
                    <p>{text}</p>
                    <div className="cs__foot">
                      <span className="lbl">{fk}</span>
                      <span>{fv}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section className="cs__sec" id="workflow" aria-labelledby="flow-h">
            <Reveal>
              <p className="lbl">03 / Workflow &amp; architecture</p>
              <h2 className="cs__h2" id="flow-h">
                How the system works
              </h2>
              <p className="cs__sub">A visual breakdown of the system flow, core components, and data interactions.</p>
              <p className="mono cs__cap">System flow / high-level architecture</p>
              <ol className="cs__flow">
                {p.flow.map((step, k) => (
                  <li key={step}>
                    <div className="cs__panel cs__node">
                      <p className="lbl">
                        {pad(k + 1, 2)} / {FLOW[k]}
                      </p>
                      <h3>{FLOW[k]}</h3>
                      <p>{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          <section className="cs__sec" id="features" aria-labelledby="feat-h">
            <Reveal>
              <p className="lbl">04 / Key features</p>
              <h2 className="cs__h2" id="feat-h">
                Features that make it work
              </h2>
              <p className="cs__sub">Explore the core capabilities, interactions, and functionality built into the product.</p>
              <CaseFeatures features={p.features} img={p.img} title={p.title} details={details} />
            </Reveal>
          </section>

          <section className="cs__sec" id="stack" aria-labelledby="stack-h">
            <Reveal>
              <p className="lbl">05 / Tech stack</p>
              <h2 className="cs__h2" id="stack-h">
                The stack behind the system
              </h2>
              <p className="cs__sub">A structured overview of the technologies, frameworks, infrastructure, and tools behind this project.</p>
              <p className="mono cs__cap">Stack layers / technology groups</p>
              <ul className="cs__layers">
                {layers.map(([[name, text, tag], tools]) => (
                  <li className="cs__panel" key={name}>
                    <div className="cs__lh">
                      <p className="lbl">
                        {pad(LAYERS.findIndex((l) => l[0] === name) + 1, 2)} / {tag}
                      </p>
                      <h3>{name}</h3>
                      <p>{text}</p>
                    </div>
                    <ul className="cs__chips">
                      {tools.map((t) => (
                        <li className="cs__chip" key={t}>
                          {toolIcons[t] && <Image src={"/deck/icons/" + toolIcons[t] + ".svg"} alt="" width={18} height={18} unoptimized />}
                          {t}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section className="cs__sec" id="team" aria-labelledby="team-h">
            <Reveal>
              <p className="lbl">06 / Team &amp; links</p>
              <h2 className="cs__h2" id="team-h">
                The people behind the build.
              </h2>
              <p className="cs__sub">Meet the contributors and explore the resources behind this project.</p>
              <div className="cs__two">
                <div className="cs__panel">
                  <p className="lbl">01 / Contributors</p>
                  <h3>Team directory</h3>
                  <ul className="cs__rows">
                    <li>
                      <div>
                        <span className="lbl">Member_01</span>
                        <strong>Khoi Do</strong>
                        <span className="mono">{p.roleTitle}</span>
                      </div>
                      <div>
                        <span className="lbl">Contribution</span>
                        <span>{p.features[0][0]}</span>
                      </div>
                    </li>
                    {!solo && (
                      <li>
                        <div>
                          <span className="lbl">Member_02{p.team > 2 ? `–${pad(p.team, 2)}` : ""}</span>
                          <strong>Teammates</strong>
                          <span className="mono">{p.team - 1} {p.team === 2 ? "collaborator" : "collaborators"}</span>
                        </div>
                        <div>
                          <span className="lbl">Event</span>
                          <span>{p.event}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="cs__panel">
                  <p className="lbl">02 / Project resources</p>
                  <h3>Project resources</h3>
                  <ul className="cs__rows">
                    {links.map(([label, href], k) => (
                      <li key={label}>
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          <span className="lbl" aria-hidden="true">Resource_{pad(k + 1, 2)}</span>
                          <strong>{label}</strong>
                          <span className="mono">{href.replace(/^https?:\/\//, "")}</span>
                          <b aria-hidden="true">↗</b>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="cs__next">
                <div>
                  <p className="mono">Next case study / {pad(n + 1, 2)}</p>
                  <Link className="big" href={"/projects/" + next.slug}>
                    {next.title} →
                  </Link>
                </div>
                <Link className="pill" href="/projects">
                  ← Back to archive
                </Link>
              </div>
            </Reveal>
          </section>
        </main>
      </div>
    </div>
  );
}
