import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Link from "next/link";

import { Archive } from "@/components/deck/archive";

export const metadata: Metadata = {
  title: "Projects | Khoi Do",
  description: "Browse Khoi Do’s project archive and case studies.",
};

export default function ProjectsPage() {
  return (
    <>
      <nav className="cs__bar" aria-label="Main">
        <Link className="mono" href="/">← Home</Link>
        <Link className="mono" href="/#experience">Work experience</Link>
      </nav>
      <main className="arc lit">
        <div className="wrap">
          <header className="arc__head">
            <p className="lbl">Project archive</p>
            <h1 className="giant">Projects</h1>
            <p className="lead">Case studies, team builds, and experiments in AI, web development, and automation.</p>
          </header>
          <Archive />
        </div>
      </main>
      <Analytics />
    </>
  );
}
