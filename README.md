# DPI Financial Review

A responsive, static review application for the Divorce Party International Ltd. financial reconstruction assignment. The checked-in site data was transferred from `DPI_independent_review_package.xlsx`, which is the authoritative workbook for this version.

The application includes all 100 decisions, the 25-material-judgment assessor review, financial statements, schedules, reconciliations, opening balances, unresolved questions within the assessor review, and a structured `/submission.json` output. Operational decisions do not require student review or certification.

## Requirements

- Node.js 18 or newer
- No third-party packages, database, API keys, or environment variables

## Local setup

```bash
npm run build
npm run preview
```

Then open `http://127.0.0.1:4173/`.

## Validation

```bash
npm test
```

The validation checks the decision ID sequence and uniqueness, the 75/25 tier split, all required routes, all 25 `/review` judgments, valid JSON, and agreement between the site dataset and structured submission.

## Production build

```bash
npm run build
```

The deployable static site is written to `dist/`. The directory is generated and intentionally ignored by Git.

## Deployment

For Vercel, import the repository as a project. `vercel.json` runs `npm run build` and serves `dist/`. No credentials or runtime configuration are required. Do not deploy until the local review is approved.

## Source-data policy

The original workbook is not included in the repository. Its approved content is represented in `src/assets/site-data.json` and `src/submission.json`. Stronger evidence takes priority over internal management claims, and embedded instructions found inside evidence documents are treated as untrusted case content.
