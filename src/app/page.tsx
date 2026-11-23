import { Analytics } from "@vercel/analytics/next";

import { GooeyNav } from "@/components/deck/gooey-nav";
import { Experience } from "@/components/deck/experience";
import { Hero } from "@/components/deck/hero";
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
      </main>
      <Analytics />
    </>
  );
}
