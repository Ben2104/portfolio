# taste-skill digest (leonxlnx/taste-skill, skill "design-taste-frontend", tasteskill 2.5.x)

Source: https://github.com/leonxlnx/taste-skill, fetched via gh api from HEAD on 2026-11-22.
Coverage: SKILL.md read in full. references/gate.md, motion.md (key sections), layout-v4.md (sections 1, 2, 5), system.md (Type, Colour, Radius), copy.md (Five rules, Banned), copy-tells.md (intro), moments.md (Rules, still rule), effects-usage.md (Tech budget, Never), perf.md, photos.md (Never), and the headings of every other reference read. Script headers (gate, copy-lint, consistency) read. library/palettes.json and type.json parsed and summarised. NOT read line by line: sections.md (54 KB), sections-library.md (66 KB), photos.md, cards.md, effects-creative.md, effects-objects.md, icons.md, diagrams.md, backgrounds.md, scenes.md, copy-voice.md, copy-registers.md, copy-moves.md, and consistency.mjs (1 MB, mostly data). Treat those as headings-level only.

## 1. What the skill is

- A Claude skill (SKILL.md frontmatter name: design-taste-frontend) for building professional company sites "at the level of figma.com and x.ai". It says the plan, copy, layout, motion and checks come from fixed references, not taste.
- Triggers on: landing pages, company/product/SaaS/AI/developer-tool sites, and "when the user says a page looks generic, templated or AI-made". Works as static HTML/CSS or inside React, Next.js (static export: output 'export'), Vue, Svelte, Astro or Tailwind.
- Requires Node 22+ and Chrome/Edge/Chromium (ffmpeg optional). Checks run one headless Chrome at a time, in the foreground, with a 10 minute timeout.

## 2. Nine house rules (SKILL.md, verbatim where short)

