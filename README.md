# Hypersquare

A responsive, clickable prototype for a COBOL expert participation program. Experienced professionals explore illustrative banking benefits, register their interest, and preview the next step toward an interview and a screen-recorded coding walkthrough.

## Run locally

Install Node.js, then run from the repository root:

```sh
node preview.mjs
```

Open http://127.0.0.1:4173 in your browser. No dependencies or build step are required.

## Prototype flow

1. Explore bank tiles and sample offer details.
2. Select **Receive offer now!** or choose a sample plan.
3. Enter first name, last name, and email; choose a plan; confirm participation interest.
4. Select **Submit and go** to view the confirmation preview and Hypersquare destination placeholder.

## Files

- `dist/index.html`: page shell, responsive styles, and visual design.
- `dist/app.js`: views, navigation, sample plans, dialogs, and form validation.
- `preview.mjs`: local static-file preview server, bound to loopback.

Deploy the contents of `dist/` with any static hosting provider. Navigation uses URL hashes, so no server-side route rewriting is needed. Google Fonts are loaded externally, with local font fallbacks.

## Demonstration scope

All bank offers, rates, and rewards are fictional examples. No bank affiliation or sponsorship is implied. Bank names and marks belong to their respective owners.

Registration inputs remain in the current page's memory and are cleared on refresh. This prototype does not send emails, collect recordings, submit registrations, or store personal data in a database. The final Hypersquare destination remains a placeholder until the actual page is provided.

## Verification

The prototype was checked in a browser for offer selection, required-field validation, plan changes, registration confirmation, editing entered details, and desktop/mobile layout. JavaScript syntax checks passed.