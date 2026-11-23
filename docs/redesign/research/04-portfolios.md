# Portfolio research: top developer and design-engineer portfolios

Method: WebFetch on 12 named sites (rauno.me, emilkowal.ski, paco.me, brittanychiang.com, leerob.com, joshwcomeau.com, bruno-simon.com, cassie.codes, jhey.dev, aristidebenoist.com, dennissnellenberg.com, lynnandtonic.com), plus Awwwards freelance-portfolio collection and a 2026 awards roundup (hontran.dev). Visits were text-extraction summaries, NOT rendered screenshots, so fonts, sizes, colors, easing and scroll timing are UNVERIFIED for every site. rafaelbrando had no URL and was skipped. chrome-devtools-axi was not used.

## Per-site notes

| Site | Hero hook (text) | Structure | Projects | Warmth / personality | Recruiter vs visitor |
|---|---|---|---|---|---|
| rauno.me | Name + one-line bio, then manifesto "Make it fast. Make it beautiful. ... Make it." | Nav: Craft, Projects, Field Notes, archives, email (click-to-copy) | Separate /projects page; format unknown | Manifesto voice; short closing line | Recruiter: studio, projects, archive. Visitor: friendly but jargon ("interaction designer") |
| emilkowal.ski | Banner: animation course enrollment with a countdown; "Design Engineer" | Banner, header, intro, Projects, Writing, More | Short list (name + one-liner + link): Sonner, Vaul, animations.dev | Candid, conversational intro ("currently taking a break") | Recruiter: Linear/Vercel, OSS libs. Visitor: course CTA, but "toast/drawer" assume knowledge |
| paco.me | "Crafting interfaces." tagline, "Webmaster at Linear" | Intro, Building, Projects, Writing, Now, Connect | List: cmdK, Writer, next-themes | "Now" section, music playlists, "Pray at the altar of hard work." | Recruiter: design-system and craft signals. Visitor: personal "Now" and music |
| brittanychiang.com | "Frontend Engineer" + "I build accessible, pixel-perfect experiences for the web." | Hero, About, Experience (numbered timeline), Projects (cards), Writing, footer | Cards with tags and reach metrics (install/star counts); archive link | Friendly first person, Zelda reference, TARDIS "Click to time travel" | Recruiter: timeline, stack per role, resume. Visitor: personal About, humor |
| leerob.com | "I'm an engineer and writer." (no tagline) | Bio, Notes (topic list), Blogs (dated list) | No project section | Mission line ("make technology easy to understand"), family note | Recruiter: role history. Visitor: mission, approachable topic pages |
| joshwcomeau.com | Black Friday sale banner, then articles grid | Articles cards, categories, popular list, newsletter | None (long-form tutorials as the work) | Casual copy, "Disable sounds" toggle, playful checkbox line, self-deprecation | Recruiter: About, Contact, courses. Visitor: blog-first, teaching-led |
| bruno-simon.com | "Welcome! My name is Bruno Simon... creative developer" inside a 3D driving world | Not a scroll page: panels (Home, Options, Controls, Achievements, Circuit, Whispers, Behind the scene, Contact) | None listed in panels; work only via GitHub/devlogs | Strongest warmth: "And don't break anything!", "I'm stuck!" respawn, hidden secrets, honk key | Recruiter: needs the panels and source link. Visitor: plays first, reads second |
| cassie.codes | "Thanks for reading." (site-retirement note) | Minimal | None visible | Warm personal farewell | Little for either audience; a cautionary example of a stale site |
| jhey.dev | "Designer · Engineer · Tastemaker"; "making complex ideas approachable" | Intro, nav, Latest prototypes (numbered list), footer widgets | Plain list of prototype links, no descriptions | Playful footer widgets (weather, Spotify, Steam), "Wait, how did you do that?" | Recruiter: Shopify/Google/Vercel, talks. Visitor: list of named experiments |
| aristidebenoist.com | "Aristide Benoist, Independent developer" | Too sparse to verify | Not verifiable | Not verifiable | Not verifiable |
| dennissnellenberg.com | "Helping brands to stand out in the digital era." + multilingual greetings | Greetings, hero, Recent work, contact block, footer with local time | Linked cards: title, discipline, year; "More work (11)" | Multilingual "Hello / Bonjour / Ciao", live local time | Recruiter: discipline + year split. Visitor: plain hero, clear contact |
| lynnandtonic.com | "Lynn Fisher / Designer for the Web" | Menu only: About, Work, Thoughts, Archive, RSS, Gifs | Work page, format unknown | "v. XIX" version label, Gifs page | Minimal copy; the playful bits are the point |

