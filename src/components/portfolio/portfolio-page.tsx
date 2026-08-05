"use client";

import { useCallback, useState } from "react";

import { About } from "./about";
import { Contact } from "./contact";
import { Education } from "./education";
import { Experience } from "./experience";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Navbar } from "./navbar";
import { Projects } from "./projects";
import { Skills } from "./skills";
import { TerminalPreloader } from "./terminal-preloader";

function PortfolioContent() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Education />
      <Contact />
      <Footer />
    </>
  );
}

export function PortfolioPage() {
  const [isBootComplete, setIsBootComplete] = useState(false);
  const handleBootComplete = useCallback(() => setIsBootComplete(true), []);

  return (
    <main className="min-h-screen overflow-x-clip bg-(--portfolio-bg)">
      <TerminalPreloader onComplete={handleBootComplete} />
      {isBootComplete ? <PortfolioContent /> : null}
    </main>
  );
}
