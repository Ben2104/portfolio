
import { GooeyNav } from "@/components/deck/gooey-nav";
import { Contact } from "@/components/deck/contact";
import { Experience } from "@/components/deck/experience";
import { Hero } from "@/components/deck/hero";
import { Selected } from "@/components/deck/projects";
import { About, Education, Intro } from "@/components/deck/story";

export default function Home() {
  return (
    <>
      <GooeyNav />
      <main>
        <Hero />
        <Intro />
        <About />
        <Education />
        <Experience />
        <Selected />
        <Contact />
      </main>
    </>
  );
}
