# HyperSquare 1.1

> **组员同步后先看 [UPDATE_NOTES.md](UPDATE_NOTES.md)**：v1.2 改了什么、Interview/Review 合并时要注意的地方。

A clickable concept for keeping COBOL systems maintainable after their experts retire. Two separate sites link to each other:

- **Expert community** (`dist/index.html`): leaderboard, weekly quiz, coding walkthrough, sample bank offers and registration.
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
- **COBOL NOW!**: an editable sample coding walkthrough with guided pattern checking and a one-time 75-point demo reward. This is not a COBOL compiler.
- `#/offers`: illustrative bank offers and participation requirements.
- `#/register`: validated registration and plan selection. **Submit and go** opens the dashboard with the entered name.

Quiz and walkthrough points are awarded once per page session. All progress and entered information reset on refresh.

## Files

- `dist/index.html`: page shell, offer-page styles, and shared design.
- `dist/app.js`: offers, registration, dialogs, and routing.
- `dist/dashboard.css`: responsive dashboard and activity-dialog styles.
- `dist/dashboard.js`: sample rankings, profile, quiz, and coding walkthrough.
- `dist/workspace/index.html`: expert workspace, a single file (React 18 and htm from public CDNs, no build).
- `.github/workflows/pages.yml`: deploys `dist/` to GitHub Pages on every push to `main`.
- `preview.mjs`: local preview server bound to loopback. The workspace is at http://127.0.0.1:4173/workspace/.

Deploy the contents of `dist/` with any static hosting provider. Hash navigation requires no server-side route rewriting. Google Fonts are loaded externally, with local fallbacks.

## Demonstration scope

Leaderboard names, ranks, points, bank offers, rates, and rewards are sample data. No bank affiliation or sponsorship is implied. Bank names and marks belong to their respective owners.

The prototype does not submit or persist registration details, send confirmation emails, record screens, or execute COBOL. Inputs and progress stay in the current page's memory.

## Verification

Browser checks cover desktop and mobile screen fit, profile access, quiz feedback and scoring, prevention of duplicate quiz awards, coding feedback and rewards, offers navigation, and registration-to-dashboard handoff. JavaScript syntax checks also pass.