## Awards and roundups (not visited directly)
- Awwwards freelance-portfolio collection lists SOTD and Developer Award winners (for example Guillaume Colombel, Isabel Moranta, Evan Fasquelle, Harry Atkins). Dates 2022 to 2024 on the listing page. Details of each site not verified.
- hontran.dev 2026 roundup describes By-Kin (Next.js, GSAP, Strapi, weighted smooth scroll, "confident editorial" type), Iventions (Three.js scene, projects as a guided walk-through, GSAP reveals), Mat Voyce (kinetic type driven by GSAP timelines), Uncommon Studio (GSAP "camera move" transitions), Minh Pham (GSAP over Three.js, 3D kept subordinate). These are descriptions from a third-party writer, not verified on-site.

## Patterns that recur in the strongest examples
1. Short, specific hook line in the hero (role + one concrete promise), not a generic "Hi, I'm".
2. Named tagline with a clear role (jhey, brittany, paco, emil).
3. Projects as a list or cards with one-line outcomes or metrics (brittany install counts; dennis discipline/year), with a separate archive for depth.
4. Long-form proof through writing, not only projects (paco, emil, josh).
5. A "Now" or current-status section that shows the person (paco, rauno).
6. One signature device carried through the whole site (manifesto for rauno, panels for bruno, multilingual greetings for dennis).
7. Playful micro-details that reward curiosity (footer widgets, sound toggle, easter eggs).
8. Clear contact path (copy-to-clipboard email, social links).
9. Timeline for experience with stack per role (brittany).
10. Pages split by intent: work, writing, about, archive.
11. Warm first-person voice, short sentences.
12. Motion used as a path (bruno driving, awwwards winners using GSAP camera moves) rather than decoration.
13. Accessibility framing when it is the person's strength (brittany "accessible").
14. Dark mode toggle and reduced-motion respect (josh, joshwcomeau theme toggle; reduced-motion not verified).

## Anti-patterns that make a site feel like a slide deck
1. Hero with only a name and no value statement (cassie, aristide, lynn).
2. Fixed sections with no narrative between them: a stack of cards with no sequence.
3. Projects with titles only, no outcome or role (jhey "prototypes" list, lynn "Work").
4. Dead or stale content (cassie's retirement note, emil's countdown banner).
5. Jargon-only copy ("toast", "drawer", "interaction designer") with no plain-language line for non-technical visitors.
6. Meta labels that read as UI leftovers ("DefaultLong", "XXXX", "mode", "0 0 1" in extracted text). Check your own site for these.
7. No personality outside the job title (lack of a "Now", a voice, or a single signature device).
8. Scroll with no pacing: everything visible at once, no reveal rhythm.

## Open questions and gaps (could not verify)
- Actual hero visuals, fonts, sizes, weights, colors, easing and scroll timing for every site above.
- Whether any of the sites respect prefers-reduced-motion.
- Performance (LCP, JS weight) of GSAP/Three.js sites.
- rafaelbrando: no URL provided.
- For real values, the next step is rendered screenshots (chrome-devtools) of hero and one scroll section on 3 to 4 sites: brittanychiang.com, bruno-simon.com, dennissnellenberg.com, and one Awwwards winner.
