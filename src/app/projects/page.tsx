import type { Metadata } from "next";
import Link from "next/link";

import { Archive } from "@/components/deck/archive";
import { ExperienceExperiment } from "@/components/deck/experience-experiment";

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
        <a className="mono" href="#experience-experiment">3D timeline</a>
      </nav>
      <main className="arc lit">
        <div className="wrap">
          <header className="arc__head">
            <div>
              <p className="lbl">Project archive</p>
              <h1 className="giant">Every build, one place</h1>
            </div>
            <p className="mono">Scroll to explore →</p>
          </header>
          <Archive />
        </div>
        <ExperienceExperiment />
      </main>
    </>
  );
}
