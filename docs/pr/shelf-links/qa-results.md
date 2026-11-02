# Shelf links

`npx eslint` on the shelf files, `npx tsc --noEmit --incremental false`, `npm run build`, and `node --experimental-strip-types scripts/check-project-shelf.mjs` passed.

The links page was painting GitHub, Devpost, and Live as canvas text, and a press there started a page drag. The side panel already had real anchors. Empty URLs were already omitted. The printed labels are now anchors on that page (`target="_blank"` `rel="noopener noreferrer"`), hidden while a page drag bends the sheet. The panel links are unchanged.

Screenshots are from `chrome-devtools-axi` against `next start` of that build. `next dev` was not used.

| View | File |
| --- | --- |
| Desktop 1440, Lobe links page (GitHub anchor focused) | `desktop-links-1440.png` |
| New tab from that GitHub anchor | `desktop-github-tab.png` |
| New tab from the Devpost anchor | `desktop-devpost-tab.png` |
| Phone 390, detail sheet links scrolled into view | `mobile-links-390.png` |

Desktop: Enter on the page GitHub anchor opened `https://github.com/DuongAnh1201/Lobe`. Clicking the page Devpost anchor opened `https://devpost.com/software/lobe` (Cloudflare bot check). The page stayed on Links · Plate.

Phone: the open book is wider than 390px, so the printed link page sits off the left edge. The sheet's GitHub and Devpost anchors, after scrolling the sheet, opened the same two URLs. Lobe has no live URL. Live uses the same anchor path; the shelf check covers a live href.
