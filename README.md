# HyperSquare 1.2

> **组员同步后先看 [UPDATE_NOTES.md](UPDATE_NOTES.md)**：v1.2 改了什么、Interview/Review 合并时要注意的地方。

A clickable concept for keeping COBOL systems maintainable after their experts retire. Two separate sites link to each other:

- **Expert community** (`dist/index.html`): leaderboard, a six-question COBOL demo, sample bank offers and registration.
- **Expert workspace** (`dist/workspace/`): experts run AI interviews with Ada and publish verified knowledge; engineers get those answers inside their tickets. Open it from **Expert workspace** in the community site's top navigation.

## Live link

After GitHub Pages is turned on (Settings → Pages → Source: **GitHub Actions**), every push to `main` redeploys automatically:

- Community: https://vickyyan-rgb.github.io/Hypersquare/
- Workspace: https://vickyyan-rgb.github.io/Hypersquare/workspace/

## Run locally

With Node.js installed, run from the repository root:

```sh
node preview.mjs
```

Open http://127.0.0.1:4173. No dependencies or build step are required.

## Pages and interactions

- `#/` or `#/hypersquare`: overview that explains the program first (purpose, sample scenario, time, pay and points), followed by the optional leaderboard, weekly quiz and coding walkthrough.
- **Weekly COBOL quiz**: three questions, answer explanations, and 25 demo points per correct answer.
- **COBOL Now!** (`#/cobol-now`): an automatic six-question playthrough in a full-page code editor. Questions appear as comments, and Linda’s simulated mouse selects faulty code, deletes it, and types replacements in place. The original context stays visible. Five answers pass on the first attempt; the rounding example includes a second animated correction. The final score is 5/6, with 125 points earned and the overall total (285 → 410 on a fresh page). Playback supports pause, replay, and a final-score shortcut; editing resumes from the same place after pausing or returning to the tab. It awards points once per page session. Code fragments illustrate the rules; no compiler runs.
- `#/offers`: illustrative bank offers and participation requirements. Hover over a bank logo to preview its offer; the preview remains open while you move onto it. Clicking still opens the full dialog. Keyboard focus also shows the preview, Arrow Down enters it, and Escape closes it. Choosing a plan carries that bank into registration.
- `#/register`: validated registration and plan selection. **Submit and go** opens Expert Home, where the interview and other contribution options are available.
- **Workspace Home**: a landing page with three actions: Interview with Ada, COBOL Now!, and Answer questions. The interview action opens the introduction or resumes the current session without resetting progress. COBOL Now! opens the coding demo in a separate tab so the workspace session stays intact. Answer questions opens the engineer question list.
- **Workspace Leaderboard**: below Library in the expert sidebar, with all-time rankings, the current expert pinned at the top, Weekly, Your points, award progress, and the COBOL Now! entry. The workspace and overview share the same sample ranking data. The workspace displays the starting sample points; demo progress remains local to the community page and does not sync across tabs. The page can also be opened at `workspace/index.html#/expert/leaderboard`.
- **Questions from engineers**: Answer now opens the related code excerpt for direct editing. Added or changed lines appear in green, with an optional note below. Enter adds lines and Tab indents; Shift + Tab leaves the editor. Publish answer saves the edited excerpt and its original source with the knowledge entry. Code changes alone or a written note can be published; there is no title field. Cancel discards the draft. The prototype stores these answers for the current page session and does not run or change a production program.
- **Interview charts**: click directly into a chart box, decision diamond, or branch label to edit it. Fields grow with the text and support keyboard navigation. Edits stay with each question for the current session and carry into the drafts in Review, including questions that otherwise do not generate a sample draft.
- **COBOL Now! navigation**: the expert sidebar remains alongside the editor and the final score. Its links open the corresponding workspace page, and the back arrow returns to Expert Home. On narrow screens, the sidebar becomes an icon rail. Workspace entry links use `workspace/index.html#/expert/home` (or another allowed role/page); invalid destinations open the default home page.
- **Enter**: the button in the lower-right of the code area becomes available when an answer is ready. It advances to the next challenge, the rounding correction, or the final score. Automatic playback remains available; advancing while paused keeps playback paused.
- **Workspace account information**: click the profile at the bottom of the sidebar (or the account shortcut on a small screen). Edit the demo name, email, job title, team, selected sample offer, time zone, and notification preferences. Linda and Marcus have separate profiles. Changes remain available while the workspace is open and reset on refresh; no real credentials are created or changed.
- **Ask Ada**: the engineer view has a full-height conversation, a message box at the bottom, and a reference sidebar. Sample answers cite confirmed knowledge from Linda and Raj. Select a citation to read the source, version, applicable conditions, and original explanation. On smaller screens, use the References button. Unanswered questions can be added to Linda’s local review queue. Enter sends; Shift + Enter adds a line. New chat clears only this conversation. This is a scripted prototype, not a live AI service.

