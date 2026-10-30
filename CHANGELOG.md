# Changelog

## 1.1 — 2026-10-30

Changes from the six user interviews. The Interview and Review pages are owned by a teammate and were left as they were, except for the code panel.

### Community site
- Overview now opens with what HyperSquare is for, a three-step sample scenario, and a "what it takes · what you get" section (time, pay, points, control; amounts marked as examples). Leaderboard, quiz and COBOL NOW! moved below as optional extras.
- One profile entry (the duplicate in the bottom bar was removed). Navigation stays visible on phones, so Bank offers and Expert workspace can be reached on mobile.
- Bank offers page: every bank tile is labelled Sample, and a new "From your answer to your benefit" flow explains contribute → quality review → points → perks and who reviews.
- Same header, logo and accent color as the workspace; larger text throughout.

### Expert workspace
- Expert home: questions prepared from real tickets, each with a time estimate, and a three-step "how it works" line.
- Code panel: Edit code lets the expert change lines directly, add a one-line reason, and keep a before/after record with Undo.
- Engineer view starts on Ask or search: one search box shows matching confirmed answers as you type; questions without a confirmed answer go to the expert instead of being guessed.
- Ticket answers lead with the next step, then the expert's reasoning, then when it applies and when it doesn't; ticket background moves below.
- Every answer shows its code version and last-confirmed date; items whose code changed are marked Needs re-review.
- Library is search-first (most used items, program filters) and shows how data flows into and out of each program.
- Coverage is labelled as a manager view and lists the specific knowledge gaps.
- Fixed: the side drawer's code block collapsed and the drawer did not scroll properly.
- Plainer wording (no "twin" language), larger body text, fewer boxed cards.

### Type and alignment
- All three sites use Atkinson Hyperlegible Next (text) and Atkinson Hyperlegible Mono (code), designed by the Braille Institute for legibility. The serif-italic accents were removed.
- Overview: the leaderboard, weekly panels and the quiz/COBOL NOW! row share one column grid; rank numbers sit in one fixed-width column; section headings stack their notes underneath.

## 1.0 — 2026-10-26

### Added
- `dist/workspace/`: the HyperSquare expert workspace (expert and engineer views: AI interview with Ada, review and publish, questions inbox, knowledge library, coverage, tickets, ask a twin).
- **Expert workspace** link in the community site's top navigation; the workspace sidebar links back to the community site.
- GitHub Pages workflow that publishes `dist/` on every push to `main`.

### Changed
- Community site and dashboard recolored to the workspace palette (ink navy, cobalt blue, cool neutrals). Green and olive tones became blue; warm avatar tones, bank logo colors, layout, fonts, copy and motion are unchanged.
