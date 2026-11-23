# Current site audit: https://www.khoido.com/ (captured 2026-11-22)

Method: curl of the server HTML, chrome-devtools-axi snapshot and eval, desktop screenshots per section (1200x800), one mobile screenshot (500px wide viewport), CSS bundle grep. Not run: Lighthouse, a full mobile section walkthrough, interaction testing of the projects shelf beyond the first book.

## Global
- Framework: Next.js (App Router, RSC payload, Turbopack chunks). 9 JS chunks, about 762 KB over the wire in total (curl compressed size). CSS bundle 56 KB.
- Fonts: Fontshare. Clash Display (weights 200-700) for headings, Satoshi (300-900) for body. display=swap. Monospace var is declared but not loaded.
- Palette (CSS vars): bg #1a1a1a, surface #131313, surface-soft #202020, text #fdfdfd, muted #a8a8a8, subtle #949494, line #323232, ACCENT #ff9142 (orange). Extra warm glows: #3a2118, #1c0e0a. Section accents in the Skills and Experience areas switch to cyan and purple, so the accent system is not single.
- Type scale (clamp): hero clamp(3.5rem, 5.5vw, 8rem); h2 clamp(2.5rem, 4.5vw, 5.5rem); body clamp(1rem, .9vw, 1.25rem); label clamp(.7rem, .6vw, .875rem). Labels are uppercase, tracking 0.12em, small pill chips.
- Global: html scroll-behavior smooth, scroll-padding-top 110px, body overflow-x hidden.
- Keyframes present: intro-enter, intro-failsafe, spin, pulse. Intro overlay "Loading portfolio" with a backdrop, plus an intro failsafe timer.
- Mobile check: scrollWidth 494 against innerWidth 500, so no real horizontal overflow seen.

## Sections, top to bottom (height from DOM at 1200px)
1. **Floating nav pill** (fixed, top center): astronaut-ish favicon logo button, then ABOUT, PROJECTS, SKILLS, EXPERIENCE, CONTACT with small line icons. Mobile: logo plus hamburger.
2. **Hero** (2029px tall, the tallest "normal" section): "AVAILABLE FOR WORK" pill, H1 "Crafting digital experiences where design meets engineering.", chips "COMPUTER SCIENCE STUDENT" and "SOFTWARE ENGINEER", and a sleepy astronaut mascot (eyes closed, "Z" bubbles) at right. Huge empty dark area above and below the copy in the desktop capture. Mobile: mascot above the text, H1 stacks to about 5 lines.
3. **About** (972px): "ABOUT ME" eyebrow, H2 "Building the future, one commit at a time.", a paragraph about being a CS student who contributes to open source and mentors students, CTA "VIEW PROJECTS" plus "CONTACT ME", GitHub (Ben2104) and LinkedIn links, portrait photo (responsive srcset, 256 to 3840 px).
4. **Experience** (3669px): timeline with a vertical line, alternating cards, date labels on the far side, icons on the spine (briefcase, people). Cards have a PROFESSIONAL or LEADERSHIP tag, bullets with metrics (for example 90% and 85% reductions, Lighthouse 58 to 94), and tag chips. Entries: Netsservice (Full Stack, Aug 2026 to present), AI Club (Project Manager), DFM Europe (SWE Intern), ACM (Webmaster), CSULB (Instructional Student Assistant), De Anza (volunteer and TA). Dense, text-heavy, and very long.
5. **Featured Work / My Projects Highlight** (14812px, the largest block): eyebrow "FEATURED WORK", H2 "My Projects Highlight". Below it, a 3D book shelf: a large blue "Lobe" book (Project 01, shared 3D brain MRI study space) with an orange "Project / 02" book behind it. Footer bar: "01 / 10", project title, subtitle, prev/next arrows, OPEN button, 10 progress ticks, hint "SCROLL · DRAG · ARROWS". The server HTML has no project data; the shelf shows animate-pulse skeleton placeholders until JS hydrates. Work details sit behind OPEN, so the first screen shows the cover but no outcome or stack.
6. **Skills / Technical Toolkit** (978px): eyebrow "SKILLS & TECH", H2 "Technical Toolkit", "Drag to explore". Left: a cluster of tech logos (Python, C++, Java, Linux, Docker, React, etc.) that is draggable. Right: 6 category cards (Frontend, Backend, AI/Automation, Databases, DevOps and Tools, Languages) with colored dots and chip lists in cyan, purple and orange.
7. **Education** (718px): two cards, CSULB (B.S. CS, expected Dec 2026, tags AI Club and ACM) and De Anza (2022-2024), with date pills.
8. **Contact** (1144px): H2 "Let's build something extraordinary.", a short paragraph about job and OSS collaboration, a block "Get in Touch With Me" that shows the email dohoangkhoi341@gmail.com in plain text, "Typical response time: under 24 hours", a form (Name, Email, Message, SEND MESSAGE) with the line "Sends your message directly to dohoangkhoi341@gmail.com". Footer: "Khoi Do", © 2026, and a line about Software Engineer roles.

## Interactions and animation (from source and DOM)
- Intro loader, pulse skeletons, scroll-linked book shelf (drag, arrows, progress ticks), draggable skill logo cloud, mascot reacts to click (aria label "Click to make it react", 20 or so webp expressions: look-*, blink, love, surprised, starstruck, blush, sleepy, dizzy, laugh).
- Transitions: 0.15s to 0.5s, cubic-bezier(.4,0,.2,1) and ease-out. Opacity transitions 1s on intro.
- CTA button glow: box-shadow 0 20px 60px rgba(255,145,66,.25).

## What works
- Dark, warm, premium base with a single orange accent. The Clash Display headline has real character.
- The mascot gives a non-technical visitor an emotional hook, and the click reaction is a good "alive" detail.
- The book shelf is a memorable metaphor for projects and is the strongest scroll moment.
- Clean chip and card system in Skills. Experience timeline with metric-led bullets reads well.
- Nav is a sticky pill that works on mobile through a hamburger.

## What feels weak or slide-like
- Sections are stacked blocks with an eyebrow, H2, paragraph and a grid. Little scroll storytelling; the sections read like a document, not a journey.
- Hero has too much dead vertical space, and no visual sample of work above the fold.
- Projects are hidden behind a skeleton and an OPEN click; no outcomes or stack on the shelf.
- Colour is not one system: orange accent, cyan and purple in Skills and Experience.
- Copy is generic ("Crafting digital experiences...", "one commit at a time", "extraordinary"). Few concrete outcomes in the hero or about.
- Mixed identity: GitHub handle Ben2104 against the name Khoi Do.
- Email shown in plain text twice. Response-time claim is unverifiable.
- Density: Experience has about 6 roles with long bullets, which is heavy for non-technical visitors.

## Mobile concerns
- Hero and nav work at 390px-class width. The H1 is large (5 lines). Not checked: projects shelf touch behaviour, skill logo drag on touch, long experience cards.

## Load and performance impressions (unverified numbers)
- Preloads for sparkle, favicon, and portrait srcset at launch. Mascot preloads several frames.
- About 38 image references, including many large webp expressions.
- 762 KB JS over the wire is moderate, but the projects shelf and 3D work add cost. No Lighthouse run, so no CWV numbers. Unverified.

## Unverified / not checked
- Lighthouse and Core Web Vitals.
- Full mobile walkthrough of the shelf and skills.
- Contact form submission behaviour.
- Exact project titles beyond "Lobe", "Project 02" (Material Enhancement Assistant, AI-powered course) and the counter of 10.
