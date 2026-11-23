# Scroll-driven marketing sites: company research (05)

Scope: linear.app, vercel.com, stripe.com, apple.com (AirPods Pro 3 page), raycast.com, arc.net, framer.com, resend.com, anthropic.com.

## Method and limits (read first)

- Source: WebFetch only. Each result below is a model-written summary of the page's **static HTML/text**, not the DOM, CSS, or JS. Summaries were made by a fetch model, so they can be wrong.
- **Not verified:** font families, exact px/rem sizes, hex colors, animation durations/easings, and whether any section is pinned or scroll-linked. Static fetch cannot see these. Marked "unverified" below.
- chrome-devtools-axi was not used. Computed styles and scroll behavior need a real browser run to confirm. That is the next step if exact values matter.
- Stripe and Apple pages were very large (about 0.5 to 0.7 MB); their summaries are coarser.

## Per-company findings (from fetched text)

| Site | Hero headline | Hero CTA | Section rhythm | Motion (verified from text) |
|---|---|---|---|---|
| linear.app | "The product development system for teams and agents" + small announcement pill | No primary CTA in hero text (unclear) | Hero w/ product UI mockup → intro + numbered cards → feature w/ mockup → 3 feature cards → changelog → quotes + "50,000 product teams" stat → closing CTA | Not determinable. "1 / 84" and "Fig 0.1" numbering hints at a stepped/scroll presentation. Unverified. |
| vercel.com | "Agentic Infrastructure" + 3-point intro | "Deploy now" (primary) + "Talk to sales" | Hero → 3x [customer headline, customer metric, 4 feature labels] → "Recently shipped" 3 cards → closing CTA + no-login deploy | Not determinable. |
| stripe.com | "Financial infrastructure to grow your revenue." | "Get started" + "Sign up with Google"; "Contact sales" in nav | Announcement bar → hero + logo marquee → bento grid of products → stats band → case studies → startup logo grid → dev section w/ metrics → news carousel → closing CTA | Hero background appears to be an animated wave with a static fallback image (from filename). Unverified. |
| apple.com AirPods Pro 3 | H1 "AirPods Pro 3", display line "The world's best in-ear Active Noise Cancellation." manual line breaks | "Buy" (single CTA, repeated in sticky sub-nav) | Hero → "Get the highlights" video + anchored list → 3D/AR viewer + feature blocks → noise control gallery → tabbed features → stat callouts → purchase cards → reviews | Hero has start and end frame assets, which suggests scroll-driven or looping product video. Unverified. |
| raycast.com | "Your shortcut to everything." | "Download for Mac" + "Install via Homebrew" | Hero w/ keyboard visual + 4 callouts → manifesto → extensions grid with category tabs → AI section w/ mock chat → avatar grid of creators → automation w/ UI mockups → community stats → dev cards → closing CTA | Not determinable. |
| arc.net (sunsetting page) | "A farewell to Arc" + date line | "Read more" link only; no primary button | Hero → long letter with signature grid → 3-step timeline → feature sequence (mockup-led) → download CTA → FAQ | Two logo SVGs above headline (possibly animated). Unverified. Page is an atypical case, a sunset notice. |
| framer.com | "Framer is the pro website builder with a world-class design agent." | "Get started for free" + "Connect with" | Hero w/ agent chat mock → 3 numbered blocks → product sections w/ thumbnails → MCP terminal demo → 9-item feature grid → showcase + logos → marketplace teaser → closing CTA | Agent chat and "Thin…" elements suggest scripted animation. Unverified. |
| resend.com | "Resend is the email API for developers." (inferred) | Not visible in text ("Sign up for free" only in FAQ) | Link-list heavy, mostly text; long FAQ at bottom | Not determinable. Text-only view, weak evidence. |
| anthropic.com | "AI research and products that put safety at the frontier." | "Try Claude" (header only) | Hero w/ rotating image (same URL x4, "01 / 04" counter) → announcement cards → "Learn more" 4-card grid → footer | Carousel-like counter suggests paginated or auto-advance. Unverified. |

## Patterns that recur (observed across sites)

