# Changelog

## 1.1 — 2026-10-30 (Interview + Review, from usability testing)

### Changed
- **Interview**: a short "How this interview works" intro (time, steps, who reads the answers, how much detail) before the first question, reopenable from "How this works".
- Ada is now a small header bar; the current question is the main focus, with answer hints under it.
- New **Edit code** answer mode: edit the highlighted lines and add one sentence on why.
- After each answer, "What you said" sits next to "What Ada understood". When an answer is uncertain, Ada asks a follow-up instead of guessing ("Answer it" / "Keep as unknown").
- "Earlier in this session" list shows past questions, answers, and status.
- **Review & publish**: a 4-step explanation of what publishing does; each draft shows your words beside Ada's summary, the code version, and confirmation status; open points Ada didn't fill in can be answered, kept as unknown, or added to the next interview.

## 1.0 — 2026-10-26

### Added
- `dist/workspace/`: the HyperSquare expert workspace (expert and engineer views: AI interview with Ada, review and publish, questions inbox, knowledge library, coverage, tickets, ask a twin).
- **Expert workspace** link in the community site's top navigation; the workspace sidebar links back to the community site.
- GitHub Pages workflow that publishes `dist/` on every push to `main`.

### Changed
- Community site and dashboard recolored to the workspace palette (ink navy, cobalt blue, cool neutrals). Green and olive tones became blue; warm avatar tones, bank logo colors, layout, fonts, copy and motion are unchanged.
