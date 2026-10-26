# Hypersquare

A responsive, clickable prototype for a COBOL expert community and participation program.

## Run locally

With Node.js installed, run from the repository root:

```sh
node preview.mjs
```

Open http://127.0.0.1:4173. No dependencies or build step are required.

## Pages and interactions

- `#/` or `#/hypersquare`: single-screen dashboard with all-time and weekly sample leaderboards, personal points, and profile access.
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
- `preview.mjs`: local preview server bound to loopback.

Deploy the contents of `dist/` with any static hosting provider. Hash navigation requires no server-side route rewriting. Google Fonts are loaded externally, with local fallbacks.

## Demonstration scope

Leaderboard names, ranks, points, bank offers, rates, and rewards are sample data. No bank affiliation or sponsorship is implied. Bank names and marks belong to their respective owners.

The prototype does not submit or persist registration details, send confirmation emails, record screens, or execute COBOL. Inputs and progress stay in the current page's memory.

## Verification

Browser checks cover desktop and mobile screen fit, profile access, quiz feedback and scoring, prevention of duplicate quiz awards, coding feedback and rewards, offers navigation, and registration-to-dashboard handoff. JavaScript syntax checks also pass.