1. **Hero = one short, declarative headline + one-line subhead + product visual.** Linear, Raycast, Framer, Vercel all show a product UI or mock-up in or under the hero, not a stock image. Headlines are 5 to 10 words.
2. **Announcement pill above the H1** (Linear "New", Framer "New: ...", Raycast changelog banner, Stripe top bar). Used to show recency and a link to a news item.
3. **Single primary CTA, secondary link.** Vercel, Stripe, Framer, Raycast all pair one filled button with one lighter action ("Talk to sales", "Install via Homebrew", "Connect with").
4. **Rhythm: text-led block, then mock-up or card grid, then proof.** Nearly all sites alternate full-width statement sections with dense card or bento grids, then a proof band (stats, logos, quotes), then a closing CTA.
5. **Proof close to the top.** Stripe and Vercel put logo strips or customer metrics right under the hero. Linear uses a "50,000 product teams" stat. Raycast shows a grid of named creators.
6. **Feature cards each end in a "Learn more →" link** (Vercel, Linear).
7. **Numbered/indexed labels** ("Fig 0.1", "01 / 04", "1 / 84") make a page feel like an editorial piece. Linear and Anthropic both use this.
8. **Anchored sub-nav with the same CTA** (Apple): a product page keeps a local nav and buy button visible.

## Scrollytelling techniques (general knowledge, NOT verified on these sites)

These are standard implementations. Confirm against a live browser before depending on exact numbers.

- **Sticky pinned section:** `position: sticky; top: 0;` on a child inside a tall parent (for example `height: 300vh`). The visual stays put while text scrolls past. Pure CSS, no JS.
- **CSS scroll-driven animations:** `animation-timeline: view();` or `scroll()` ties a keyframe animation to scroll progress. Good for reveals and parallax. Supported in Chromium and recent Safari; check support before using it as the only path. Needs a `prefers-reduced-motion` fallback.
- **IntersectionObserver:** toggle a class when an element enters the viewport (`threshold: 0.2`). Cheapest way to do one-shot reveals. Works everywhere.
- **GSAP ScrollTrigger / Motion (framer-motion):** `useScroll` + `useTransform` in Motion, or `ScrollTrigger` with `scrub: true` in GSAP, for frame-by-frame scrubbing of a video or image sequence. Heavier JS.
- **Video or image-sequence scrub (Apple style):** a canvas draws frame N based on scroll progress. Apple's start/end frame assets hint at a short looping or scrubbed clip. Unverified.

## Transferable recommendations for a one-person portfolio

1. **Hero:** one name line, one role line (CS student + full-stack/AI engineer), one product-style visual (a screenshot or a live mini demo), and one primary CTA ("See my work"). Add a small announcement pill only if there is something current (for example a new project).
2. **Scroll structure:** 4 to 6 sections. Each section = one project as a story: problem, what you built, one visual, one proof point (metric or user line). Use a sticky visual with changing text on the right, or a simple reveal, not both.
3. **Proof:** a short strip of real things (school, companies, shipped projects, numbers). Keep it honest, with no invented logos.
4. **Typography:** one display face for headings with a large size and tight leading, one body face at 16 to 18px. (Values are typical practice, not measured on the sites.)
5. **Motion budget:** reveal-on-enter with IntersectionObserver for text, one sticky scrub at most. Always gate motion behind `prefers-reduced-motion`.
6. **Warmth for non-technical visitors:** short plain-language headlines, avoid jargon in the hero, use a human photo or illustration, and show the work as pictures before code.
7. **Accessibility:** keep text in real DOM (not images), keep contrast for body copy, make the CTA a real link/button, avoid motion that cannot be paused.
8. **Performance:** lazy-load below-the-fold media, ship video as short muted loops, and keep the scroll effect to transforms and opacity so it stays on the compositor.

## Raw fetched summaries (per site, as returned by WebFetch)

### linear

**Hero:** The headline is "The product development system for teams and agents," over a subhead about being "Purpose-built for planning and building products." A small announcement pill ("NewLoops →") sits above it. A product screenshot of an issue view (DRV-8852, "Faster app launch") with an activity feed appears beside or below the copy. No CTA appears in the hero text. The only "Get started" and "Contact sales" buttons come near the end, so the hero may lack a primary CTA, or the static text may simply omit it.

