
import { GooeyNav } from "@/components/deck/gooey-nav";
import { Contact } from "@/components/deck/contact";
import { Experience } from "@/components/deck/experience";
import { Hero } from "@/components/deck/hero";
import { Selected } from "@/components/deck/projects";
import { OpenSource } from "@/components/deck/open-source";
import { About, Education, Intro, Skills } from "@/components/deck/story";

export default function Home() {
  return (
    <>
      <GooeyNav />
      <main>
        <Hero />
        <Intro />
        <About />
        <Education />
        <Skills />
        <Experience />
        <Selected />
        <OpenSource />
        <Contact />
      </main>
    </>
  );
}
