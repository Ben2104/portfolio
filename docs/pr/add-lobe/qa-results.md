# Lobe shelf evidence

`npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build`, and `node --experimental-strip-types scripts/check-project-shelf.mjs` passed.

Screenshots are from `chrome-devtools-axi` against `next start` of that build, at 1440×900 and 390×844. `next dev` did not hydrate here: the dev HMR upgrade hung, so the intro stayed at opacity 0.

| View | File |
| --- | --- |
| Desktop home | `desktop-home-1440.png` |
| Desktop shelf, Lobe selected | `desktop-shelf-lobe-1440.png` |
| Desktop detail | `desktop-detail-lobe-1440.png` |
| Phone home | `mobile-home-390.png` |
| Phone shelf, Lobe selected | `mobile-shelf-lobe-390.png` |
| Phone detail | `mobile-detail-lobe-390.png` |

The shelf cover was generated with the image tool, then resized to 1448×1086 WebP with `sips` and `cwebp`. The detail image is a crop of `docs/qa/2026-10-24-w1/11-3d-arrival.jpg` from the Lobe repo. Devpost lists no award. The write-up lists teammates, so the entry does not claim solo work.
