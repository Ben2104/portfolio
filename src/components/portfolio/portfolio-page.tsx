import { About } from "./about";
import { Awards } from "./awards";
import { Contact } from "./contact";
import { Education } from "./education";
import { Experience } from "./experience";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Navbar } from "./navbar";
import { Projects } from "./projects";
import { Skills } from "./skills";
import { Teaching } from "./teaching";
import { TerminalPreloader } from "./terminal-preloader";

export function PortfolioPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-(--portfolio-bg)">
      <TerminalPreloader />
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Teaching />
      <Projects />
      <Skills />
      <Education />
      <Awards />
      <Contact />
      <Footer />
    </main>
  );
}
