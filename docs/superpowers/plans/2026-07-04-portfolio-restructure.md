# Portfolio Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure khoido.com so experience is split into clear categories (Professional / Teaching / Leadership & Research / Volunteer), refresh hero/about/contact copy, add Education/Awards sections, expand Projects and Skills content — all sourced from the resume, GitHub, and LinkedIn per `docs/superpowers/specs/2026-07-04-portfolio-restructure-design.md`.

**Architecture:** Single-page Next.js App Router app. All content flows from `src/data/portfolio.ts`; components in `src/components/portfolio/` render arrays from it. No routing changes. No test runner exists in this repo — "testable deliverable" here means: `npx tsc --noEmit` passes, `npm run build` succeeds, and a manual check in `npm run dev` confirms the section renders/behaves as described (this matches the repo's own `AGENTS.md` testing guidance).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.7, Tailwind CSS 4, `motion` (framer-motion successor), `lucide-react` icons.

## Global Constraints

- Do not invent companies, dates, metrics, awards, titles, links, or technologies. Every fact must trace to the resume, GitHub (repo/README/code search), LinkedIn, or the already-published site.
- Keep the existing visual identity (dark theme, `--portfolio-accent` orange, Clash Display + Satoshi fonts, rounded-2xl cards). No new component library, no new framework.
- Preserve existing object-shape conventions in `src/data/portfolio.ts` (plain `as const` arrays of object literals, no added TS interfaces) — follow the file's current style.
- All external links (GitHub, LinkedIn, Devpost, live demos) use `target="_blank" rel="noopener noreferrer"`.
- No backend/API-key work (contact form stays `mailto:`-based, per explicit user decision).
- After every task: `npx tsc --noEmit` must pass with zero errors before moving to the next task.

---

### Task 1: Experience data restructure + component rework + nav update

**Files:**
- Modify: `src/data/portfolio.ts` (replace `navLinks` at lines 19–24; replace `experiences` at lines 230–286)
- Modify: `src/components/portfolio/experience.tsx` (full rework)
- Modify: `src/components/portfolio/portfolio-page.tsx` (move `<Experience />` before `<Projects />`)

**Interfaces:**
- Produces: `professionalExperience`, `leadershipExperience`, `volunteerExperience` — each `readonly { role, company, period, location, color, description, highlights: readonly string[], tags: readonly string[] }[]`. Later tasks (2) add `teachingExperience` with the identical shape.
- Produces: `navLinks` — final 9-item array, all tasks after this one just rely on matching section `id`s existing eventually.

- [ ] **Step 1: Replace `navLinks` in `src/data/portfolio.ts`**

Replace:
```ts
export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
] as const;
```
With:
```ts
export const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Teaching", href: "#teaching" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Awards", href: "#awards" },
  { label: "Contact", href: "#contact" },
] as const;
```

- [ ] **Step 2: Replace `experiences` in `src/data/portfolio.ts` with three category arrays**

Replace the entire `export const experiences = [...] as const;` block with:
```ts
export const professionalExperience = [
  {
    role: "Software Engineering Intern",
    company: "DFM Europe",
    period: "Jun 2026 — Present",
    location: "Ho Chi Minh City, Vietnam · On-site",
    color: "#7c3aed",
    description: "",
    highlights: [
      "Engineering a Python/FastAPI backend for the ATN Drawing system, automating the conversion of 3D engineering models into precise 2D technical drawings for construction industry applications.",
      "Integrating the OpenAI API into the FastAPI service to intelligently scale 2D output, maximizing sketch paper utilization and improving drawing precision.",
      "Developing an AI-powered isometric view generation feature using the OpenAI API, producing dimensionally accurate projections that optimize space usage on technical sketch sheets.",
    ],
    tags: ["Python", "FastAPI", "OpenAI API", "Technical Drawing Automation"],
  },
  {
    role: "Webmaster",
    company: "ACM at CSULB",
    period: "Jan 2026 — May 2026",
    location: "Long Beach, California, United States · Hybrid",
    color: "#00d4ff",
    description: "",
    highlights: [
      "Led the redesign and redevelopment of the ACM at CSULB landing page using Next.js, improving usability, responsiveness, and visual consistency across the site.",
      "Refactored the existing Next.js codebase into a more modular and scalable architecture, reducing technical debt and improving long-term maintainability.",
      "Designed and implemented new dashboard features enabling users to upload and manage images, integrating Next.js frontend components with backend APIs for seamless data handling.",
    ],
    tags: ["Next.js", "React.js", "Tailwind CSS", "Backend APIs"],
  },
] as const;

export const leadershipExperience = [
  {
    role: "Project Manager",
    company: "AI Club at CSULB",
    period: "Jun 2026 — Present",
    location: "Long Beach, California, United States · Remote",
    color: "#f97316",
    description: "",
    highlights: [
      "Leading planning and coordination for a faculty-mentored biometric sensor research project investigating heat, humidity, and alcohol sensors on human subjects, defining project scope, milestones, and team responsibilities.",
      "Conducting literature research on wearable sensor technologies and physiological data collection, synthesizing findings to guide the team's technical direction and experimental design.",
    ],
    tags: ["Biometric Sensors", "Wearable Technology", "Research Coordination"],
  },
] as const;

export const volunteerExperience = [
  {
    role: "Computer Technical Support Volunteer",
    company: "De Anza College",
    period: "Dec 2023 — Jun 2024",
    location: "Cupertino, California, United States · On-site",
    color: "#00d4ff",
    description: "",
    highlights: [
      "Installed and configured a wide range of hardware and software, ensuring optimal functionality and seamless integration for various computing environments. Provided support for system updates, security patches, and application installations to enhance performance.",
      "Diagnosed and resolved technical issues related to hardware failures, software malfunctions, and network connectivity problems. Delivered hands-on troubleshooting support to improve efficiency and minimize downtime for users.",
      "Refurbished and repaired broken and outdated laptops by replacing defective components, optimizing system performance, and reinstalling necessary software. Successfully restored numerous devices, which were then distributed to underprivileged students in need of reliable technology for their education.",
    ],
    tags: ["Linux", "Hardware Troubleshooting", "System Setup"],
  },
] as const;
```

- [ ] **Step 3: Rewrite `src/components/portfolio/experience.tsx`**

```tsx
"use client";

import { motion } from "motion/react";

import {
  leadershipExperience,
  professionalExperience,
  volunteerExperience,
} from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

type ExperienceEntry = (typeof professionalExperience)[number];

function ExperienceCard({
  experience,
  index,
}: {
  experience: ExperienceEntry;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="font-clash m-0 text-[27px] font-bold leading-[1.2] text-(--portfolio-text)">
            {experience.role}
          </h4>
          <p className="font-satoshi mb-0 mt-2 text-[15px] leading-[1.55] text-(--portfolio-muted)">
            <span style={{ color: experience.color }}>{experience.company}</span>
            {" · "}
            {experience.location}
          </p>
        </div>
        <span
          className="w-fit rounded-full border px-4 py-1.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{
            color: experience.color,
            borderColor: `${experience.color}88`,
            background: `${experience.color}1a`,
          }}
        >
          {experience.period}
        </span>
      </div>

      {experience.highlights.length > 0 ? (
        <ul className="mt-5 space-y-2.5">
          {experience.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: experience.color }}
              />
              <span className="font-satoshi text-[14px] leading-[1.7] text-white/78">
                {highlight}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {experience.tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {experience.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/16 px-3 py-1.5 font-satoshi text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

function ExperienceGroup({
  label,
  items,
}: {
  label: string;
  items: readonly ExperienceEntry[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-12 first:mt-10">
      <h3 className="font-satoshi m-0 text-[13px] font-bold uppercase tracking-[0.14em] text-white/55">
        {label}
      </h3>
      <div className="mt-5 space-y-5">
        {items.map((experience, index) => (
          <ExperienceCard
            key={`${experience.company}-${experience.role}`}
            experience={experience}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export function Experience() {
  return (
    <section id="experience" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="Experience" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Experience
        </h2>

        <ExperienceGroup label="Professional Experience" items={professionalExperience} />
        <ExperienceGroup label="Leadership & Research Experience" items={leadershipExperience} />
        <ExperienceGroup label="Technical / Volunteer Experience" items={volunteerExperience} />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Reorder `src/components/portfolio/portfolio-page.tsx`**

Replace:
```tsx
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Contact />
```
With:
```tsx
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (no other file imports `experiences`, so this is a clean rename+split).

- [ ] **Step 6: Visual check**

Run: `npm run dev`, open the site, scroll to Experience. Confirm three sub-headings appear in order (Professional Experience, Leadership & Research Experience, Technical / Volunteer Experience) and the section now renders before Projects/Skills.

- [ ] **Step 7: Commit**

```bash
git add src/data/portfolio.ts src/components/portfolio/experience.tsx src/components/portfolio/portfolio-page.tsx
git commit -m "restructure experience into professional/leadership/volunteer categories"
```

---

### Task 2: Teaching section (new)

**Files:**
- Modify: `src/data/portfolio.ts` (add `teachingExperience` array, after the three arrays from Task 1)
- Create: `src/components/portfolio/teaching.tsx`
- Modify: `src/components/portfolio/portfolio-page.tsx` (insert `<Teaching />` after `<Experience />`)

**Interfaces:**
- Consumes: none from other tasks (mirrors `professionalExperience`'s shape from Task 1, but is its own array).
- Produces: `teachingExperience` — same shape as Task 1's experience arrays.

- [ ] **Step 1: Add `teachingExperience` to `src/data/portfolio.ts`**

Add after the `volunteerExperience` array:
```ts
export const teachingExperience = [
  {
    role: "Instructional Student Assistant",
    company: "California State University, Long Beach",
    period: "Aug 2025 — Present",
    location: "Long Beach, California, United States · Hybrid",
    color: "#7c3aed",
    description: "",
    highlights: [
      "Grading Python assignments, labs, and exams on computer arithmetic and matrix computations, providing feedback on correctness, efficiency, and code quality while maintaining consistent rubrics.",
      "Debugging student code and coaching systematic problem decomposition, edge-case handling, and test-case design to improve assignment outcomes and confidence.",
    ],
    tags: ["Python", "Computer Arithmetic", "Matrix Computations", "Grading Rubrics"],
  },
  {
    role: "Teaching Assistant",
    company: "De Anza College",
    period: "Sep 2023 — Jun 2024",
    location: "Cupertino, California, United States",
    color: "#00d4ff",
    description: "",
    highlights: [
      "Assisted professors in planning and delivering instructional content for Beginning Programming Methodologies in C++, helping students grasp fundamental concepts.",
      "Conducted review sessions, provided one-on-one tutoring, and facilitated group discussions to enhance student understanding.",
      "Evaluated labs, assignments, quizzes, and exams, providing constructive feedback to students and instructor to support academic growth.",
    ],
    tags: ["C++", "Linux", "Debugging"],
  },
] as const;
```

- [ ] **Step 2: Create `src/components/portfolio/teaching.tsx`**

```tsx
"use client";

import { motion } from "motion/react";

import { teachingExperience } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Teaching() {
  return (
    <section id="teaching" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="Teaching" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Teaching Experience
        </h2>

        <div className="mt-10 space-y-5">
          {teachingExperience.map((experience, index) => (
            <motion.article
              key={`${experience.company}-${experience.role}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-clash m-0 text-[27px] font-bold leading-[1.2] text-(--portfolio-text)">
                    {experience.role}
                  </h3>
                  <p className="font-satoshi mb-0 mt-2 text-[15px] leading-[1.55] text-(--portfolio-muted)">
                    <span style={{ color: experience.color }}>{experience.company}</span>
                    {" · "}
                    {experience.location}
                  </p>
                </div>
                <span
                  className="w-fit rounded-full border px-4 py-1.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    color: experience.color,
                    borderColor: `${experience.color}88`,
                    background: `${experience.color}1a`,
                  }}
                >
                  {experience.period}
                </span>
              </div>

              <ul className="mt-5 space-y-2.5">
                {experience.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: experience.color }}
                    />
                    <span className="font-satoshi text-[14px] leading-[1.7] text-white/78">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {experience.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/16 px-3 py-1.5 font-satoshi text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into `src/components/portfolio/portfolio-page.tsx`**

Add the import:
```tsx
import { Teaching } from "./teaching";
```
Replace:
```tsx
      <Experience />
      <Projects />
```
With:
```tsx
      <Experience />
      <Teaching />
      <Projects />
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, click "Teaching" in the nav — confirm smooth scroll to a new section between Experience and Projects showing both roles.

- [ ] **Step 6: Commit**

```bash
git add src/data/portfolio.ts src/components/portfolio/teaching.tsx src/components/portfolio/portfolio-page.tsx
git commit -m "add teaching experience section"
```

---

### Task 3: Projects data + card rework

**Files:**
- Modify: `src/data/portfolio.ts` (replace `projects` array)
- Modify: `src/components/portfolio/projects.tsx` (`ProjectCard` layout)

**Interfaces:**
- Produces: `projects` items gain `bullets: readonly string[]`, `devpostHref: string` (empty string when none), `award: string` (empty string when none). `liveHref` keeps meaning "genuine live demo only."

- [ ] **Step 1: Replace `projects` in `src/data/portfolio.ts`**

```ts
export const projects = [
  {
    title: "CrisisLineAI",
    subtitle: "Voice AI Agent Crisis Support System",
    desc: "A multi-channel crisis support system that combines realtime web chat, counselor takeover controls, and voice-call AI orchestration.",
    bullets: [
      "Built real-time multi-party chat with Next.js and Firebase, synchronizing client, AI agent, and counselor state.",
      "Built a FastAPI transcription service processing recorded call audio via AssemblyAI (STT).",
      "Generated structured transcripts for dashboard visualization and GPT-4o context integration.",
    ],
    tags: [
      "Next.js",
      "Tailwind CSS",
      "FastAPI",
      "Python",
      "Firebase",
      "Twilio",
      "Docker",
      "AssemblyAI",
      "OpenAI API",
    ],
    color: "#7c3aed",
    image: "/projects/crisislineai.png",
    liveHref: "",
    devpostHref: "https://devpost.com/software/crisisline-ai",
    sourceHref: "https://github.com/Ben2104/CrisisLineAI",
    award: "",
    stars: "",
  },
  {
    title: "Shape-Sign",
    subtitle: "",
    desc: "Shape-Sign is an interactive application that utilizes hand gesture recognition models to help users learn and engage with sign language.",
    bullets: [
      "Built an interactive frontend for sign-language learning activities using Next.js and Tailwind CSS.",
      "Integrated hand-gesture recognition ML models for real-time shape and sign matching.",
      "Achieved 98% detection accuracy for alphabet signs and 80% for phrase signs.",
    ],
    tags: ["Next.js", "React.js", "Tailwind CSS", "TensorFlow", "Python"],
    color: "#00d4ff",
    image: "/projects/shape&sign.png",
    liveHref: "https://shape-sign.vercel.app/",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/Shape-Sign",
    award: "Best Overall Award — BeachHacks 8.0",
    stars: "",
  },
  {
    title: "911 OPERATOR ASSISTANT",
    subtitle: "",
    desc: "A web application designed to assist 911 operators by providing real-time information and resources during emergency calls.",
    bullets: [
      "Collaborated in a team of three to design, build, and deploy a 911 operator co-pilot dashboard.",
      "Connected a Next.js 15 (App Router) frontend to a FastAPI backend for real-time incident data.",
      "Built an interactive incident map with the Google Maps JavaScript API; transcribed calls with Faster-Whisper and classified incidents with Google Gemini (Vertex AI).",
    ],
    tags: [
      "Next.js",
      "React.js",
      "Tailwind CSS",
      "FastAPI",
      "Python",
      "Google Maps API",
      "Google Gemini",
      "Twilio",
    ],
    color: "#7c3aed",
    image: "/projects/911_operator.png",
    liveHref: "",
    devpostHref: "https://devpost.com/software/911-operator-assistant",
    sourceHref: "https://github.com/Ben2104/911-Operator-Assistant",
    award: "Best Overall Award — Marina Hacks 5.0 (out of 40 projects)",
    stars: "",
  },
  {
    title: "QuizzRiff",
    subtitle: "",
    desc: "QuizRiff helps educators save time by automating personalized quiz creation and adding a competitive scoring system to keep students engaged in learning.",
    bullets: [
      "Automated personalized quiz generation to save educators time building assessments.",
      "Built a Flask application with SQLite storage for quizzes and student results.",
      "Added a competitive scoring system to keep students engaged.",
    ],
    tags: ["Python", "HTML", "CSS", "SQLite3", "Flask", "WolframAlpha API"],
    color: "#f97316",
    image: "/projects/quizzriff.png",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/QuizzRiff",
    award: "",
    stars: "",
  },
  {
    title: "The Bookstore",
    subtitle: "",
    desc: "The Bookstore project is a MERN stack web app with full CRUD functionality for managing books, authors, and collections efficiently.",
    bullets: [
      "Built full CRUD workflows for managing books, authors, and collections.",
      "Implemented a MERN stack architecture with MongoDB, Express, React, and Node.js.",
    ],
    tags: ["MongoDB", "Express.js", "React.js", "Node.js", "Tailwind CSS"],
    color: "#00d4ff",
    image: "/projects/Bookstore.png",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/BookStore",
    award: "",
    stars: "",
  },
  {
    title: "LLM Chatbot",
    subtitle: "",
    desc: "LLM Chatbot is an AI-powered chatbot that uses large language models to engage in natural language conversations with users.",
    bullets: [
      "Built a React frontend and Node/Express backend for natural-language chat.",
      "Integrated the OpenAI API to power conversational responses.",
    ],
    tags: [
      "React",
      "Tailwind CSS",
      "Vite",
      "Node.js",
      "Express",
      "OpenAI API",
      "Multer",
    ],
    color: "#7c3aed",
    image: "/projects/chatbot.png",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/Chat-Bot",
    award: "",
    stars: "",
  },
  {
    title: "Pickleball-Booking-Extension",
    subtitle: "",
    desc: "A Chrome Extension that automates court booking at iPickle Cerritos by instantly reserving available courts exactly 7 days in advance at 7:00 AM, streamlining a highly competitive process.",
    bullets: [
      "Automated court booking at iPickle Cerritos via a Chrome extension.",
      "Reserved available courts exactly 7 days in advance at 7:00 AM.",
    ],
    tags: ["JavaScript", "HTML", "CSS"],
    color: "#f97316",
    image: "/projects/pickleball.jpg",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/Pickleball-Booking-Extension",
    award: "",
    stars: "",
  },
  {
    title: "Pickleball Booking Automation (Playwright & GitHub Actions)",
    subtitle: "",
    desc: "Automates court booking at iPickle Cerritos using Playwright for browser automation, scheduled via Cron-Jobs.org and executed as a GitHub Action.",
    bullets: [
      "Automated browser interactions using Playwright for court reservations.",
      "Scheduled recurring runs with Cron-Jobs.org, executed via GitHub Actions.",
    ],
    tags: ["JavaScript", "Playwright", "GitHub Actions", "Cron-Jobs.org"],
    color: "#00d4ff",
    image: "/projects/pickleball_bot.png",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/pickleball-bot",
    award: "",
    stars: "",
  },
] as const;
```

- [ ] **Step 2: Rework `ProjectCard` in `src/components/portfolio/projects.tsx`**

Replace the whole `ProjectCard` function with:
```tsx
function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/12 bg-[#222222] transition-all duration-300 hover:border-white/25 hover:shadow-[0_8px_32px_rgba(255,145,66,0.08)]"
    >
      {project.award ? (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-(--portfolio-accent)/60 bg-black/70 px-3 py-1 font-satoshi text-[10px] font-bold uppercase tracking-[0.06em] text-(--portfolio-accent)">
          🏆 {project.award}
        </span>
      ) : null}

      {/* Image preview */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#111]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="font-clash m-0 text-[18px] font-bold leading-tight text-white">
          {project.title}
        </h3>

        <p className="font-satoshi mb-0 mt-2 text-[13px] leading-[1.65] text-white/70">
          {project.desc}
        </p>

        {project.bullets.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {project.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                <span className="font-satoshi text-[12px] leading-[1.55] text-white/65">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/10 bg-white/8 px-2.5 py-1 font-satoshi text-[10px] font-medium text-white/75"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
          <a
            href={project.sourceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-satoshi text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white"
          >
            <Github size={13} />
            Code
          </a>
          {project.liveHref ? (
            <a
              href={project.liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-satoshi text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white"
            >
              <ExternalLink size={13} />
              Live
            </a>
          ) : null}
          {project.devpostHref ? (
            <a
              href={project.devpostHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-satoshi text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white"
            >
              <ExternalLink size={13} />
              Devpost
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
```

The hover-overlay `<div>` with the old absolutely-positioned live/GitHub icon buttons (previously inside the image container) is removed — replaced by the always-visible footer link row above, which is more accessible (no hover-only reveal) and works on touch devices.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Visual check**

Run: `npm run dev`, scroll to Projects. Confirm: 911 Operator Assistant and Shape-Sign both show a trophy award badge in the top-left of their image; every card shows 2–3 bullets under the summary; footer row shows Code always, Live/Devpost only when present (CrisisLineAI shows Code + Devpost, no Live; Shape-Sign shows Code + Live).

- [ ] **Step 5: Commit**

```bash
git add src/data/portfolio.ts src/components/portfolio/projects.tsx
git commit -m "expand project cards with bullets, devpost links, and award ribbons"
```

---

### Task 4: Skills restructure (7 categories, icon-filtered orb)

**Files:**
- Modify: `src/data/portfolio.ts` (replace `skillCategories`, delete `allBadges`)
- Modify: `src/components/portfolio/skills.tsx` (`flattenSkills` filter)

**Interfaces:**
- Produces: `skillCategories` — every skill object has `name: string, level: number, icon: string` (empty string `""` when no PNG asset exists — uniform shape, no optional keys, so the array stays a single object type).

- [ ] **Step 1: Replace `skillCategories` and delete `allBadges` in `src/data/portfolio.ts`**

Replace the whole `skillCategories` and `allBadges` blocks with:
```ts
export const skillCategories = [
  {
    label: "Frontend",
    color: "#00d4ff",
    skills: [
      { name: "React.js", level: 98, icon: "/assets/reactjs.png" },
      { name: "Next.js", level: 92, icon: "/assets/nextjs.png" },
      { name: "TypeScript", level: 95, icon: "/assets/typescript.png" },
      { name: "JavaScript", level: 96, icon: "" },
      { name: "HTML", level: 96, icon: "" },
      { name: "CSS", level: 94, icon: "" },
      { name: "Tailwind CSS", level: 96, icon: "/assets/tailwindcss.png" },
    ],
  },
  {
    label: "Backend",
    color: "#7c3aed",
    skills: [
      { name: "Node.js", level: 75, icon: "/assets/nodejs.png" },
      { name: "Express.js", level: 78, icon: "" },
      { name: "FastAPI", level: 84, icon: "/assets/fastapi.png" },
      { name: "REST APIs", level: 88, icon: "/assets/restapi.png" },
      { name: "GraphQL", level: 65, icon: "" },
      { name: "Webhooks", level: 72, icon: "" },
      { name: "WebSocket", level: 74, icon: "" },
    ],
  },
  {
    label: "AI / Automation",
    color: "#f97316",
    skills: [
      { name: "OpenAI API", level: 88, icon: "" },
      { name: "AssemblyAI", level: 70, icon: "" },
      { name: "TensorFlow", level: 68, icon: "" },
      { name: "Playwright", level: 80, icon: "" },
      { name: "GitHub Actions", level: 92, icon: "" },
    ],
  },
  {
    label: "Databases",
    color: "#00d4ff",
    skills: [
      { name: "MongoDB", level: 70, icon: "/assets/mongodb.png" },
      { name: "Firebase", level: 74, icon: "" },
      { name: "SQLite", level: 76, icon: "" },
    ],
  },
  {
    label: "DevOps & Tools",
    color: "#7c3aed",
    skills: [
      { name: "Docker", level: 75, icon: "/assets/docker.png" },
      { name: "Git", level: 90, icon: "" },
      { name: "GitHub", level: 90, icon: "/assets/github.png" },
      { name: "GitHub Actions", level: 92, icon: "/assets/githubaction.png" },
      { name: "Linux", level: 82, icon: "" },
      { name: "Bash", level: 78, icon: "" },
      { name: "CI/CD", level: 80, icon: "" },
    ],
  },
  {
    label: "Languages",
    color: "#f97316",
    skills: [
      { name: "Python", level: 80, icon: "/assets/python.png" },
      { name: "JavaScript", level: 96, icon: "" },
      { name: "TypeScript", level: 95, icon: "" },
      { name: "Java", level: 70, icon: "" },
      { name: "C/C++", level: 75, icon: "" },
      { name: "SQL", level: 78, icon: "" },
      { name: "C#", level: 65, icon: "" },
    ],
  },
  {
    label: "Teaching & Collaboration",
    color: "#00d4ff",
    skills: [
      { name: "Code Review", level: 85, icon: "" },
      { name: "Grading", level: 90, icon: "" },
      { name: "Tutoring", level: 88, icon: "" },
      { name: "Project Planning", level: 84, icon: "" },
      { name: "Technical Communication", level: 86, icon: "" },
      { name: "Literature Research", level: 80, icon: "" },
    ],
  },
] as const;
```

(`allBadges` is deleted entirely — confirmed zero references anywhere outside `portfolio.ts`.)

- [ ] **Step 2: Filter `flattenSkills` in `src/components/portfolio/skills.tsx`**

Replace:
```ts
function flattenSkills(): OrbSkill[] {
  const out: OrbSkill[] = [];
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      out.push({
        name: skill.name,
        level: skill.level,
        color: cat.color,
        category: cat.label,
        icon: skill.icon,
      });
    }
  }
  return out;
}
```
With:
```ts
function flattenSkills(): OrbSkill[] {
  const out: OrbSkill[] = [];
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      if (!skill.icon) continue;
      out.push({
        name: skill.name,
        level: skill.level,
        color: cat.color,
        category: cat.label,
        icon: skill.icon,
      });
    }
  }
  return out;
}
```

Note: because every skill object now always has an `icon` key (possibly `""`), `cat.skills` stays a single uniform object type — no TypeScript union-type issues from optional keys. The legend rendering (`skillCategories.map(...)`) needs no changes; it already renders every skill in every category regardless of icon presence.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Visual check**

Run: `npm run dev`, scroll to Skills. Confirm: the 3D orb still renders and rotates with the same icon-backed skills as before (React, Next.js, TypeScript, Tailwind, Node.js, FastAPI, REST APIs, MongoDB, Docker, GitHub, GitHub Actions, Python) — no blank/broken bubbles. Confirm the legend cards on the right now show all 7 categories, including "Languages" and "Teaching & Collaboration" with no icons, just text pills.

- [ ] **Step 5: Commit**

```bash
git add src/data/portfolio.ts src/components/portfolio/skills.tsx
git commit -m "restructure skills into 7 resume-driven categories"
```

---

### Task 5: Education section (new)

**Files:**
- Modify: `src/data/portfolio.ts` (add `education`)
- Create: `src/components/portfolio/education.tsx`
- Modify: `src/components/portfolio/portfolio-page.tsx` (insert `<Education />` after `<Skills />`)

**Interfaces:**
- Produces: `education` — `readonly { school: string, degree: string, period: string, location: string, activities: readonly string[] }[]`.

- [ ] **Step 1: Add `education` to `src/data/portfolio.ts`**

Add near the end of the file, after `socials`:
```ts
export const education = [
  {
    school: "California State University, Long Beach",
    degree: "B.S. Computer Science",
    period: "Expected Dec 2026",
    location: "Long Beach, CA",
    activities: ["AI Club at CSULB", "ACM at CSULB"],
  },
] as const;
```

- [ ] **Step 2: Create `src/components/portfolio/education.tsx`**

```tsx
"use client";

import { motion } from "motion/react";

import { education } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Education() {
  return (
    <section id="education" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="Education" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Education
        </h2>

        <div className="mt-10 space-y-5">
          {education.map((entry) => (
            <motion.article
              key={entry.school}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-clash m-0 text-[24px] font-bold leading-[1.2] text-(--portfolio-text)">
                    {entry.school}
                  </h3>
                  <p className="font-satoshi mb-0 mt-2 text-[15px] leading-[1.55] text-(--portfolio-muted)">
                    {entry.degree} · {entry.location}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-(--portfolio-accent)/50 bg-(--portfolio-accent)/10 px-4 py-1.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.08em] text-(--portfolio-accent)">
                  {entry.period}
                </span>
              </div>

              {entry.activities.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {entry.activities.map((activity) => (
                    <span
                      key={activity}
                      className="rounded-full border border-white/16 px-3 py-1.5 font-satoshi text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into `src/components/portfolio/portfolio-page.tsx`**

Add the import:
```tsx
import { Education } from "./education";
```
Replace:
```tsx
      <Skills />
      <Contact />
```
With:
```tsx
      <Skills />
      <Education />
      <Contact />
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, click "Education" in nav — confirm scroll lands on the new section showing CSULB, B.S. Computer Science, Expected Dec 2026, with AI Club/ACM activity pills.

- [ ] **Step 6: Commit**

```bash
git add src/data/portfolio.ts src/components/portfolio/education.tsx src/components/portfolio/portfolio-page.tsx
git commit -m "add education section"
```

---

### Task 6: Awards section (new)

**Files:**
- Modify: `src/data/portfolio.ts` (add `awards`)
- Create: `src/components/portfolio/awards.tsx`
- Modify: `src/components/portfolio/portfolio-page.tsx` (insert `<Awards />` after `<Education />`)

**Interfaces:**
- Produces: `awards` — `readonly { title: string, event: string, year: string, project: string }[]`.

- [ ] **Step 1: Add `awards` to `src/data/portfolio.ts`**

Add after `education`:
```ts
export const awards = [
  {
    title: "Best Overall Award (1st Place)",
    event: "BeachHacks 8.0",
    year: "2025",
    project: "Shape-Sign",
  },
  {
    title: "Best Overall Award (1st Place)",
    event: "Marina Hacks 5.0 at CSULB",
    year: "2025",
    project: "911 Operator Assistant",
  },
] as const;
```

- [ ] **Step 2: Create `src/components/portfolio/awards.tsx`**

```tsx
"use client";

import { motion } from "motion/react";
import { Trophy } from "lucide-react";

import { awards } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

export function Awards() {
  return (
    <section id="awards" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="Awards" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Awards
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {awards.map((award, index) => (
            <motion.article
              key={`${award.event}-${award.title}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--portfolio-accent)/12">
                <Trophy size={18} className="text-(--portfolio-accent)" />
              </span>
              <div>
                <h3 className="font-clash m-0 text-[20px] font-bold leading-[1.25] text-(--portfolio-text)">
                  {award.title}
                </h3>
                <p className="font-satoshi mb-0 mt-1.5 text-[14px] leading-[1.6] text-(--portfolio-muted)">
                  {award.event} · {award.year}
                </p>
                <p className="font-satoshi mb-0 mt-1 text-[13px] text-white/55">
                  for {award.project}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into `src/components/portfolio/portfolio-page.tsx`**

Add the import:
```tsx
import { Awards } from "./awards";
```
Replace:
```tsx
      <Education />
      <Contact />
```
With:
```tsx
      <Education />
      <Awards />
      <Contact />
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, click "Awards" in nav — confirm two award cards, each naming the specific project it was won for.

- [ ] **Step 6: Commit**

```bash
git add src/data/portfolio.ts src/components/portfolio/awards.tsx src/components/portfolio/portfolio-page.tsx
git commit -m "add awards section"
```

---

### Task 7: Hero rewrite + resume asset

**Files:**
- Modify: `src/data/portfolio.ts` (`profile.title` copy, add `profile.resumeHref`)
- Modify: `src/components/portfolio/hero.tsx` (5-button row)
- Create: `public/resume/Khoi_Do_Resume.pdf` (copy of `Khoi_Do_resume_v4.pdf`)

**Interfaces:**
- Produces: `profile.resumeHref: string` — consumed here and by Task 8 (Contact).

- [ ] **Step 1: Copy the resume PDF into `public/`**

```bash
mkdir -p public/resume
cp "/Users/kaydee/Desktop/CSULB Document/Resume/Khoi_Do_resume_v4.pdf" public/resume/Khoi_Do_Resume.pdf
```

- [ ] **Step 2: Update `profile` in `src/data/portfolio.ts`**

Replace:
```ts
export const profile = {
  initials: "KD",
  name: "Khoi Do",
  availability: "Available for work",
  title:
    "Crafting digital experiences where design meets engineering.",
  roles: ["Computer Science Student", "Software Engineer"],
  aboutHeading: "Building the future, one commit at a time.",
  aboutBody:
    "I'm a Computer Science Student with a passion for creating innovative solutions at the intersection of design and engineering. When I'm not coding, I contribute to open source and mentor other students on their journey.",
  contactHeading: "Let's build something extraordinary.",
  opportunityBlurb:
    "Currently exploring Software Engineer roles, and interesting OSS collaborations.",
  responseTime: "under 24 hours",
  email: "dohoangkhoi341@gmail.com",
};
```
With:
```ts
export const profile = {
  initials: "KD",
  name: "Khoi Do",
  availability: "Available for work",
  title:
    "Building full-stack, AI-powered applications with Next.js, FastAPI, Python, and modern cloud tooling — turning complex technical problems into useful, accessible products.",
  roles: ["Computer Science Student", "Software Engineer"],
  aboutHeading: "Engineering software. Teaching it too.",
  aboutBody: [
    "I'm a Computer Science student at California State University, Long Beach, where I transferred after starting at De Anza College. I focus on building full-stack applications that pair strong user experience with reliable backend systems — recent work spans AI-powered emergency response tools, real-time communication platforms, automation workflows, and technical dashboards.",
    "Alongside engineering, I have teaching and mentorship experience through instructional support roles at CSULB and De Anza, where I help students strengthen programming fundamentals, debugging habits, and problem-solving skills. I'm interested in software engineering roles where I can build practical products, learn from strong teams, and contribute across frontend, backend, and AI-enabled systems.",
  ],
  contactHeading: "Let's build something extraordinary.",
  contactBlurb:
    "Interested in software engineering opportunities, technical collaborations, or student-led projects? I'd be happy to connect.",
  opportunityBlurb:
    "Currently exploring Software Engineer roles, and interesting OSS collaborations.",
  responseTime: "under 24 hours",
  email: "dohoangkhoi341@gmail.com",
  resumeHref: "/resume/Khoi_Do_Resume.pdf",
};
```

- [ ] **Step 3: Update `src/components/portfolio/about.tsx` for the multi-paragraph `aboutBody`**

Replace:
```tsx
            <p className="font-satoshi mb-0 mt-7 max-w-160 text-[16px] leading-[1.75] text-(--portfolio-muted)">
              {profile.aboutBody}
            </p>
```
With:
```tsx
            <div className="mt-7 max-w-160 space-y-4">
              {profile.aboutBody.map((paragraph) => (
                <p
                  key={paragraph}
                  className="font-satoshi m-0 text-[16px] leading-[1.75] text-(--portfolio-muted)"
                >
                  {paragraph}
                </p>
              ))}
            </div>
```

- [ ] **Step 4: Update `src/components/portfolio/hero.tsx` button row**

Add `socials` to the import:
```tsx
import { profile, socials } from "@/data/portfolio";
```

Add `Github, Linkedin` to the lucide-react import (new import line, since hero.tsx currently imports no icons):
```tsx
import { Github, Linkedin } from "lucide-react";
```

Inside `export function Hero() {`, before the `return`, add:
```tsx
  const githubHref = socials.find((social) => social.icon === "github")?.href ?? "";
  const linkedinHref = socials.find((social) => social.icon === "linkedin")?.href ?? "";
```

Replace the button row:
```tsx
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
          >
            <button
              type="button"
              onClick={() => scrollToTarget("#projects")}
              className="rounded-full bg-(--portfolio-accent) px-9 py-4 font-satoshi text-[12px] font-bold uppercase tracking-[0.12em] text-(--portfolio-text) shadow-[0_20px_60px_rgba(255,145,66,0.25)] transition hover:brightness-105"
            >
              Explore Works
            </button>
            <button
              type="button"
              onClick={() => scrollToTarget("#contact")}
              className="rounded-full border border-white/28 bg-black/30 px-9 py-4 font-satoshi text-[12px] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/5"
            >
              Get In Touch
            </button>
          </motion.div>
```
With:
```tsx
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <button
              type="button"
              onClick={() => scrollToTarget("#projects")}
              className="rounded-full bg-(--portfolio-accent) px-8 py-3.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.12em] text-(--portfolio-text) shadow-[0_20px_60px_rgba(255,145,66,0.25)] transition hover:brightness-105"
            >
              View Projects
            </button>
            <a
              href={profile.resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/28 bg-black/30 px-8 py-3.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/5"
            >
              View Resume
            </a>
            {githubHref ? (
              <a
                href={githubHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/28 bg-black/30 px-8 py-3.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/5"
              >
                <Github size={14} />
                GitHub
              </a>
            ) : null}
            {linkedinHref ? (
              <a
                href={linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/28 bg-black/30 px-8 py-3.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/5"
              >
                <Linkedin size={14} />
                LinkedIn
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => scrollToTarget("#contact")}
              className="rounded-full border border-white/28 bg-black/30 px-8 py-3.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/5"
            >
              Contact Me
            </button>
          </motion.div>
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Visual check**

Run: `npm run dev`. Confirm: hero shows the new summary as the big heading, 5 buttons wrap cleanly on mobile width (375px) without overlapping, "View Resume" opens the PDF in a new tab, GitHub/LinkedIn buttons open the correct profiles. Confirm About section now shows 2 separate paragraphs with visible spacing between them.

- [ ] **Step 7: Commit**

```bash
git add src/data/portfolio.ts src/components/portfolio/hero.tsx src/components/portfolio/about.tsx public/resume/Khoi_Do_Resume.pdf
git commit -m "rewrite hero copy, add resume download, multi-paragraph about"
```

---

### Task 8: Contact section rework

**Files:**
- Modify: `src/components/portfolio/contact.tsx`

**Interfaces:**
- Consumes: `profile.contactBlurb`, `profile.resumeHref` (from Task 7).

- [ ] **Step 1: Add `Download` to the lucide-react import**

Replace:
```tsx
import { ArrowUpRight, CheckCircle, Github, Linkedin, Mail, Twitter } from "lucide-react";
```
With:
```tsx
import { ArrowUpRight, CheckCircle, Download, Github, Linkedin, Mail, Twitter } from "lucide-react";
```

- [ ] **Step 2: Replace the hardcoded tagline**

Replace:
```tsx
        <p className="font-satoshi mt-3 text-[17px] text-(--portfolio-subtle)">
          For any project, knock me.
        </p>
```
With:
```tsx
        <p className="font-satoshi mt-3 text-[17px] text-(--portfolio-subtle)">
          {profile.contactBlurb}
        </p>
```

- [ ] **Step 3: Make the email address the visually primary contact method, and add the resume button**

Replace:
```tsx
          <div className="space-y-6">
            <h3 className="font-clash m-0 text-[clamp(36px,5vw,64px)] font-bold leading-[1.04] text-(--portfolio-text)">
              Get in Touch With Me
            </h3>
            <p className="font-satoshi m-0 max-w-115t-[16px] leading-[1.75] text-(--portfolio-muted)">
              {profile.opportunityBlurb}
            </p>
            <p className="font-satoshi m-0 text-[14px] text-(--portfolio-muted)">
              Typical response time:{" "}
              <span className="font-semibold text-white">{profile.responseTime}</span>
            </p>
          </div>
```
With:
```tsx
          <div className="space-y-6">
            <h3 className="font-clash m-0 text-[clamp(36px,5vw,64px)] font-bold leading-[1.04] text-(--portfolio-text)">
              Get in Touch With Me
            </h3>
            <a
              href={`mailto:${profile.email}`}
              className="font-clash block text-[clamp(22px,3vw,32px)] font-bold text-(--portfolio-accent) underline decoration-2 underline-offset-4"
            >
              {profile.email}
            </a>
            <p className="font-satoshi m-0 max-w-115t-[16px] leading-[1.75] text-(--portfolio-muted)">
              {profile.opportunityBlurb}
            </p>
            <p className="font-satoshi m-0 text-[14px] text-(--portfolio-muted)">
              Typical response time:{" "}
              <span className="font-semibold text-white">{profile.responseTime}</span>
            </p>
            <a
              href={profile.resumeHref}
              download
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/28 bg-black/30 px-6 py-3 font-satoshi text-[12px] font-bold uppercase tracking-[0.11em] text-white/90 transition hover:bg-white/5"
            >
              <Download size={14} />
              Download Resume
            </a>
          </div>
```

- [ ] **Step 4: Clarify the form opens an email client**

Replace:
```tsx
                <button
                  type="submit"
                  className="w-fit rounded-full bg-(--portfolio-accent) px-7 py-2.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.11em] text-white"
                >
                  Send
                </button>
```
With:
```tsx
                <button
                  type="submit"
                  className="w-fit rounded-full bg-(--portfolio-accent) px-7 py-2.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.11em] text-white"
                >
                  Send via Email
                </button>
                <p className="font-satoshi m-0 text-[12px] text-white/45">
                  Opens a draft in your default email app.
                </p>
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Visual check**

Run: `npm run dev`, scroll to Contact. Confirm: new professional tagline replaces "For any project, knock me"; email address shown as a large accent-colored link near the top of the left column; "Download Resume" button present and opens the PDF; form's submit button reads "Send via Email" with helper text beneath it.

- [ ] **Step 7: Commit**

```bash
git add src/components/portfolio/contact.tsx
git commit -m "rework contact section copy, prominent email, resume download"
```

---

### Task 9: Navbar 9-item layout check

**Files:**
- Modify: `src/components/portfolio/navbar.tsx` (only if the visual check below finds overflow/crowding)

**Interfaces:**
- Consumes: `navLinks` (already 9 items as of Task 1) — no data change in this task.

- [ ] **Step 1: Visual check at desktop width**

Run: `npm run dev`, view at ≥1280px width. Look at the desktop nav row (`hidden items-center gap-8 md:flex`). With 9 labels + the "Contact" pill button, check whether items wrap to a second line or crowd against the logo/edge.

- [ ] **Step 2: If crowded, reduce gap and font tracking**

Only apply if Step 1 shows crowding. Replace:
```tsx
        <div className="hidden items-center gap-8 md:flex">
```
With:
```tsx
        <div className="hidden items-center gap-5 lg:gap-6 md:flex">
```
And replace:
```tsx
              className="font-satoshi text-[11px] font-semibold uppercase tracking-[0.11em] text-white/52 transition-colors hover:text-white"
```
With:
```tsx
              className="font-satoshi text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/52 transition-colors hover:text-white whitespace-nowrap"
```
(inside the `navLinks.map` button in the desktop nav block only — not the mobile menu block, which already stacks vertically and has room.)

- [ ] **Step 3: Verify mobile menu**

At 375px width, open the hamburger menu. Confirm all 9 links plus Contact are readable and tappable (≥44px touch target — the existing `py-*`/`gap-4` mobile menu styling already satisfies this, just confirm nothing got cut off).

- [ ] **Step 4: Type-check (only if Step 2 above edited the file)**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit (only if changes were made)**

```bash
git add src/components/portfolio/navbar.tsx
git commit -m "tighten desktop nav spacing for 9-item nav"
```

If no changes were needed (Step 1 showed no crowding), skip the commit — nothing to record.

---

### Task 10: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Install check**

Run: `npm install`
Expected: no changes (dependencies already satisfied), exits 0.

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds (this also re-runs TypeScript checks per Next.js's build process, per `AGENTS.md`).

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`. Walk through:
- Click every nav item (Home, About, Experience, Teaching, Projects, Skills, Education, Awards, Contact) — each scrolls to the correct section.
- Hero: all 5 buttons work (View Projects scrolls, View Resume opens PDF, GitHub/LinkedIn open the right profiles in new tabs, Contact Me scrolls).
- Experience: three sub-groups render with correct headings and content.
- Teaching: both roles render.
- Projects: award ribbons on 911 Operator Assistant and Shape-Sign; Code/Live/Devpost links present per project and all point to real URLs (spot check CrisisLineAI's Devpost link and 911 Operator Assistant's Devpost link — both new this pass).
- Skills: orb still rotates with icon-backed skills only; legend shows all 7 categories.
- Education and Awards sections render.
- Contact: new tagline, prominent email link, Download Resume button, "Send via Email" button + helper text.
- Resize to 375px width: confirm no horizontal scroll, nav hamburger menu works, project cards and experience cards stack in a single column without overflow.

- [ ] **Step 5: Final commit (only if any fixups were needed during the smoke test)**

```bash
git add -A
git commit -m "fix issues found during portfolio restructure smoke test"
```

If no fixups were needed, this step is a no-op — nothing to commit.