1. No caption or description under any image, render or visual. Licence credits go in one footer line.
2. Every visual renders, never an empty ground, at 1440, 1024, 768 and 390.
3. One section per screen: the hero alone on the first screen; every section exactly one or two screens tall at 1440x900. Exception: a live photo-chapters section, three or four screens.
4. Equal left and right content edges.
5. Hover micro-animations: linked card lifts 2px, photo zooms 1.02-1.03 inside its frame, buttons step on hover and press on click, underlines draw, card loops cycle in 2.5-4 s. No tilt, carousels or timed tabs. Every hero enters once on load (data-enter); every page carries one dealt moment (two on a long page).
6. More and better real photographs where they fit; nicer backgrounds, heroes, layouts and fonts.
7. Real full-colour icons (a known product's real icon, never a drawn one); small diagram visuals in cards.
8. Big scenes and creative moments are part of the skill, but shader effects and scenes only where the trade has a technical subject (tech, AI, developer tools, gaming, fintech, hardware). Never on a local cafe, bakery, guesthouse or shop: those get photographs.
9. Addresses: street and district only; no house number, postcode, coordinates, register/VAT numbers or real-format phone; contacts on .example.

## 3. Business kind decides everything (section 1)

Written on <html data-type>, <meta name="page-type">, <meta name="site-kind">, optional <meta name="page-kind" content="place">.

| Brief | page type | site-kind | kind |
|---|---|---|---|
| App, SaaS, AI, developer tool, fintech, studio selling its own software | software | software | software |
| Game | software | gaming | gaming |
| Hardware / tech device | product | tech | tech |
| Other physical product or brand | product | other | product |
| People are hired: clinic, law, agency, creative studio, trade | service | other | service |
| People come to it: cafe, bar, bakery, shop, gym, guesthouse | place | other | place |

- Effects, scenes, loops, counts, CSS grounds and dark pages are tech only. Other kinds: photographs, flat colour, type, real icons, the hero entrance, one dealt moment, hover layer.
- Inference for this project (not stated by the skill): a personal developer portfolio does not map cleanly. Closest are "service" (people are hired) or "software" (developer tool/studio). Decide this before running the deal.

## 4. Workflow (section 4, the run)

0. Stack: static page copies assets into assets/ and starts from assets/starter.html. An existing project keeps its stack and copies the kit into public/assets.
1. Read the brief; write kind, what is sold, buyer, one main action, real material (logo, screens, photos, prices, address). Then arm the gate BEFORE any page exists:
   node <skill>/scripts/gate.mjs --start index.html --kind <kind> --category "<what is sold>" --primary "<main action>"
2. Write all copy first, under copy-voice.md (fact sheet, voice card) and copy.md rules. Invented facts only as a coined brand name (searched) and, for a place, hours/prices marked data-assumed.
3. Plan the page as screens: line 1 kind; line 2 the deal; one line per section (id, idea, picture, screens 1 or 2, which section holds a moment).
4. DEAL, never choose by taste (history files keep pages different):
   node <skill>/assets/layout/deal.mjs --type <page type> --has <photo,ui,film,object,setting> --history .taste-skill/layout-history.json
   node <skill>/scripts/start.mjs deal --page <kind> --trade <trade> --history .taste-skill/history.json
   node <skill>/scripts/start.mjs css --page <kind> --palette <id> --type <id> --radius soft --history .taste-skill/history.json
   node <skill>/scripts/start.mjs brand --page place --bg "#.." --ink "#.." --accent "#.." --type <id> --radius soft   (client's own colours)
   node <skill>/scripts/moments.mjs pick --page <kind> --count 1|2 --fits section,statement --photo --history .taste-skill/history.json
   Section-order lists per kind (nav, footer, close, rhythm, buttons, mark), e.g. software: nav-mega|nav-cards|nav-centre; footer-dark|footer-statement|footer-columns; close-type|close-word; dark-band|surface-pairs|space; solid|pill|tonal|arrow; wordmark|initial|arc|ring|stack|dots.
5. Build in starter.html: set <html lang data-type data-radius data-buttons data-motion>, metas, head block, nav; copy only the hero section from assets/layout/hero-<id>.html; every section is main > section with one .wrap, h2 first, --h: 1 or 2. Paste UI fragments from assets/ui/<name>/fragment.html and rewrite to the client's content. Run icons.mjs scan index.html --out assets/icons --colour last.
6. Check (each script one headless Chrome, serves the page over http on 127.0.0.1):
   node <skill>/scripts/copy-lint.mjs index.html --kind <kind>
   node <skill>/scripts/consistency.mjs index.html --widths 1440,1024,820,768,390 --rhythm-widths 1440,820,768,390 --profile <dir> --page <kind> --category "<what>" --primary "<action>"
   node <skill>/assets/layout/check.mjs --url index.html --profile <dir> --sizes 1440x900,1024x768,820x1180,768x1024,390x844 --shots shots/layout
   node <skill>/scripts/shoot.mjs --url index.html --w 1440 --out shots/1440.png --profile <dir>
   node <skill>/scripts/perf.mjs index.html --profile <dir>
   Then the gate: node <skill>/scripts/gate.mjs index.html — runs checker at 1440 and 390, walks at 320, runs copy-lint. Loop until last line is GATE: PASS or GATE: OPEN; three rounds max.
   Statuses: GATE: SETUP (arm first), GATE: ERROR / GATE: OFF (report and finish). GATE: DONE only when the user says stop: gate.mjs --done "<their words>".
   Waivers go in .taste-skill/waivers.json with a reason; never game a check. Never edit the kit's own files.
7. Report: GATE line first, waivers, open FAILs, kind, deal (palette and why, pairing, hero, grounds, effect, moments, scene), voice card, copy-lint WARNs, checker/layout/perf results, what could not be checked, assumed facts, photos and slots the client must supply.

Stop hook: SKILL.md frontmatter registers gate.mjs --hook claude on the agent's Stop event (timeout 600 s), so the gate runs when the agent finishes. Consequence for us: a page is held open until gate passes or the user says done.

## 5. Gate (references/gate.md)

- gate.mjs is "the finish gate: a build may not end while fixable FAILs remain". Subcommands: --start (arm), manual run (page or url, --root, --kind, --category, --primary), --hook claude|codex|antigravity, --done "<user words>", flags --quick, --profile, --rounds 3, --new.
- Profile folder must be an OS temp dir or .taste-skill inside the project; relative paths leaving it are replaced with .taste-skill/chrome-gate.

## 6. Checklist (SKILL.md section 5, condensed)

- First screen: says what is sold, for whom or where, with one hard fact; hero fills it alone at every width; main button inside it.
- One section per screen: 1 or 2 screens; h2 first; no neighbour's heading or picture; no sparse or half-empty section.
- Equal edges: every block on the .wrap lines; no sideways scroll.
- Every visual draws at 1440, 1024, 768, 390.
- No caption explains a picture.
- Right things for the kind: no effect outside tech; the product big and whole in <=3 sections; no photo repeated.
- Motion: every button/link answers the pointer; nothing tilts; hero enters once; card loops 2.5-4 s; nothing moves on scroll except a dealt moment in its own section (and the tech big scene); anything moving past 5 s has a pause button; reduced motion rests everything; at most four live WebGL contexts.
- Contacts as rule 9.
- Keyboard and head: named controls, alt text, skip link first, lang/title/description/og tags.
- One system: one button pair, one card style, one radius scale, one link look; boxes nested at most two deep; one heading scale; text contrast.
- Copy: headings name things; buttons a verb and object; at most two hero actions; no slop words.
- Fast: no FAIL in perf.mjs.
- 820, 768, 390, 320: sections stack; tap targets 44px; one column at 390; full-width buttons; full-screen menu.
- Eyes: beside figma.com/x.ai it reads as a professional company site.

## 7. Layout, sections, type, system (key rules)

- Layout (layout-v4.md): one section per screen; section box height calc(var(--h,1) * 100svh), padded; never min-height alone, never dvh, never a third screen. Judge tile = screen at scrollY = k x H. Study cited in the file: 327 sites; hero alone on the first screen on 78% of company sites.
- Hero: eleven hero variants in layout-v4.md; place hero is separate. Dealt by deal.mjs.
- Equal edges on the grid (wrap x 120 to 1320 on a 1440 canvas per sections.md).
- Type (system.md, layout-v4 section 5): dealt pairing only, from library/type.json; one family, or display plus text; at most four font files. Banned: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Space Grotesk, Plus Jakarta Sans, system look. Headline weight 400 on product/service/place, 500 on tech. Text 400 and 500 only; labels 13px at 500; sentence case; no tracked caps; body text >=16px, line-height 1.5-1.8; muted text >=4.5:1; nothing under 13px; lines <=62 characters.
- Colour: interface 90-95% neutral; one near-black ink (often warm, never #000); one accent at most, from the client; grounds from three tokens (--g-main, --g-alt, --g-dark); no scrim or gradient over photographs; never violet or lavender (hue-based ban).
- Buttons (system.md): 44px high (48 on a place); data-buttons = solid|pill|tonal|arrow|block; exactly one filled button marks the main action; never slanted, gradient, ghost, or shadowed.
- Radius: data-radius sharp 4/6/8, soft 8/12/20 (default), round 10/16/24.
- Nav/footer/close: named variants (nav-mega, nav-cards, nav-centre, nav-split; footer-columns, footer-dark, footer-visit, footer-statement; close-type, close-photo, close-word).

## 8. Motion (motion.md)

- Three layers only: (1) hero entrance once on load, ~1.1 s; (2) one dealt moment in its own section (two on pages of eight+ sections), (3) hover/press layer on links, buttons, cards, photos.
- Hero entrance: h1 rises line by line out of word masks (700 ms each, lines 80 ms apart, at most 240 ms between first and last); lead and buttons fade up 12 px, 520 ms each, 60 ms apart; photo settles 1.05 to 1 over 1.1 s; overall ~1.1 s; transform, scale, opacity only; once per visit.
- Tokens: --m-in 150ms, --m-out 120ms, --m-press 90ms, --m-panel 200ms, --m-close 120ms, --m-slide 240ms, --m-image 600ms (out 400ms), --m-cycle 3.2s. Tech loops: --m-roll 700ms, --m-count 1000ms, --m-level .6s, --m-bob 3.2s.
- Curves: --ease cubic-bezier(.2,.8,.2,1) for UI; --m-ease-enter cubic-bezier(.22,1,.36,1) for entrances; --m-ease-io cubic-bezier(.65,0,.35,1) for travel. No bounce or overshoot. Animate transform/scale/opacity only.
- Hover (fine pointer only): button fill steps 14% toward ink, box lifts 1px (2px on btn--xl), press sinks 1px and scales .985; arrow moves 3px right; links draw an underline left to right.
- Scroll: nothing animates on scroll outside the dealt moment's section. No card reveals, parallax, scroll-snap, progress bars, or smooth-scroll libraries (Lenis, Locomotive, Scroll-based). Moments are scrubbed to scrollbar, use native animation-timeline or a passive scroll read, or GSAP ScrollTrigger (tech only).
- Never: card reveal on scroll, parallax on text, scroll-jacking, tilting/magnetic cards, carousels, auto-advancing sliders, timed tabs, logo marquee, random blinking, glitter, flicker.
- Reduced motion: everything rests; no hidden content.

## 9. Copy (copy.md, copy-tells.md, copy-voice.md)

- Five rules (copy.md): (1) h1 names the category and, for an unknown brand, the buyer or place, 2-8 words; (2) first screen holds one hard fact (number, place, price, date); (3) every heading has a noun naming a thing; at most one brand line per page, never the h1; (4) buttons are a verb plus what the visitor gets, 1-5 words; banned "Learn more", "Read more", "Discover", "Explore", "More", "Click here"; (5) few actions, each with one wording, at most 2 in the hero, 10 distinct labels per page.
- Banned (copy.md): metaphors and "where X meets Y", slogans in hero, questions as headlines, exclamation marks, all-caps labels, invented capitalised concepts, jokes in labels, mood paragraphs, full-screen literary quotes, filler words (seamless, effortless, cutting-edge, unlock, elevate, supercharge, reimagine, game-changing, powerful, robust), virtue words about the client (honest, calm, quiet, simply), puns in footer.
- copy-tells.md: ban-words list (delve, tapestry, realm, embark, beacon, multifaceted, paradigm, plethora, meticulous, intricate, interplay, garner, boasts, elevate, unlock...). Severity: ban / cap / context. Clusters and repetition are the signal; one tell proves little.
- copy-voice.md: fact sheet from brief -> voice card on the plan -> page shape from readers' questions -> draft -> device budget per page -> read aloud check.
- copy-registers.md: 12 registers (facts only, technical/dry, founder's letter, playful, literary, proper nouns, sensory, historical scene, activist, refusal, product-as-hero, hurried) plus a trade-to-register starting point list.

## 10. Moments, scenes, effects, photos (what suits a developer portfolio)

- Moments (moments.md): award-site style one-off sections, dealt by moments.mjs pick. Rules: scroll moments scrubbed to scrollbar inside their own 1-2 screen section; text readable without motion; a finished still for reduced motion and phones; no card enters on scroll; on non-tech pages only photo- or type-led moments (photographs that change in place, a photograph that develops (picture-develops), a statement that lights up (word-highlight), photo-chapters (3-4 screens), pinned-chapters).
- Scenes (scenes.md): big scene only on tech (its own height 1H or 2H; {"hold": 1}); 0-1 per page.
- Effects (effects-usage.md): on tech only, ONE effect per page: a shader ground in the hero or in the one [data-visual] frame, one WebGL part (fx-* button fill, glow, globe, avatar, dither object), or one object, or one big scene. Max four live WebGL contexts. Card grounds may use quiet grounds from the same family, drawn once. Never a shader on a place, product or service page; never a print or grain over a photograph.
- Creative parts (effects-creative.md): fx-feature-card, fx-dither-object, fx-map (still on place), fx-photo (photograph with copy, plain on product/service).
- Objects (effects-objects.md): dither objects and product renders (3D only when the brief asks for 3D).
- Cards (cards.md): two levels of nesting at most; card = panel + UI fragment on it; cards are "fragments on lit panels"; loops 2.5-4 s.
- Diagrams (diagrams.md): hub with branches, lanes, pulses; one cycle of 2.5-4 s; presets.json in assets/diagrams.
- Photos (photos.md): never a face as staff, guest or customer in stand-ins; no AI images; no Street View; no mood stock; credits in one footer line; stand-ins listed in the report; search via photos.mjs.
- Icons (icons.md): icons.mjs fetches real product icons in their own colours; never redrawn or tinted; violet rule.
- Perf (perf.md): image weight, WebGL contexts, layout shift budget checked by perf.mjs.

For a developer portfolio hero: the skill's pattern for tech/software is a dealt hero with the client's own UI as live HTML (app-frame), or a shader ground in the hero (one effect), or a big scene (tech only, one per page). A "service" kind would instead use a photograph hero and photo-led moments (photo-chapters or picture-develops), with no shader. Which fits depends on the kind decision in section 3.

## 11. Library: palettes.json and type.json

palettes.json: 64 palettes. Keys: id, name, tags, trades, bg, surface, ink, muted, accent, accentInk, optional fields (inverse blocks), note, seenIn.
- Tags: light-neutral 18, earth 13, mono-accent 11, dark-neutral 10, two-tone 9, flat-loud 9, photographic-neutral 7, single-field 8, pastel-fields 6.
- Trades covered (count of palettes tagged): agency 26, game 21, consumer-product 20, studio 17, retail 14, hardware 14, restaurant 13, fintech 11, cafe 11, ai 11, bakery 12, saas 10, devtool 9, wellness 9, workshop 8, hotel 9, law 7, wedding 7, clinic 6.
- Examples: white-link-blue (white ground, black ink, one blue accent #1a4be0 on the primary button and links only); cool-white-slate (#f7f9fa bg, #1f3038 ink, teal #0d7480 accent, used once per screen); rose-grey-green (#ebe5e3 ground, #2b2622 ink, green #0f7d45 accent on the current-page link and one footer button); paper-grey-brass; stone-blueprint.
- Rule from system.md: a palette is dealt by trade via start.mjs deal (three palettes made for the trade), never picked by taste.
- Note on fit: for a portfolio, relevant trades in the list are saas, devtool, ai, studio, agency, and the mono-accent / light-neutral tags.

type.json: 39 pairings. Keys: id, class (neo-grotesk etc.), kinds (tech/software/gaming/product/service with weights), moods, display (family, weights, tech weight, stretch, tracking, trackingXl, scale, letters axis), text, mono, suits. Counts by kind: product 30, service 29, software 23, tech 14, gaming 14.
- Examples: geist (Geist + Geist Mono; tech 3, software 3; for developer tools, AI, infrastructure, fintech: "exact, plain and fast"); host (Host Grotesk + JetBrains Mono); instrument (Instrument Sans + DM Mono); mona (Mona Sans + Geist Mono; hardware, platforms, games); hanken (Hanken Grotesk + DM Mono; clinics, law, advice); schibsted; plus serif options (fraunces, newsreader, source-serif, instrument-serif, garamond, literata, lora, besley, vollkorn) and others (onest, funnel, manrope, plex, sora, archivo, anybody, bricolage, red-hat, gabarito, chivo, outfit, epilogue, familjen, urbanist, reddit, suse, albert, figtree, work-sans, rethink, nunito).
- Fixed by the skill: Google Fonts link with display=swap; start.mjs types --page <kind> prints each pairing's link.

## 12. Things I could not verify or did not read

- The reference files marked headings-only above (sections.md, sections-library.md, photos.md, cards.md, effects-creative.md, effects-objects.md, icons.md, diagrams.md, backgrounds.md, scenes.md, copy-voice.md, copy-registers.md, copy-moves.md) were not read in full.
- Scripts start.mjs, moments.mjs, photos.mjs, icons.mjs, shoot.mjs, perf.mjs, effects.mjs and assets/layout/deal.mjs exist in the repo but were not read. Their flags are taken from SKILL.md and not verified against code.
- consistency.mjs is ~1 MB; only its header and usage were read.
- Not run. Nothing was installed or executed from the repo.
- Version: SKILL.md description says tasteskill 2.5.1; header says 2.5. CHANGELOG.md not read.
- The repo has an install.sh and a .github/workflows/check-skills.yml; not read.
