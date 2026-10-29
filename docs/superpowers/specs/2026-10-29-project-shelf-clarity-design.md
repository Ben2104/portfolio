# Project shelf clarity and illustrated covers

## Intent

Keep the interactive 3D bookshelf. Make covers and open pages sharp, and give all nine projects a coordinated visual identity that fits the portfolio.

## Approaches

1. **Illustrated covers, selected by the user:** coordinated editorial illustrations with a different subject for each project. Original project visuals remain inside the books, including actual screenshots where available. This combines a consistent collection with evidence of the actual work.
2. **Realistic scenes:** cinematic physical objects with a shared palette. Rejected in favor of illustrations because consistent software project representation is harder.

## Proposed visual treatment

Use charcoal backgrounds, warm orange highlights, cream details, subtle grain, and consistent composition and lighting. Illustrations should feel designed for the existing cloth-bound books. Keep the subjects readable at shelf size. Generate artwork without embedded titles, logos, or interface text; the engine already draws titles.

Use the same landscape aspect ratio for every illustration, with central subjects and generous margins for safe framing. Target source artwork at least 1536 pixels wide and create optimized WebP assets without upscaling smaller sources.

| Project | Proposed illustration subject |
| --- | --- |
| Material Enhancement Assistant | Layered learning documents and an illuminated annotation motif |
| CrisisLineAI | A voice waveform connecting two points, suggesting support |
| Shape-Sign | A carefully rendered hand gesture with a recognition outline |
| 911 Operator Assistant | A dispatch headset, location grid, and call signal |
| QuizzRiff | Quiz cards with a rhythmic sequence of answer markers |
| The Bookstore | An organized collection of books with catalog markers |
| LLM Chatbot | Interlocking conversation forms and a subtle neural motif |
| Pickleball Booking Extension | A court and paddle paired with a reservation marker |
| Pickleball Booking Automation | A court paired with a clock and a repeating workflow motif |

These subjects and art details are proposals, not individually approved choices.

## Technical scope

- Separate generated cover artwork from the existing project screenshot sources. Preserve original project assets and real screenshots inside the books.
- Increase cover and interior texture resolution to support their inspected size. Retain lazy creation of interior textures and shared material resources.
- Adjust canvas pixel density and adaptive resolution so temporary slow frames do not leave the scene permanently degraded. Keep performance controls for weaker devices.
- Fit screenshots inside a consistent page frame while preserving important content rather than applying the same destructive crop to every source.
- Keep existing book interactions, project content, links, keyboard access, and fallback behavior.

Expected changes reach the shelf engine, explicit cover asset mappings, generated cover files, and focused verification. No new dependency or unrelated section redesign is proposed. Preserve the pre-existing package-lock.json changes.

## Validation

Check asset dimensions and mappings for all nine projects. Verify adaptive resolution behavior with focused checks. Compare closed covers and open pages at desktop and mobile sizes in a browser, including a high-density display configuration. Check page turns, project selection, image framing, and loading failures. Run lint and TypeScript checks appropriate to the final change.

## Risks and limits

Larger textures increase GPU memory and generation/upload time. Density changes need browser performance checks. The 573-pixel 911 source and 720-pixel chatbot source limit screenshot detail; generating cover art cannot restore missing screenshot detail. Generated gestures require visual review and must not claim a particular sign without verification.

Observed during implementation: covers total 1,033,380 bytes and original visuals total 6,800,512 bytes, both loaded before shelf readiness. This improves source detail at the cost of startup transfer and decoded image memory. Existing originals include illustrations and photos as well as interface screenshots.

## Approval and permissions

Implementation and image generation begin after the user approves this design. Local project edits and image generation are the proposed scope. Publishing, deployment, or pushing changes are outside this approval. Browser tooling downloads or other restricted operations, if required for validation, will use the tool's specific permission prompt.
