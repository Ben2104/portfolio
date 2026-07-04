# Portfolio Restructure — Design Spec

Date: 2026-07-04
Status: Approved, ready for implementation planning

## Goal

Restructure khoido.com so experience is split into clear, recruiter-scannable
categories instead of one generic "Work History" list, refresh hero/about/contact
copy, expand skills/projects/education/awards content, and make the resume
downloadable. No framework change — this is a content and component-scope change
inside the existing Next.js app.

## Sources of truth (in priority order)

1. `Khoi_Do_resume_v4.docx` / `.pdf` (`/Users/kaydee/Desktop/CSULB Document/Resume/`) — extracted directly from the docx XML, not retyped from a paste, so bullet wording below is verbatim from the resume.
2. LinkedIn (`linkedin.com/in/hoang-khoi-do`) — direct `WebFetch` was blocked (HTTP 999, anti-scraping), so this was checked through the user's own logged-in Chrome session (profile, `/details/experience/`, `/details/education/`), and via the user's own public posts (Marina Hacks 5.0 win, BeachHacks 8.0 win, role-start announcements). Used to cross-check dates and to pull tech-stack detail the resume doesn't mention.
3. GitHub (`github.com/Ben2104`) — checked live via `gh` CLI (authenticated as the account owner): repo list, READMEs, and a code search inside `911-Operator-Assistant` to verify tag claims.
4. Current live site content (`src/data/portfolio.ts`) — used for anything not in the resume but already published.

Where resume and LinkedIn agreed, that's noted as double-confirmed. Where they conflicted, the resolution is called out explicitly below (see DFM Europe dates).

## Architecture

Single-page Next.js (App Router) app, one route (`src/app/page.tsx` → `PortfolioPage`).
All content is data-driven from `src/data/portfolio.ts`; components under
`src/components/portfolio/` just render arrays from that file. No routing changes,
no new framework, no new pages — this stays a one-pager with anchor-scroll nav.

## Navigation

`navLinks` becomes 9 items, in this order, all anchor links on the single page:

`Home (#hero) · About (#about) · Experience (#experience) · Teaching (#teaching) · Projects (#projects) · Skills (#skills) · Education (#education) · Awards (#awards) · Contact (#contact)`

## Experience restructure

Replaces the single flat `experiences` array and the "Work History" heading.