Quiz and COBOL demo points are awarded once per page session. All progress and entered information reset on refresh.

## Files

- `dist/index.html`: page shell, offer-page styles, and shared design.
- `dist/app.js`: offers, registration, dialogs, and routing.
- `dist/offer-previews.js`: shared offer details, hover previews, and keyboard navigation.
- `dist/dashboard.css`: responsive dashboard and activity-dialog styles.
- `dist/theme.css`: shared muted color palette for the community and workspace.
- `dist/dashboard.js`: sample rankings, profile, quiz, and the COBOL demo entry.
- `dist/leaderboard-data.js`: shared sample rankings, weekly scores, and starting points.
- `dist/workspace/leaderboard.css`: responsive styles scoped to the workspace leaderboard.
- `dist/cobol-demo.js` and `dist/cobol-demo.css`: the six-question playback, explanations, score breakdown, and styling.
- `dist/workspace/index.html`: expert workspace, a single file (React 18 and htm from public CDNs, no build).
- `.github/workflows/pages.yml`: deploys `dist/` to GitHub Pages on every push to `main`.
- `preview.mjs`: local preview server bound to loopback. The workspace is at http://127.0.0.1:4173/workspace/.

Deploy the contents of `dist/` with any static hosting provider. Hash navigation requires no server-side route rewriting. Google Fonts are loaded externally, with local fallbacks.

## Demonstration scope

Leaderboard names, ranks, points, bank offers, rates, and rewards are sample data. No bank affiliation or sponsorship is implied. Bank names and marks belong to their respective owners.

The prototype does not submit or persist registration details, send confirmation emails, record screens, or execute COBOL. Inputs and progress stay in the current page's memory.

## Verification

Run `node tests/cobol-demo.test.cjs` to check the full-page editor, simulated mouse movement, selection, in-place edits, the corrected answer, scoring, one-time rewards, overview totals, pause/visibility resume, replay, and timer cleanup. JavaScript syntax checks pass. The latest local UI changes have not been visually verified because the browser automation tool blocks local-file previews.

Run `node tests/interview-composer.test.cjs` to check the visible answer box, typed submission, empty-answer protection, the editable demo voice transcript, skipping, and code-edit submission. Type directly in the answer box or click a code line to edit it. Hold to talk uses a labeled sample transcript; it does not capture microphone audio.

Run `node tests/account.test.cjs` to check account editing, offer selection, preference saving, validation, cancel, role separation, and reopening the page.

Run `node tests/offer-previews.test.cjs` to check bank hover previews, pointer handoff, dismissal, keyboard access, viewport placement, touch fallback, and plan selection from both preview and click dialog.

Run `node tests/workspace-navigation.test.cjs` to check workspace entry links, role-specific destinations, and invalid-link fallback. The COBOL demo checks also cover its sidebar and Expert Home links.

Run `node tests/ask-ada.test.cjs` to check chat submission, confirmed references, source selection, unknown answers, the local review handoff, keyboard input, and clearing pending replies without affecting ticket conversations.

The example data includes IBM COBOL documentation references. The examples cover arithmetic, loop bounds, sequential file reads, rounding, accumulator reset, and numeric capacity.