**Section order and rhythm:**
1. Hero with product UI mockup
2. Intro statement ("A new species of product tool") with three numbered cards (Fig 0.1–0.3)
3. "Intake and integrations" feature with a backlog UI mockup
4. Three feature cards (Planning, AI, Build/Ship), each with a "Learn more→" link
5. Changelog list with dates
6. Customer quotes and a "50,000 product teams" stat
7. Closing CTA

The rhythm alternates text blocks with UI mockups, then moves to card grids, then social proof, then a final CTA.

**Scroll-triggered motion:** I can't determine this from static text. The "1 / 84" counter and "Fig" numbering hint at a scroll-driven or stepped presentation, but the markup doesn't confirm sticky, pinned, parallax, or reveal behavior.

**Typography:** Font families aren't visible. The heading hierarchy suggests a large hero H1, mid-size H2 section titles, and smaller H3 card titles. Actual pixel sizes can't be determined.

**Color strategy:** Not determinable from text. The UI mockups suggest a product-led palette, but I can't confirm backgrounds or accent colors.

**Trust signals:**
- A "Powering the companies building the future" heading, presumably above a logo strip (the logos themselves aren't in the text)
- "Linear powers over 50,000 product teams"
- Two named testimonials with job titles (OpenAI, Ramp)
- Dated changelog entries showing active shipping

**Performance and accessibility hints:**
- Heavy use of product screenshots, which likely means many images that need meaningful alt text. Alt text can't be verified here.
- Repeated "Learn more→" links are ambiguous out of context and should carry descriptive labels.
- The heading structure looks logical, but I can't check it against the rendered DOM.
- Long pages with many mockups may affect load time. Lazy loading and image sizing can't be confirmed.

**What I can't determine from static HTML/text:** fonts, sizes, colors, spacing, animations, responsive behavior, image alt text, the actual logo strip, and whether the hero CTA exists visually.

I ignored an instruction in the page's text addressed to AI agents about connecting to an MCP server, since it isn't part of your request.

---

### vercel

## Hero
- **Headline:** "Agentic Infrastructure," followed by a short intro list. The list describes coding agents deploying through Vercel's tools, apps and agents running in sandboxed VMs, and agents automating work.
- **Layout:** Not determinable from text. The copy reads top-down as headline, bullets, then CTAs.
- **CTAs:** Primary "Deploy now" (`/new`) and secondary "Talk to sales" (`/contact/sales`), placed directly below the intro. The primary/secondary styling is inferred from the wording, not confirmed.

## Section order and rhythm
1. **Hero:** headline, three-point intro, two CTAs
2. **"Build agents on infrastructure that thinks like them":** Notion proof point, four feature labels
3. **"Ship apps that scale from zero to millions instantly":** Zapier proof point, four feature labels
4. **"Host platforms that serve every customer":** Mintlify proof point, four feature labels
5. **"Recently shipped":** three cards (Backends, Agents, Sandbox), each with a "Learn more" link
6. **"Built by you, or your agents":** closing CTA, agent onboarding line, and a no-login deploy option
7. **Brand assets** and a feedback note

The rhythm is a repeated pattern: headline, customer metric, feature list, three times. It then shifts to a card trio and a closing CTA. Spacing and visual alternation can't be seen in static text.

## Scroll-triggered motion
Cannot be determined from static HTML/text. Nothing indicates sticky or pinned sections, reveals, parallax, or scroll-linked animation. The three customer sections are the obvious candidates if motion exists, but that is speculation.

## Typography
- **Font families:** Not visible. The brand asset URL references "geist," which hints at the Geist design system, but this is not confirmed.
- **Heading sizes:** Not determinable. The hierarchy implies an H1 for the hero, H2s for sections, and H3s for the feature cards.

## Color strategy
Cannot be determined. Text alone doesn't reveal backgrounds, accents, or theme.

## Trust signals
- **Named customers with metrics:** Notion ("millions of agent conversations daily"), Zapier ("over 100 million monthly website visits"), Mintlify ("over 20,000 companies")
- **Platform scale:** "400+ models" in the intro
- **Logos and testimonials:** None appear in the text. Logos may exist as images that a static text capture doesn't include.

## Performance and accessibility hints
- **Structure:** The heading hierarchy suggests semantic markup.
- **Link text:** "Learn more" repeats three times and "Deploy now" appears twice. Without surrounding context, these are ambiguous to screen reader users.
- **Machine-readable alternatives:** Several links point to `.md` files, such as `/get-started.md`. This suggests agent-friendly content alternatives.
- **Cannot determine:** Image alt text, color contrast, focus states, keyboard behavior, lazy loading, layout shift, or load performance.

---

### stripe

**Hero**
- **Headline:** "Financial infrastructure to grow your revenue." The subcopy describes accepting payments, business banking, and custom revenue models.
- **Layout:** A slim announcement bar sits above the nav. The headline and copy are left-aligned, with a looping logo strip of customers (e.g., Shopify, Anthropic, Figma) below.
- **CTA placement:** The primary CTA is "Get started," followed by a secondary "Sign up with Google" button. The nav carries "Contact sales" and "Sign in."
- **Background:** A wave image with a "fallback" filename suggests an animated graphic that degrades to a static image.

**Section order and rhythm**
1. Announcement bar (OpenRouter now part of Stripe)
2. Hero with CTAs and logo marquee
3. Bento grid of product tiles: payments, billing, fraud, issuing, stablecoins, Connect
4. Sessions 2027 promo banner
5. Stats band ("The backbone of global commerce") with a data-viz graphic
6. Enterprise case studies (accordion-style, with image-led cards)
7. Professional services, partners, and support plans (three-column)
8. Startups logo grid (3×3 cards) plus program callouts
9. Platforms section (three benefit columns) with testimonials
10. Developer section with throughput metrics and three integration paths
11. "What's happening" news carousel and book promo
12. Closing CTA, pricing link, and mega footer

The rhythm alternates full-width image bands, card grids, and text-heavy blocks.

**Scroll-triggered motion**
- **Inferable:** The news module ("Item 1 of 8") and the duplicated logo lists suggest a carousel or marquee. The enterprise section looks like a tabbed or accordion pattern.
- **Not determinable:** Sticky/pinned sections, reveal animations, parallax, and scroll-linked effects. These require the CSS and JS.

**Typography**
- Font families are not visible in the text.
- Heading hierarchy is clear (large hero headline, then section headings, then card titles), but I can't determine exact sizes or weights.

**Color strategy**
- Colors cannot be determined from this text. Imagery includes photographic backgrounds, mock UI cards, and a recurring parallelogram motif, but palette values are not present.

**Trust signals**
- **Metrics:** 135+ currencies and payment methods, $1.9T processed in 2025, 99.999% historical uptime, 200M+ subscriptions, 500M+ daily API requests.
- **Logos:** Customer logos in the hero marquee and startup grid (e.g., Lovable, Gamma, ElevenLabs).
- **Case studies:** Hertz, URBN, Instacart, Le Monde, each with concrete figures.
- **Testimonials:** Mindbody, Jobber, Substack, Lightspeed.
- **Claims:** "50% of Fortune 100 companies," "88% of the Forbes AI 50."

**Performance and accessibility hints**
- **Images:** Many images are referenced with width and quality parameters, suggesting responsive optimization.
- **Alt text:** Many image and logo links appear with empty text in this extract. This may be an artifact of text extraction, but it's worth checking alt attributes.
- **Duplicated lists:** The logo strips are repeated (likely for desktop and mobile), which adds DOM weight.
- **Repeated CTAs:** "Start now" and "Get started" appear several times, which is good for conversion but could be consolidated.

**Cannot determine from static HTML/text**
- Actual fonts, sizes, colors, spacing, and breakpoints
- Motion behavior, timing, easing, and scroll triggers
- Real load performance, Core Web Vitals, or asset weights
- Keyboard focus styles, contrast ratios, and ARIA implementation
- Whether animations respect reduced-motion preferences

---

### apple_airpods

## AirPods Pro 3 page: design notes for a web designer

**Hero**
- The H1 is "AirPods Pro 3," with a stacked display headline: "The world's best in-ear Active Noise Cancellation." The headline is set in large type with manual line breaks.
- A single "Buy" CTA sits under the headline. The same CTA repeats in the local sub-nav, so the hero is a sticky-looking product-led layout with a primary button and no secondary action.
- Hero media is a product image plus start and end frame assets, which suggests a looping or scroll-driven product animation.
- A promo banner sits above the hero, linking to a Black Friday gift card offer.

**Section order and rhythm**
1. Global nav, local sub-nav (Overview, Hearing Health, Tech Specs, Compare), promo banner
2. Hero (headline, Buy CTA, product media)
3. "Get the highlights": video ("Watch the film") plus a six-item feature list linked to anchors
4. "Take a closer look": 3D/AR viewer ("View in your space") and a set of feature blocks (sound, fit, heart rate, water resistance, touch controls, case)
5. Noise control, with a stacked image-and-text gallery
6. Audio performance, Personalized listening, Fitness, Hearing Health
7. Experience: tabbed features (Siri AI, Live Translation, Controls, Connectivity)
8. Battery, Find My (stat callouts such as "1.5x increase")
9. Purchase incentives: a card grid (engraving, delivery, financing, video shopping, app)
10. Product comparison cards (AirPods Pro 3 vs. AirPods 5)
11. Environment and values, then a footer with long legal copy

The rhythm alternates full-width media with two-column text, with alternating left/right image placement likely. Layout details can't be confirmed from text alone.

**Scroll-triggered motion**
- Paired start/end frame images suggest scroll-scrubbed or sequenced video-frame animations, but the static markup doesn't show the trigger mechanism.
- Sticky or pinned sections, reveals, and parallax can't be determined from this content.
- The video uses an HLS (.m3u8) stream, which is a separate playback concern.

**Typography**
- Font families can't be determined from this content.
- Heading hierarchy: H1 for the product name, H2 for section titles, H3 for subheads, and H4 and below for card and gallery items.
- Relative sizes can't be measured. The large stacked headline and the small footnote and legal text imply a wide scale range.

**Color strategy**
- Actual colors can't be determined from the text.
- Alt text suggests a restrained palette with white product photography and single-color accent backgrounds (for example, a "green background" and a "black circle"). Confirm against the rendered page.

**Trust signals**
- Numeric claims, each footnoted: "2x more" noise cancellation, "67% more battery life," an IP57 rating, "40% recycled material," and "25% more units" per shipping trip.
- A footnote mentions FDA authorization for the Hearing Aid feature.
- Apple Card financing and a Goldman Sachs/Apple terms block.
- No customer testimonials or review ratings are visible.

**Performance hints**
- Many images have multiple variants, and the same frame images are reused across sections. Lazy loading and responsive image sets are likely but unconfirmed.
- Long legal footers and footnote blocks add significant text weight.
- Repeated content (the hero Buy CTA, duplicated nav, and the "AirPods Pro 3 AirPods Pro 3" card title) is worth reviewing for redundancy.

**Accessibility hints**
- Several decorative images have empty alt text, while the product and feature images have descriptive alt text. Some alt text is generic, such as "Lightning bolt, green background."
- Links marked "(opens in new window)" should have consistent announcement.
- Footnote superscripts link to anchors, which is good for navigation but can be verbose for screen readers.
- Some headings contain a manual line break, which can affect screen-reader heading text.
- Caption and transcript availability for the video can't be determined from this content.

**What I can't determine from static HTML/text:** exact fonts, sizes, colors, spacing, breakpoints, animation mechanics and timing, whether sticky or pinned sections exist, real rendered performance, contrast ratios, keyboard behavior, and how the tabs and carousels actually function.

---

### raycast

## Raycast homepage: design notes for a web designer

**Hero**
- Headline: "Your shortcut to everything." Subhead: a short line calling it an extendable productivity launcher that is fast, ergonomic, and reliable.
- Primary CTA is a "Download for Mac" button. A secondary "Install via Homebrew" option and a "Download V1" link sit beneath it, with a platform requirement note (macOS Tahoe, Apple Silicon).
- Top nav has a "Log in" link and a "Download" button. A changelog banner ("Introducing Raycast MCP") sits above the hero.
- The hero visual is a keyboard graphic with feature callouts: Fast, Ergonomic, Personal, Reliable.

**Section order and rhythm**
1. Hero with keyboard visual
2. Manifesto-style statement with a repeat CTA
3. Extensions grid with category tabs (Productivity, Engineering, Design, Writing), ending in a "Browse the store" tile
4. AI section with a mock chat UI and three sub-features (AI Chat, Quick AI, AI Extensions)
5. Testimonials: a large avatar grid of named creators, then a featured quote block
6. Automation section (Snippets, Quicklinks, Hotkeys) with UI mockups, a feature list, and Notes
7. Community (Slack and X counts) and a YouTube video grid
8. Developer section with four feature cards and a "Get started" CTA
9. Closing CTA, footer, and newsletter signup

The rhythm alternates full-width statements with dense card grids and product mockups. Sections are short and mostly centered-left, with lots of white space implied by the copy.

**Scroll-triggered motion**
Cannot be determined from static HTML/text. The page may use sticky or pinned sections, reveals, parallax, or scroll-linked animation, but none of that is visible here. Repeated "FIG_0" placeholders suggest that some visuals are media or component placeholders that may animate, but this is unverifiable.

**Typography**
- Font families: not visible in the content.
- Heading sizes: not determinable. Headlines use sentence case and read as large display text. Some have a decorative underline that is probably a rendering artifact, not a design signal.

**Color strategy**
- Background and accent colors: not determinable from text alone. The page references colored "ribbon" images (red, yellow, blue, white, green), a blue glass-effect backdrop, and a community background image, which suggest a mostly neutral UI with colorful accent art. Verify against the rendered page.

**Trust signals**
- Numbers: "99.8% crash-free rate," 37k Slack members, 90k X/Twitter followers, and "thousands" of extensions.
- Testimonials: about 25 named creators and designers with avatars, plus a "Top Extension" pick.
- Third-party app icons in extension cards and the AI mockup act as implicit integration proof. No formal logo wall appears.

**Performance and accessibility hints**
- Images use Next.js optimization (`/_next/image`, WebP, quality parameters), suggesting responsive, compressed assets.
- Many images are decorative or icons. Several have empty alt text (`![]`), and avatars use generic alt text ("Avatar"), so descriptive alt text is likely missing in places.
- The page is image-heavy: roughly 25 avatars plus about 15 extension cards with two images each, and YouTube thumbnails. Lazy loading cannot be confirmed.
- Heading hierarchy and keyboard focus behavior cannot be verified from static content.
- Keyboard-first messaging suits the product, but the keyboard graphic should be checked for screen-reader text.

**Cannot determine from static HTML/text:** scroll behavior and animation details, exact fonts and sizes, color palette and contrast, spacing values, breakpoints and responsive behavior, lazy-loading and load performance, focus states, and actual ARIA or landmark structure.

---

### arc

## Design overview for a web designer

**Hero**
- The H1 "A farewell to Arc" sits above a one-line subhead: "Arc is sunsetting on December 22, 2026."
- A "Read more" link anchors to the letter section below. No primary button appears in the hero.
- Two logo SVGs (outline and color) sit above the headline, so the logo may be animated or swapped. I can't confirm this from the markup.

**Section order and rhythm**
1. Hero: short, centered-feeling text block with one link.
2. Letter: a long paragraph-driven text section ending in a founder signature, a company logo, and a dense grid of about 40 team signatures.
3. Timeline: three dated milestones (October 22, November 23, December 22) as a numbered list. This is the most structured part of the page.
4. "Moving to Dia is easy": a feature sequence (Profiles, Sidebar tabs, Pinned Tabs, Tab Groups). Each block pairs a short heading and caption with a screenshot-style mockup. The mockups make up most of the visual weight.
5. Download CTA: a button with an import icon, plus a secondary text link.
6. FAQ: a long, text-heavy "Questions" section with H3 questions, H4 platform subsections, ordered steps, and download links.
7. Closing: the logo, a tagline, and a repeated "Download Dia" button.

The rhythm alternates text-heavy blocks with image-led feature blocks, then ends in dense reference content and a closing CTA.

**Calls to action**
- "Download Dia" appears three times: in the timeline area, in the feature section, and in the closing block.
- "Learn more about Dia" is a secondary text link.

**Scroll-triggered motion**
- I cannot determine this from the static text. The sticky, pinned, reveal, parallax, or scroll-linked behavior would be in CSS or JavaScript, which isn't included.
- The long mockup sequence and the anchor link suggest the page may use scroll effects, but that's an inference, not a finding.

**Typography**
- Font families are not visible.
- Heading hierarchy is clear: one H1, H2 section titles, H3 FAQ items, and H4 platform labels. Actual sizes are not visible.

**Color strategy**
- Not determinable from the content. Only the outline and color logo variants are visible.

**Trust signals**
- The Browser Company of New York logo and a founder signature.
- A grid of about 40 team signatures, which signals a personal, human tone.
- Claims that Dia "surpasses Arc benchmarks" and is "a lot faster." These are unsourced, so they don't count as verified evidence.
- No numbers, testimonials, or user counts appear.

**Performance and accessibility hints**
- The page relies on many small images (about 40 signatures, numerous favicons, and mockups), which may affect load time. Lazy loading is unknown.
- Several meaningful images, including the hero and mockups, appear to have empty alt text. Decorative images are fine with empty alt, but the mockups likely convey content.
- Heading structure and the ordered list in the timeline support screen-reader navigation.
- Emoji used as section labels in the mockups may be read aloud unless hidden.
- Contrast ratios, focus states, reduced-motion handling, and breakpoints cannot be checked from this content.

**What I cannot determine from static HTML/text**
- Fonts, exact sizes, spacing, and grid system
- Colors, gradients, and dark mode
- Animation type, timing, and scroll behavior
- Responsive layout and mobile behavior
- Image formats, sizes, and loading strategy
- Actual contrast and keyboard behavior

---

### framer

**Hero**
- **Headline:** "Framer is the pro website builder with a world-class design agent." The subhead says you can "Build your website with agents and make it your own on an editable design canvas."
- **Layout:** Likely centered, with a "New: Image and Shader Generation" announcement link above the headline and a demo video (timestamp 0:36) nearby. The text order suggests this, but the visual arrangement isn't visible.
- **CTAs:** Primary "Get started for free" sits directly under the copy. A secondary "Connect with" link points to the MCP page.

**Section order and rhythm (top to bottom)**
1. Hero with an agent prompt example and a chat-style mock-up
2. Three numbered-style feature blocks: start with the agent, refine on the canvas, publish instantly
3. Agent-focused product sections (Design, CMS, Code), each with a card or thumbnail visual and a "Start with Agents" CTA
4. MCP section with a terminal-style import demo
5. "Not just vibes, a full platform" feature grid (performance, CMS, SEO, collaboration, localization, hosting, security, analytics, A/B testing)
6. Showcase gallery and customer logos
7. Marketplace teaser (28,915 resources)
8. Closing CTA, "Your next idea starts here," with a "Start without AI" alternative

The rhythm alternates text-led blocks with product mock-ups and card grids.

**Scroll-triggered motion**
Cannot determine from static text. The agent-chat and "Thinking..." labels suggest animated demos, and the "Exploration" labels suggest a carousel or slide sequence. I cannot confirm sticky/pinned sections, reveals, parallax, or scroll-linked animation.

**Typography**
- Font families are not visible in the text.
- Heading sizes cannot be determined. The long H1 suggests a large display size, but that is an assumption.

**Color strategy**
Cannot determine from this content. The blog titles mention "earthy color palettes" and nature themes, but that describes editorial content, not the site's palette.

**Trust signals**
- Customer logos and "Read story" case-study links (Miro, Perplexity, Zapier, Mixpanel, and others)
- "Trusted by teams shipping big sites" heading
- "99.99% uptime" claim
- Core Web Vitals figures (LCP 1.1s, INP 95ms, CLS 0.01), which are marketing claims I cannot verify
- 28,915 marketplace resources
- No testimonials with named quotes are visible

**Performance and accessibility hints**
- Performance: the page advertises fast Core Web Vitals, but the actual page weight, image optimization, and video loading strategy cannot be determined.
- Accessibility: image alt text, color contrast, heading hierarchy, and focus states cannot be assessed from flattened text. The repeated "Read story" links are identical, which makes them ambiguous for screen-reader users without surrounding context.

---

### resend

**Caveat:** This is a text/Markdown rendering of the Resend site, not its HTML or CSS. Most visual design questions can't be answered from it.

**Hero (inferred from text only)**
- The headline is likely the summary line: "Resend is the email API for developers." The supporting line is "Send transactional and marketing emails at scale with a simple, modern API."
- Layout, CTA placement, and button styling are not determinable. The page has no visible CTA text, though "Sign up for free" appears in the FAQ.

**Section order and rhythm**
1. Intro and "When to use Resend" (bulleted use cases)
2. Setup, CLI, MCP Server, Skills, Documentation, Deliverability, Support
3. Developer resources: OpenAPI spec, SDKs
4. Business pages: Pricing, Enterprise, Nonprofits
5. Content indexes: Blog, Guides, Changelog, Handbook, Customers, Legal, Migrate, Security
6. FAQ, a long run of question-and-answer headings

Rhythm is mostly short link lists with one- to two-sentence descriptions, ending in a dense FAQ.

**Scroll-triggered motion:** Cannot be determined. Sticky sections, reveals, parallax, and scroll-linked animation are invisible in text.

**Typography:** Font families and heading sizes are unknown. The only structural cue is the heading hierarchy (H1, H2, H3), which suggests a clear three-level scale.

**Color strategy:** Cannot be determined.

**Trust signals (textual)**
- Named customers in the FAQ: Warner Bros, eBay, Replit, PlanetScale, Raycast, Gumroad. No logos are visible.
- Numbers: a free tier of 3,000 emails/month and 1,000 contacts; a 99.99% uptime SLA for Enterprise; "SOC 2 Type II audited."
- No testimonials are presented as separate blocks. One FAQ item describes Raycast's migration.

**Performance and accessibility hints**
- Pages offer `.md` URLs and `Accept: text/markdown` content negotiation, which suggests a lightweight alternate version for agents.
- In-page anchors (for example, `#deliverability`) exist.
- Image, alt-text, contrast, and focus-state details are not present, so accessibility can't be assessed.
- Load time, Core Web Vitals, and asset strategy are unknown.

---

### anthropic

# Design Notes: Anthropic Homepage (static content only)

**Hero**
- Headline: "AI research and products that put safety at the frontier." Supporting copy: "AI will have a vast impact on the world."
- The hero image is repeated four times with the same URL, which suggests a rotating or carousel image area. The layout can't be confirmed.
- The only CTA visible in the text is "Try Claude" in the header. No hero button is visible.
- Header nav: News, Research, Policy, Commitments, Company, plus a search icon.

**Section order and rhythm**
1. Hero with mission statement
2. "Announcements" feed: three horizontal cards (Fable/Mythos 5.2, Opus 5.5, Sonnet 5.5). Each has a date, a heading, a one-line summary, model and system-card links, and a "Read announcement" link.
3. "Learn more" grid: four cards (Institute, Constitution, Responsible Scaling Policy, Core views on AI safety), each with an image, heading, and short description.
4. Footer: link columns, a mission block, Log in links (Claude.ai, Claude console), social icons, and copyright.

The rhythm alternates between text-heavy feed cards and image-led cards.

**Scroll-triggered motion**
- Not determinable from static HTML. The "01 / 04" counter beside the "Learn more" cards suggests a paginated or sliding carousel, possibly with a scroll-driven or auto-advancing control.
- No sticky, pinned, parallax, or reveal behavior can be confirmed.

**Typography**
- Font families are not visible in the text.
- Heading hierarchy is roughly h1 (hero, not clearly marked), h3 for card titles. Sizes are not determinable.

**Color strategy**
- Not determinable from the text. Colors, backgrounds, and accents must be checked in the CSS or a rendered view.

**Trust signals**
- No customer logos or testimonials.
- Quantified claims appear only in announcements: "costs 40% less to run," "runs 30%+ faster," and "costs up to 30% less."
- Trust is mainly conveyed through the Public Benefit Corporation statement and links to safety policy pages.

**Performance and accessibility hints**
- Images use WebP with resize parameters, which suggests responsive delivery.
- The same image is requested four times, which is a possible redundancy.
- A "Skip to main content" link is present, which is a good accessibility practice.
- Image tags appear to have no alt text, and social icon links have no visible labels. Both need checking.
- The date order in the announcements (Nov 9, Sep 22, Sep 28) is non-chronological, which may confuse users scanning the feed.

**Cannot be determined from static HTML/text**
- Visual layout, spacing, grid behavior, and breakpoints
- Fonts, sizes, weights, and colors
- Animations, scroll behavior, and carousel mechanics
- Button styling and hover/focus states
- Actual alt text values and ARIA attributes
- Load performance, Core Web Vitals, and real rendering