**`#experience` section** (component: `experience.tsx`, reworked) — one section, three
labeled sub-groups, each with its own `<h3>` sub-heading (no separate nav entries for
these three, since the 9-item nav above doesn't call them out individually):

1. **Professional Experience**
   - **Software Engineering Intern — DFM Europe** · Ho Chi Minh City, Vietnam · **Jun 2026 — Present** (present tense, ongoing). Resume said "May 2026 – Aug 2026"; LinkedIn's `/details/experience/` says "Jun 2026 - Present" with no end date. **Conflict resolved per user decision: use LinkedIn's dates** — treated as more recently updated / reflecting the actual confirmed start and that it hasn't ended.
     - Engineered a Python/FastAPI backend for the ATN Drawing system, automating the conversion of 3D engineering models into precise 2D technical drawings for construction industry applications.
     - Integrating the OpenAI API into the FastAPI service to intelligently scale 2D output, maximizing sketch paper utilization and improving drawing precision.
     - Developing an AI-powered isometric view generation feature using the OpenAI API, producing dimensionally accurate projections that optimize space usage on technical sketch sheets.
     - Tags: Python, FastAPI, OpenAI API, Technical Drawing Automation
   - **Webmaster — ACM at CSULB** · Long Beach, CA · **Jan 2026 — May 2026** (past tense; **double-confirmed** — resume and LinkedIn's `/details/experience/` both say "Jan 2026 – May 2026" exactly, replacing the live site's stale "Jan 2026 — Present")
     - Led the redesign and redevelopment of the ACM at CSULB landing page using Next.js, improving usability, responsiveness, and visual consistency across the site.
     - Refactored the existing Next.js codebase into a more modular, scalable architecture, reducing technical debt. (kept from current live site — resume dropped this bullet for space, not because it's false)
     - Designed and implemented new dashboard features enabling users to upload and manage images, integrating Next.js frontend components with backend APIs for seamless data handling.
     - Tags: Next.js, React.js, Tailwind CSS, Backend APIs

2. **Leadership & Research Experience**
   - **Project Manager — AI Club at CSULB** · Long Beach, CA · **Jun 2026 — Present**
     - Led planning and coordination for a faculty-mentored biometric sensor research project investigating heat, humidity, and alcohol sensors on human subjects, defining project scope, milestones, and team responsibilities.
     - Conducted literature research on wearable sensor technologies and physiological data collection, synthesizing findings to guide the team's technical direction and experimental design.
     - Tags: Biometric Sensors, Wearable Technology, Research Coordination

3. **Technical / Volunteer Experience**
   - **Computer Technical Support Volunteer — De Anza College** · Cupertino, CA · Dec 2023 — Jun 2024 (not in resume v4, but **LinkedIn `/details/experience/` confirms this exact role, dates, and bullet text verbatim** — no longer a loose end)
     - Installed and configured a wide range of hardware and software, ensuring optimal functionality and seamless integration for various computing environments.
     - Diagnosed and resolved technical issues related to hardware failures, software malfunctions, and network connectivity problems.
     - Refurbished and repaired broken and outdated laptops, restoring devices for distribution to underprivileged students.
     - Tags: Linux, Hardware Troubleshooting, System Setup

**`#teaching` section** (new component: `teaching.tsx`, own nav entry):

- **Instructional Student Assistant — California State University, Long Beach** · Long Beach, CA · **Aug 2025 — Present**
  - Graded Python assignments, labs, and exams on computer arithmetic and matrix computations, providing feedback on correctness, efficiency, and code quality while maintaining consistent rubrics.
  - Debugged student code and coached systematic problem decomposition, edge-case handling, and test-case design to improve assignment outcomes and confidence. (kept from current live site — resume trimmed to one bullet for space, not a contradiction)
  - Tags: Python, Computer Arithmetic, Matrix Computations, Grading Rubrics
- **Teaching Assistant — De Anza College** · Cupertino, CA · Sep 2023 — Jun 2024 (not in resume v4, but **LinkedIn confirms this role, dates, and bullet text verbatim** — no longer a loose end)
  - Assisted professors in planning and delivering instructional content for Beginning Programming Methodologies in C++.
  - Conducted review sessions, provided one-on-one tutoring, and facilitated group discussions.
  - Evaluated labs, assignments, quizzes, and exams, providing constructive feedback.
  - Tags: C++, Linux, Debugging

## Projects section

`ProjectCard` grows slightly: image → title → 1-line summary → 2–3 key bullets →
tag chips → footer link-icon row (GitHub always; Live and/or Devpost only when a
real URL exists) → award ribbon when applicable.

Data shape gains two optional fields: `bullets: string[]` and `devpostHref?: string`
(separated out from `liveHref`, which is reserved for an actual live demo). `award?: string`
already fits as a new optional field.

Featured first, in this order:

1. **CrisisLine AI** — Next.js, FastAPI, Firebase, Docker, Twilio, AssemblyAI, OpenAI API
   - Summary: Real-time crisis support platform connecting callers, AI agents, and counselors through synchronized web chat, voice-call orchestration, transcription, and dashboard context.
   - Bullets: real-time multi-party chat (Next.js + Firebase); FastAPI transcription service processing recorded call audio via AssemblyAI; structured transcripts for dashboard visualization + GPT-4o context integration; counselor takeover workflow.
   - GitHub: `github.com/Ben2104/CrisisLineAI` · Devpost: `devpost.com/software/crisisline-ai` (moved from the old `liveHref`)
2. **911 Operator Assistant** — Next.js, React, Tailwind CSS, FastAPI, Google Gemini (Vertex AI), Faster-Whisper, Google Maps API, Twilio
   - Summary: Emergency response dashboard helping 911 operators visualize incidents and improve situational awareness during calls.
   - Bullets: built by a team of three (Kien Pham, Sy Nguyen Nguyen, and the user — confirmed via the user's own LinkedIn win post); Next.js 15 (App Router) frontend connected to a FastAPI backend; transcribes calls with Faster-Whisper and classifies incidents with Google Gemini (Vertex AI); interactive incident map with Google Maps JavaScript API, 100% accurate location markers, 30% improvement in operator situational awareness (metrics are resume-stated, not invented).
   - Award: **Best Overall Award — Marina Hacks 5.0** (out of 40 projects per the resume; the user's LinkedIn post separately cites "80+ participants" — different unit, not a contradiction)
   - GitHub: `github.com/Ben2104/911-Operator-Assistant` · Devpost: `devpost.com/software/911-operator-assistant` (found in repo README and confirmed again in the user's LinkedIn win post)
   - Tag corrections from the old site data: dropped `Geoapify API` (zero hits searching the actual repo code — unconfirmed) and `Node.js` (no separate Node backend exists; FastAPI/Python is the only backend). Added `Google Gemini (Vertex AI)` and `Faster-Whisper` — confirmed independently by both the GitHub repo's `requirements.txt`/env vars (`GOOGLEGEM_API_KEY`, `torch`/`faster-whisper`) and the user's own LinkedIn post describing the tech stack.
3. **Shape-Sign** — Next.js, React, Tailwind CSS, TensorFlow, Python — unchanged from current site (GitHub description matches verbatim); live demo `shape-sign.vercel.app` confirmed still set as the repo homepage.
   - **New**: Award ribbon **Best Overall Award — BeachHacks 8.0**. The current site's Awards section only listed this award generically; the user's own LinkedIn post ("My team and I took home the Best Overall title at BeachHacks 8.0 with our project, Shape&Sign!") ties it specifically to this project, out of 200 participants / 42 projects (per teammate Sy Nguyen Nguyen's public post about the same shared project).
   - **New bullet** (from teammate's public post about the same project, safe to state as a project fact): achieved 98% detection accuracy for alphabet signs and 80% for phrase signs.
4. **QuizzRiff** — Python, HTML, CSS, SQLite3, Flask, WolframAlpha API — unchanged, GitHub description matches.
5. **The Bookstore** — MongoDB, Express.js, React.js, Node.js, Tailwind CSS — unchanged.
6. **LLM Chatbot** — React, Tailwind CSS, Vite, Node.js, Express, OpenAI API, Multer — unchanged.
7. **Pickleball Booking Extension** — JavaScript, HTML, CSS — unchanged.
8. **Pickleball Booking Automation** — JavaScript, Playwright, GitHub Actions, Cron-Jobs.org — unchanged.

## Skills section

Restructured into 7 categories per the resume's skill list:

- **Frontend**: React.js, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS
- **Backend**: Node.js, Express.js, FastAPI, REST APIs, GraphQL, Webhooks, WebSocket
- **AI / Automation**: OpenAI API, AssemblyAI, TensorFlow, Playwright, GitHub Actions
- **Databases**: MongoDB, Firebase, SQLite
- **DevOps & Tools**: Docker, Git, GitHub, GitHub Actions, Linux, Bash, CI/CD
- **Languages**: Python, JavaScript, TypeScript, Java, C/C++, SQL, C#
- **Teaching & Collaboration**: Code review, grading, tutoring, project planning, technical communication, literature research

Dropped entirely (no supporting project, repo, or resume evidence found):
`PostgreSQL`, `Supabase`, `Prisma`, `Figma`, standalone `WebSockets` badge.
`allBadges` export is dead code (confirmed zero references outside `portfolio.ts`) — deleted.

The existing 3D canvas orb sphere (`skills.tsx`) keeps drawing only the subset of
skills that have a real PNG icon in `public/assets/` (the current Frontend/Backend/
DevOps/Database icon set, minus the four dropped above). The text legend beside the
orb expands to show the full 7-category breakdown, including icon-less entries like
Languages and Teaching & Collaboration — the legend never needed icons, only colored
dots, so this requires no new icon assets.

## Education section (new)

New small component `education.tsx`, `#education`:

- California State University, Long Beach — B.S. Computer Science — Expected Dec 2026 — Long Beach, CA
- Activities line: AI Club at CSULB, ACM at CSULB

Note: LinkedIn's `/details/education/` lists this degree as "Bachelor of Engineering -
BE, Computer Science" (Aug 2024 – Dec 2026) rather than "B.S." — keeping the resume's
"B.S. Computer Science" wording since the resume is the higher-priority, more
deliberately-worded source for this. Flagging the discrepancy rather than silently
picking one; revisit if the user says LinkedIn's degree title is the correct one.

## Awards section (new)

New small component `awards.tsx`, `#awards`:

- Best Overall Award (1st Place) — BeachHacks 8.0 (2025) — for **Shape-Sign**
- Best Overall Award (1st Place) — Marina Hacks 5.0 at CSULB (2025) — for **911 Operator Assistant**

(Both confirmed verbatim from the resume's Honors & Awards section; the specific
project tie-in and "8.0" event number come from the user's own LinkedIn win posts,
which also corroborate the "(2025)" timing via relative post-age.)

## Hero

Buttons expand from 2 to 5: **View Projects**, **View Resume**, **GitHub**,
**LinkedIn**, **Contact Me**. Headline/summary rewritten close to the user-suggested
copy:

> Computer Science Student & Software Engineer
> Building full-stack, AI-powered applications with Next.js, FastAPI, Python, and
> modern cloud tooling — turning complex technical problems into useful, accessible
> products.

## About

`profile.aboutHeading` / `profile.aboutBody` replaced with the user-suggested
2-paragraph copy (lightly tightened), mentioning CSULB, full-stack + AI-assisted +
automation + teaching focus areas. One detail folded in from the user's own LinkedIn
About text ("I transferred from De Anza Community College"), since it's their own
stated words and gives the teaching/volunteer De Anza roles a coherent backstory.
Existing "pillars" cards (Clean Code / Full Stack / Performance) and the stats numbers
(`1.5+ Years`, `15+ Projects Shipped`) are left untouched — out of scope, not called
out in the request.

## Contact

Copy replaced with the user-suggested professional line ("Interested in software
engineering opportunities..."), replacing "For any project, knock me." Form stays
`mailto:`-based (user's explicit choice — no backend/API key work in scope), but
relabeled so it's clear it opens the user's email client, with the raw email address
made the visually primary contact method. Resume download button added.

## Resume file

`Khoi_Do_resume_v4.pdf` (already exists next to the docx) copied into
`public/resume/Khoi_Do_Resume.pdf` and linked from the Hero "View Resume" button and
the Contact section's download button.

## Data model changes (`src/data/portfolio.ts`)

- Replace `experiences` with `professionalExperience`, `leadershipExperience`,
  `volunteerExperience`, `teachingExperience` — same field shape as today
  (`role, company, period, location, color, description, highlights, tags`) to
  minimize component rewrite.
- Extend `projects` items with `bullets: string[]`, `devpostHref?: string`; keep
  `liveHref` for genuine live demos only.
- Restructure `skillCategories` into the 7 groups above; skill entries gain an
  optional `icon` (omitted where no asset exists).
- Add `education` and `awards` arrays.
- Delete `allBadges` (dead code).
- Add `resumeHref: "/resume/Khoi_Do_Resume.pdf"` to `profile`.
- Update `navLinks` to the 9-item structure above.

## Files touched

- `src/data/portfolio.ts` (data restructure)
- `src/components/portfolio/experience.tsx` (rework: 3 sub-groups)
- `src/components/portfolio/teaching.tsx` (new)
- `src/components/portfolio/education.tsx` (new)
- `src/components/portfolio/awards.tsx` (new)
- `src/components/portfolio/projects.tsx` (card layout: bullets, devpost link, award ribbon)
- `src/components/portfolio/skills.tsx` (orb filtered to icon-backed skills only; legend shows all 7 categories)
- `src/components/portfolio/hero.tsx` (5-button row, new copy)
- `src/components/portfolio/about.tsx` (new copy only)
- `src/components/portfolio/contact.tsx` (new copy, resume button, mailto relabel)
- `src/components/portfolio/navbar.tsx` (handles longer nav list — verify wrap/overflow behavior at 9 items)
- `src/components/portfolio/portfolio-page.tsx` (insert Teaching, Education, Awards into render order)
- `public/resume/Khoi_Do_Resume.pdf` (new asset)

## Verification plan

No `lint` or `typecheck` npm script exists today (`package.json` only has
`dev`/`build`/`start`), and there's no eslint config file despite the
`eslint-config-next` dependency being present. `AGENTS.md` (this repo's own
contributor doc) confirms the actual check flow is `npx tsc --noEmit` plus
`npm run build` (which runs TypeScript checks as part of the Next.js build). Plan:

1. `npm install` (already up to date, sanity check only)
2. `npx tsc --noEmit`
3. `npm run build`
4. Manual smoke test via `npm run dev`: nav scroll to all 9 anchors, resume button
   downloads/opens the correct PDF, all external links (GitHub, LinkedIn, Devpost,
   live demos) open correctly, mobile viewport check (375px) for nav overflow and
   card wrapping.

## Known TODOs (to land as inline comments, not blockers)

- De Anza Teaching Assistant and De Anza Computer Technical Support Volunteer: not
  present in resume v4, but independently confirmed via the user's own LinkedIn
  `/details/experience/` page (exact dates and bullet text match). No action needed;
  noted here only because they won't show up if someone re-diffs against resume v4 alone.
- Degree title conflict (resume "B.S. Computer Science" vs LinkedIn "Bachelor of
  Engineering - BE, Computer Science") — resume wording kept, see Education section
  note above.
- DFM Europe date conflict (resume "May 2026 – Aug 2026" vs LinkedIn "Jun 2026 –
  Present") — resolved in favor of LinkedIn's dates per explicit user decision, see
  Professional Experience section above.

## Explicit assumptions

- "Today" for tense purposes is 2026-07-04, making the DFM Europe internship
  (Jun 2026 – Present per LinkedIn) currently in progress → present tense, per user decision.
- Contact form stays `mailto:`-based by user's explicit choice; no backend/email
  service integration is in scope for this change.
- Unverified skill badges (PostgreSQL, Supabase, Prisma, Figma, standalone
  WebSockets) are dropped rather than kept-with-TODO, per user's explicit choice.
- LinkedIn access in this pass was through the user's own logged-in Chrome session
  (their own profile) — not third-party scraping. Direct unauthenticated `WebFetch`
  to linkedin.com is blocked (HTTP 999) and was not retried further.
