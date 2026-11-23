# jakubkrehel/skills: digest as a portfolio review rubric

Source: https://github.com/jakubkrehel/skills (fetched from raw HEAD on 2026-11-22; commit SHA not recorded). Read in full: README.md; better-interface, better-typography, better-motion, better-layout, better-colors, better-ui, better-writing, better-accessibility (SKILL.md plus the sub-docs listed below); interface-review (SKILL.md only, partial); build-design (SKILL.md; figma.md not read). Not read: LICENSE, explain-interface, break, state-machine, variant, afk, upskill, and the transitions.md / enter-exit.md / layout-animation.md / spacing-and-adaptivity.md / icons.md sub-docs (only their parent SKILL.md summaries were read). Values below are taken from the SKILL.md files unless marked otherwise.

## 0. What the repo is
Agent skills (Claude/Codex-style SKILL.md) that encode design-engineering rules. README: skills cover "UI, motion, typography, colors, accessibility, layout, product writing". Install: `npx skills add jakubkrehel/skills`. Companion magazine: interfaces.dev. Most important for you: the rule tables are a checklist. Each skill has a "Before you finish" table of **detection pattern -> fix**, and a **Verification** note on what to check without a browser.

## 1. Typography (better-typography)
Exact (findings if missed):
- Unitless line-height. Display `1.1`, headings `1.2`–`1.3`, body `1.5`–`1.6`. Text wrapping to 3+ lines needs at least `1.4`.
- Weight `400` or heavier below `18px`. Weights `100`–`300` only at `28px` and up.
- Measure 60–75 characters per line for long-form text.
- Inputs at `16px` on mobile (iOS zoom).
- `font-variant-numeric: tabular-nums` on timers, counters, prices, numeric columns.
- Body text in `rem`. Long-form body starts at `16px`. UI: inputs and menus `14px`, captions `13px`, rarely below `12px`.
- Letter-spacing in `em`: headings `24px`+ take `-0.01em` to `-0.02em`; uppercase labels `14px` or smaller take `0.05em`; body `0`.
Heuristics (report only if they break the project's own scale):
- At most about three fonts; "Pair for contrast". "Never propose a new typeface ... unless the task asks for a type change."
- Heading sizes descend with level; a heading is never smaller than body text unless it is a deliberate overline.
Wrapping: `text-wrap: balance` for headings and short descriptions, never paragraphs; `text-wrap: pretty` for paragraphs. `text-align: start` in UI (justify only in specific editorial layouts). Use typographic punctuation (curly quotes, en/em dashes, the ellipsis character). Load every font face the design uses ("Browsers synthesize a weight or style the family doesn't ship").
Truncation needs a route to the full text.

## 2. Motion (better-motion)
Principle: "The first question is whether to animate at all." Frequency decides: keystrokes, row hovers, and tab changes are instant or `150ms` or less. A menu opened many times a day skips its open animation. "Every animated state change also leaves a static cue in the form of a color, icon or label."
Durations (enter): tooltip/small `150ms`; dropdown/menu `250ms`; modal/drawer/panel `350ms`–`450ms`. Exit is shorter than enter (dropdown 250 in, 150 out).
Easing: enters, exits, state changes use `ease-out`; loaders use `linear`. Springs for sheets, morphs, drags, sliders. "A color or opacity change never takes a spring." CSS fallback: `cubic-bezier(0.2, 0, 0, 1)`.
Springs: `{ type: "spring", duration: 0.3, bounce: 0 }`; bounce always `0`. Durations `0.3` small swaps, `0.4` tab indicator, `0.45` drawer.
Scale: tooltip/dropdown enter from `0.96`–`0.97`; modal/panel from `0.98`–`0.99`; modal/panel exit to `0.99`. Press scale `0.96` over `150ms` ease-out; disabled never scales.
Distance: text swap `4px`; page transition `8px`; dropdowns/tooltips `8px`–`32px`; sheets up to `70%` of their own size. Scale from the trigger (transform-origin toward the opener), not center, for popups.
Staggered entrance: chunks (title, description, actions) `100ms` apart, each opacity + `4px` blur + `12px` translateY, `300ms`, ease-out. "Never stagger routine interactions."
Exit: opacity + `4px` blur + fixed `-12px` translateY, `150ms`, ease-out.
Icon cross-fade (play/pause, copy/copied): scale `0.25`→`1`, opacity `0`→`1`, blur `4px`→`0px`; spring `0.3` or 300ms cubic-bezier(0.2,0,0,1).
Performance: `transition: all` is a finding; name properties; animate transform/opacity/filter/clip-path; `will-change` only after a seen stutter.
Reduced motion: movement, blur and entrance scale only under `prefers-reduced-motion: no-preference`; under reduced motion use an opacity cross-fade. Press scale stays.
Slow-motion QA: "Replay every animation ... at a tenth of its speed."

## 3. Layout (better-layout)
- "Group with space, not lines": gap between groups at least 2x the gap within a group (8px inside implies 16px+ between).
- Controls must look distinct from static text (background, border, underline, or a consistent zone).
- Pick a small set of alignment edges; one spacing step per nesting level; `16px` is a useful default.
- Logical properties (`margin-inline-start`, `text-align: start`) for anything that mirrors.
- Most important content leads; visual order = DOM order.
- One primary action per view; more than 3 secondary actions go behind a menu.
- Hint at hidden content: peek `16–32px` past the scroll edge or show a disclosure.
- Borderless controls: `12px` between bordered controls; `24px` between visible glyphs of borderless text/icon controls.
- Full-width mobile buttons inset about `16px` inline. "Content bleeds, controls float"; `scroll-padding-block-start` = sticky header height.
- Breakpoints come from content; container queries for components. Test 320px, 200% zoom, RTL.
- Size with `max-width`/`min-height`, not fixed width/height; test pseudo-localization and a long-string locale (German). Never park a critical action where zoom clips it.
- Use `100dvh` not `100vh`; avoid `100vw`; `minmax(0,1fr)`.

## 4. Color (better-colors)
- "A system is ramps, not colors": one neutral ramp, one accent ramp, only the status ramps actually rendered.
- Primitives named by hue (`--blue-600`); components reference only semantic tokens (`--color-text-secondary`). Rename brand tokens to `accent`; no hue names in semantic tokens.
- "One color, one meaning", with hue within 15° of OKLCH hue treated as the same color. Status hue must be at least 15° from the accent hue.
- "Fill exactly one action per view": one filled primary; peers neutral; put color on background not label.
- Gradients: default `in oklab`; use `in oklch` when a two-hue gradient goes gray; banding on large low-contrast areas.
- Measure the rendered pair (including opacity and images beneath) in both appearances. Text on `/50` alpha must be measured. "`text-white` on a Tailwind `500` fill" is flagged as fails 4.5:1 on most `500` hues (their claim, not re-measured).
- Dark mode needs its own palette, not reversed steps. Increased-contrast variant widens OKLCH L by at least `0.15` over default; target Lc 90 for body.
- Example: `text-white` on a `500` fill: measure and report (their claim).
- Contrast fixes change lightness first, holding hue; "Mid-lightness backgrounds cap what is achievable."

## 5. Surfaces and UI polish (better-ui)
- Concentric radius: `outerRadius = innerRadius + padding + borderWidth` (e.g. 12 inner + 8 padding = 20 outer). Past 24px padding, treat as separate surfaces.
- Shadows for elevation, borders for structure. Light-mode shadow ring: `0px 0px 0px 1px oklch(0 0 0 / 0.06), 0px 1px 2px -1px oklch(0 0 0 / 0.06), 0px 2px 4px 0px oklch(0 0 0 / 0.04)`; hover alpha `0.08 / 0.08 / 0.06`. Dark: `0 0 0 1px oklch(1 0 0 / 0.08)` (hover `0.13`). Pair with `border: 1px solid transparent` for forced-colors.
- Image outline: `1px`, `outline-offset: -1px`, `oklch(0 0 0 / 0.1)` light / `oklch(1 0 0 / 0.1)` dark; never a palette near-black or tinted neutral.
- Hover only under `@media (hover: hover)`.
- `overscroll-behavior: contain` on dialogs, drawers, menus.
- Icon stroke tracks text weight: `1.5px` at 400 to `2.5px` at 700. One icon library per surface. `currentColor` only.
- Optical alignment: 2px less padding on the icon side of a button (`ps-4 pe-3.5` example); nudge play triangles ~2px toward their point.

## 6. Accessibility (better-accessibility, WCAG 2.2)
Escalation triggers (always HIGH once confirmed):
- Interactive control with no accessible name.
- Keyboard-reachable control with no visible focus indicator.
- Pointer-reachable path with no keyboard path.
- Motion ignoring `prefers-reduced-motion`.
- Content clipped/unreachable at 320px or 200% zoom.
- Body/control text failing its contrast ratio.
- State carried by color alone.
- Destructive action with no confirmation, undo or distinct treatment.
- Truncated content with no way to the full value.
- Content reachable only past a scroll edge with no visible cue.
- Error with no way to recover.
- Semantic color used against its meaning.
- State change carried by motion alone.
Contrast thresholds: WCAG 2 text 4.5:1 AA / 7:1 AAA; large text (24px, or 18.67px bold) 3:1; UI components 3:1. APCA: body Lc 75 (preferred 90); labels Lc 60; large Lc 45; solid icons and UI Lc 30; dividers Lc 15.
Targets: WCAG 2.5.8 AA 24x24 css px (with exceptions). Their heuristic 44x44 touch / 40x40 desktop, described as heuristic and not a WCAG requirement. Extend hit areas with a pseudo-element; never let hit areas overlap; decorative layers `pointer-events: none`. Every drag needs a single-pointer alternative (2.5.7).
Focus: style `:focus-visible`; ring 3:1 against adjacent colors (1.4.11); never `outline: none` without replacement; focused element not hidden behind sticky chrome (2.4.11).
Other: native elements first (`<button>`, `<a href>`); `aria-disabled` vs `disabled`; validate on submit, don't disable submit; `aria-invalid` plus `aria-describedby`; `role="status"` for polite updates, `role="alert"` for urgent only; alt text by purpose; "Skip to content" link; never `maximum-scale=1`; reflow at 320px; any timer-driven moving content needs a pause control past 5 seconds.
Pair color with a second cue (1.4.1).

## 7. Writing (better-writing)
- Inventory existing strings first; reuse nouns and verbs ("project" vs "workspace"; "Delete" vs "Remove"); one vocabulary.
- Tone flexes: success/onboarding/empty warm; routine neutral; errors and destructive calm, "zero playfulness".
- Address the reader directly: "you", not "the user"; avoid "we" in errors.
- Verb-first buttons ("Save draft", "Delete project"); never "OK!" or "Let's go!".
- Link text describes destination: "Read the billing docs", not "Click here"; suffix repeated "Learn more about exports".
- One capitalization policy per element type; sentence case default.
- Toggle labels describe the ON state: "Send read receipts", not "Don't send...".
- Errors say how to fix, beside the field. Bad: "Oops! Something went wrong." Good: "Unable to save. Check your connection and try again." No blame, no "oops", no exclamation marks.
- Undo beats confirmation for reversible actions ("Project archived. Undo"). Confirmations: title names action and object ("Delete 'Q3 report'?"), buttons "Delete project" / "Cancel", never "Yes"/"No"; type-to-confirm for accounts/workspaces/repos.
- Empty states point forward: orientation line + one clear next action. Example: "No projects yet" / "Projects keep your tasks and files together." / button "Create a project".
- Placeholders show an example format, never an instruction.
- Build strings whole, use plural rules and `Intl`.

## 8. Interface review rubric (interface-review and better-interface)
Ranking: HIGH (blocks task, misleads, hides content, data-loss risk, systemic), MEDIUM, LOW. Prefer cheapest fix: Delete > Use the platform > Reuse project token > Correct the value > Add. Report at most 15 findings. Verdict: `Block` if any HIGH remains; `Approve` otherwise, naming any "Not reviewed" domain. Every finding cites `path:line`, with Before, After, Why.
Review table columns: Severity | Domain | Location | Before | After | Why.
Review domains in order: accessibility, layout, writing, typography, color, UI, motion. Mark a domain "Not reviewed" if its skill did not load. Do not mark "Clear" without inspection.

## 9. build-design (Figma to code)
- Values come from the design file, never taste. "A change the design does not show is a deviation."
- Map each design value to a token; never invent a token to hit a number; stop and ask if rounding changes the look by more than 2px on spacing/size.
- Build only frames drawn; leave undrawn states to component defaults and list them as missing.
- Compare rendered output against the design at each frame width, element by element; report in a Design / Built / Status table.

## 10. Portfolio-specific takeaways (my synthesis, not repo rules)
- Hero/first impression: one primary action; motion on first load is allowed as "expressive" motion (repo says reserve for first load, success, empty states); stagger the hero chunks 100ms apart with blur+12px translate over 300ms.
- Scroll storytelling: the repo's motion rules cover enters and reduced-motion gating; it has no scroll-driven section. Scroll-linked/parallax needs reduced-motion handling (kill parallax under reduced motion per better-accessibility).
- Non-technical welcome: writing rules (plain words, you-voice, verb-first CTAs, empty/error copy) apply directly.
- Gap: the repo does not address scroll-driven storytelling, page-level art direction, imagery, or brand personality. Treat those as outside its scope.

## Unverified / not checked
- Did not verify any numeric claims by rendering. Values are from the repo text.
- The `text-white` on `500` contrast claim is the repo's, not re-measured.
- LICENSE not read; check before copying any rule text verbatim into shipped code or docs.
