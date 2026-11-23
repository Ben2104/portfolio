# Portfolio redesign — research brief (2026-11-22)

Sources: Canva deck "Black White Bold Creative Portfolio Presentation" (31 slides, read via Canva MCP),
live khoido.com audit, taste-skill (leonxlnx/taste-skill 2.5), jakubkrehel/skills (better-* rubric),
12 personal portfolios, 9 product-company sites. Raw notes: `research/01-05`. Slide stills: `canva/`.

## 1. What the Canva deck gets right (keep)
- Identity: black/charcoal ground, white condensed display type set huge, one orange accent, B&W studio portraits.
- Portrait standing *in front of* giant type (slide 1 "PORTFOLIO", slide 3 "INTRODUCTION") — strongest image in the deck.
- Real content: 7 roles with metrics, 2 schools, two skill groups, case-study template (problem → role → workflow → features → stack → team/links).

## 2. Why it reads as slides (fix)
- Every idea is a fixed 16:9 frame with one giant word as decoration ("TABLE OF CONTENTS", "THANK YOU").
- Navigation by page (TOC, "back to archive", sidebar per case study) instead of scroll + anchors.
- Experience = one slide per role (7 slides); orbit graphic repeats with no data.
- Case-study pages are empty templates ("PROJECT NAME", "DROP SCREENSHOT HERE") — the 10 real projects never shown.
- "KHOI.OS" desktop chrome around content = UI cosplay, not the work.

## 3. What the live site has today
- Dark #1a1a1a + orange #ff9142, Clash Display / Satoshi. Cyan + purple leak in (Skills, Experience) → no single system.
- Hero: generic line ("Crafting digital experiences…"), sleepy astronaut mascot, no proof or work above the fold.
- Projects: 3D book shelf (memorable, but 14.8k px tall, skeleton HTML, outcomes hidden behind OPEN).
- Skills with % levels (98%, 65%…) — recruiters distrust self-scored bars.
- Copy: "extraordinary", "one commit at a time" — stock lines.

## 4. Patterns from the best (portfolios + companies)
1. Hero = specific promise + one hard fact + one primary CTA (Linear, Brittany Chiang).
2. Person visible: real photo + name set large (Dennis Snellenberg — same move as Canva slide 1).
3. Proof near the top: numbers, awards, named employers.
4. Work shown as real product frames with one-line outcome, then an archive list for depth.
5. Rhythm: statement → work → proof → human → contact. Indexed labels ("01 / 04").
6. Warmth devices: first-person short sentences, a "Now" block, one playful detail (Brittany's Korok seeds, Bruno's car).
7. Plain-language line on every project so non-tech visitors get it.
8. Motion = one or two pinned/scrubbed moments, not fade-in on every block.

## 5. Rules to build against (taste-skill + jakub rubric, condensed)
- One section per screen (1–2 screens at 1440x900); equal left/right edges; no captions under images.
- Hero enters once on load; one or two scroll "moments" total; never fade-in every card; no scroll-jacking; reduced-motion = everything visible.
- Copy: h1 names what you do + for whom; buttons verb+object ("See the work", "Email Khoi"); ban "seamless / elevate / unlock / extraordinary / Learn more".
- Type: display line-height 1.1, body 16px+ at 1.5–1.6, measure 60–75ch, `text-wrap: balance` on headings; taste-skill bans Inter/Roboto/Poppins/Space Grotesk.
- Color: one neutral ramp + one accent (no violet per taste-skill); 4.5:1 body contrast.
- Motion tokens: hover 150ms in / 120ms out, press scale .96, ease `cubic-bezier(.2,.8,.2,1)`, no transition: all.
- Hit targets ≥ 44px off-text; visible :focus-visible; works at 320px and 200% zoom.

## 6. Proposed direction — "Editorial dark, one scroll story"
Keep Canva's identity, rebuild it as a website.

| # | Section | Idea | Moment |
|---|---|---|---|
| 1 | Hero | "KHOI DO" full-bleed condensed type, B&W portrait cut-out standing through it. Line: what I build + for whom. Fact: 2× Best Overall hackathons · CS @ CSULB '26. CTAs: See the work / Email me | Entrance: type rises, portrait settles (once) |
| 2 | Proof strip | 90% less manual drafting (DFM) · Lighthouse 58→94 (ACM) · 150+ students/term · 2 hackathon wins | — |
| 3 | Selected work (3–4) | Lobe, CrisisLineAI, 911 Operator Assistant, Shape-Sign: real screenshot in a browser frame, plain-English line, problem → what I built → result | Pinned: text sticky left, screens swap right as you scroll |
| 4 | Archive | Remaining 6 projects as a tight list (name, one line, stack, links) — or the 3D shelf as the archive | — |
| 5 | Experience | Vertical timeline, line fills with scroll; role, company, one outcome sentence each | Progress line (moment 2) |
| 6 | About / Now | B&W photo, short warm story, "Now": iOS app at Netsservice, biometric research lead, teaching | — |
| 7 | Skills | Grouped stack with real icons, no % bars | — |
| 8 | Contact | Giant "Let's talk" type, copy-email button, GitHub / LinkedIn / résumé | — |

Palette: near-black warm ground (#111 / #1a1a1a), off-white ink, one orange accent (~#ff8a3d), greys only.
Type: condensed display for headings (Canva look) + a clean text face (not Poppins/Inter).

## 7. Paste-ready prompt for Claude Design
> Design a one-page personal portfolio website (desktop 1440 + mobile 390) for Hoang Khoi Do, a CS student at CSULB (grad Dec 2026) and full-stack / AI engineer. It must feel like a professional product website, not a slide deck: continuous scroll, sections 1–2 screens tall, equal margins.
> Identity: near-black warm background, off-white text, a single orange accent (#ff8a3d), black-and-white studio portraits, huge condensed uppercase display type for headings, clean sans for body.
> Hero: "KHOI DO" set full-bleed in condensed type with a B&W portrait cut-out standing in front of the letters. Subline: "I build AI tools and web apps people actually use." Small fact line: "2× Best Overall hackathon winner · CS @ CSULB '26". Buttons: "See the work" (filled orange), "Email me" (outline). Small "Available for work" pill.
> Then: a proof strip of 4 numbers (90% less manual drafting at DFM Europe; Lighthouse 58→94 for ACM CSULB; 150+ students per term as instructional assistant; 2 hackathon Best Overall awards).
> Selected work: 4 featured projects (Lobe – shared 3D brain MRI study space, CalHacks; CrisisLineAI – voice AI crisis line with counselor takeover; 911 Operator Assistant – Best Overall Marina Hacks; Shape-Sign – sign-language learning with gesture recognition, Best Overall BeachHacks), each as a large browser-framed screenshot with a plain-English one-liner, then Problem / What I built / Result, stack chips, GitHub + Devpost links. Use a sticky layout: text pinned left, screenshots on the right.
> Project archive list (6 smaller projects). Experience as a vertical timeline (Netsservice full-stack dev, DFM Europe SWE intern, ACM webmaster, AI Club project manager, CSULB instructional assistant, De Anza TA). About + "Now" block with a candid B&W photo and three short warm sentences. Skills grouped (Frontend, Backend & AI, Data, DevOps) with real logos, no percentage bars. Contact: giant "LET'S TALK" with copy-email button and GitHub/LinkedIn.
> Avoid: table-of-contents pages, "Thank you" pages, fake OS/desktop chrome, placeholder text, violet, skill-level bars, fade-in on every block.
