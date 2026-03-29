import { About } from "./about";
import { Contact } from "./contact";
import { Experience } from "./experience";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Navbar } from "./navbar";
import { Projects } from "./projects";
import { Skills } from "./skills";

export function PortfolioPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-(--portfolio-bg)">
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Contact />
      <Footer />
    </main>
  );
}
