# Mascot alive

Production server (`next build` + `next start`). Intro skipped with `sessionStorage.portfolio-intro-seen`.

Stills below are the frames the mascot actually selected. Blink and click shots were pinned for the slow devtools screenshot bridge after that frame's opacity became 1. No gif: the bridge cannot sample inside a 150ms blink.

| | 1440×900 | 390×844 |
| --- | --- | --- |
| Idle | [idle-1440.png](idle-1440.png) (`look-center`) | [idle-390.png](idle-390.png) |
| Blink | [blink-1440.png](blink-1440.png) | [blink-390.png](blink-390.png) |
| Laugh / bounce | [react-laugh-1440.png](react-laugh-1440.png) | [react-laugh-390.png](react-laugh-390.png) |
| Starstruck / wiggle | [react-starstruck-1440.png](react-starstruck-1440.png) | [react-starstruck-390.png](react-starstruck-390.png) |
| Sparkle / spin | [react-sparkle-1440.png](react-sparkle-1440.png) | [react-sparkle-390.png](react-sparkle-390.png) |

Checked in the page: float transform changed over 700ms while visible and froze once the mascot was scrolled off (`top: -2412`). A glance selected `look-down-left` on its own. Click motions at 160ms were distinct (bounce `y ≈ -17`, wiggle about −14°, spin about 63°). With `--force-prefers-reduced-motion`, the float transform stayed `none` and a click still swapped to `laugh.webp`.

Follow-ups, not done here: the intro overlay is still a still sparkle until landing; sleep resets on any window pointer move, so dozing rarely shows while the cursor is moving.
