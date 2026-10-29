# Ticket 01: preparation retry loop, cancel restart, stale selection, ignored blocked

Source: qa-engineer final report (code reading, unreproduced in browser). File: src/components/portfolio/project-shelf/shelf-engine.ts. Line numbers at commit 13c32b0.
Rule: for each item write a failing check in scripts/check-project-shelf.mjs first, then the minimal fix. No new framework.

## R1 (must fix): failed preparation retries every frame
- Where: commitShelfFrame end `if (!shouldContinue) prepareSettledBook();` (~3911) -> prepareSettledBook (2416) -> prepareBook. onFail (openDetail) clears state but nothing remembers the failure.
- Repro: make upload throw persistently (e.g. renderer.initTexture throws). Settle the shelf. Every later frame (hover, resize) calls prepare again, creating a canvas and failing again.
- Expected: after a failure, no automatic prewarm for that book id until the selection changes, the shelf leaves and re-enters the screen, or the user presses Open. A user-initiated Open may retry once per activation.
- Check: fake scheduler/uploader that always throws; run N frames; assert create count stays bounded (1 per user attempt).

## R3: Escape cancel restarts the same book at once
- Where: onKeyDown Escape branch (~3960) calls requestFrame(); frame end runs prepareSettledBook, which restarts the same id.
- Expected: after a user cancel, prewarm for that id stays suppressed until selection changes or the shelf leaves/re-enters the screen. Same suppression mechanism as R1.
- Check: cancel while pending, run frames, assert no new prepare for that id.

## R2: scrolling while Preparing opens a book that is not at the scrolled position
- Where: updateShelfLayout guard `!preparingId && nearest !== selectedIndex` (~3767); onReady then calls beginOpening for the preparing book.
- Expected: if the page scroll moves selection away from preparingId, cancel the preparation and clear Preparing (the onScroll path already cancels when selection changes via updateSelection; make sure the suppressed-selection case cannot open a stale book). Minimal: on ready, open only if the nearest selection still equals the prepared id, else clear preparing.
- Check: pending prep, move position to another book, deliver ready; assert no open and busy cleared.

## R4 (latent): openDetail ignores prepare() "blocked"
- Where: openDetail (~3556) sets Preparing, then prepareBook returns "blocked" when `inspected && inspected !== id`; no callback ever fires.
- Expected: if prepare returns "blocked", clear Preparing and restore the Open button.
- Check: fake with inspected = other id; assert busy cleared.

Report to lead: changed files, failing-then-green check names, lint and tsc exit codes. No build, commit, or push.
