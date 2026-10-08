"use client";

import { useCallback, useState } from "react";

import { About } from "./about";
import { Contact } from "./contact";
import { Education } from "./education";
import { Experience } from "./experience";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { IntroOverlay, useIntroSkip } from "./intro-overlay";
import type { IntroPhase } from "./intro-state";
import { Navbar } from "./navbar";
import { Projects } from "./projects";
import { Skills } from "./skills";

function PortfolioContent({ introPhase }: { introPhase: IntroPhase }) {
  return (
    <>
      <Navbar />
      <Hero introPhase={introPhase} />
      <About />
      <Experience />
      <Projects introDone={introPhase === "done"} />
      <Skills />
      <Education />
      <Contact />
      <Footer />
    </>
  );
}

export function PortfolioPage() {
  const skipIntro = useIntroSkip();
  const [introPhase, setIntroPhase] = useState<IntroPhase>("holding");
  const handleIntroExitStart = useCallback(() => setIntroPhase("exiting"), []);
  const handleIntroComplete = useCallback(() => setIntroPhase("done"), []);

  /* A skipped intro never reports back, so treat it as already finished */
  const effectivePhase: IntroPhase =
    skipIntro && introPhase === "holding" ? "done" : introPhase;

  return (
    <main className="min-h-screen overflow-x-clip bg-(--portfolio-bg)">
      <IntroOverlay
        skip={skipIntro}
        onExitStart={handleIntroExitStart}
        onComplete={handleIntroComplete}
      />
      <PortfolioContent introPhase={effectivePhase} />
    </main>
  );
}
