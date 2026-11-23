"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { GITHUB_URL, LINKEDIN_URL } from "@/data/site";
import { GithubIcon, LinkedinIcon, MailIcon } from "./icons";
import { LiveDate } from "./live-date";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // depth: the giant word lags behind the page, the cut-out lags less, so they slide past each other
  const word = useTransform(scrollYProgress, [0, 1], [0, 190]);
  const cut = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const copy = useTransform(scrollYProgress, [0, 0.7], [0, -40]);

  return (
    <section className="scr hero" id="top" ref={ref} aria-labelledby="hero-h">
      <div className="stage">
        <div className="hero__row">
          <p className="hero__role">DEVELOPER</p>
          <p className="hero__date">
            <LiveDate />
            <br />
            Khoi do
          </p>
        </div>
        <ul className="hero__soc" aria-label="Elsewhere">
          <li>
            <a href={GITHUB_URL} aria-label="GitHub" target="_blank" rel="noreferrer">
              <GithubIcon />
            </a>
          </li>
          <li>
            <a href={LINKEDIN_URL} aria-label="LinkedIn" target="_blank" rel="noreferrer">
              <LinkedinIcon />
            </a>
          </li>
          <li>
            <a href="#contact-form" aria-label="Email me">
              <MailIcon />
            </a>
          </li>
        </ul>
        <div className="hero__mid">
          <motion.div className="hero__word" style={{ y: word }}>
            <h1 className="giant" id="hero-h">
              <span className="sr">Hoang Khoi Do, developer </span>Portfolio
            </h1>
          </motion.div>
          <motion.div className="hero__cut" style={{ y: cut }}>
            <Image
              src="/deck/k-cover-cut.webp"
              alt="Hoang Khoi Do in a black suit, hands folded"
              width={877}
              height={2400}
              sizes="(max-width: 860px) 62vw, 21vw"
              priority
            />
          </motion.div>
        </div>
        <motion.p className="hero__p hero__p--l" style={{ y: copy }}>
          Driven by curiosity and a passion for technology, I explore the intersection of software engineering and
          creative design. I enjoy turning ideas into practical digital solutions, with a focus on thoughtful
          execution, clean code, and meaningful user experiences.
        </motion.p>
        <motion.p className="hero__p hero__p--r" style={{ y: copy }}>
          Beyond building software, I actively contribute to open-source projects and mentor fellow students in
          their learning journeys. I believe in continuous learning, sharing knowledge, and collaborating with
          others to create technology that makes a difference.
        </motion.p>
      </div>
    </section>
  );
}
