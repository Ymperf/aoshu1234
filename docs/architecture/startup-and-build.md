# Startup And Build

## Prerequisites

- Node.js 22+
- npm 11+
- Python 3.11+

## Install

```bash
npm install
```

## Generate Content Artifacts

The workbook source file lives in `data/raw/`.

Run the content pipeline before local verification:

```bash
npm run content:import
npm run content:generate:ai
```

Generated artifacts are written to:

- `data/generated/content-json/course-catalog.json`
- `data/generated/import-preview/course-catalog-summary.json`
- `data/generated/sql/content-seed.sql`
- `data/generated/ai-review/`

## Local Development

Start the web app:

```bash
npm run dev:web
```

Default URL:

- Web: `http://localhost:3000`

## Build

```bash
npm run build:web
```

## Baseline Verification

Run the non-interactive baseline checks:

```bash
npm run verify:baseline
```

This command validates:

- workspace lint
- web build
- content import smoke checks

## Runtime Verification

Run the end-to-end local runtime check:

```bash
npm run verify:runtime
```

This script starts a built API instance and a built web instance, then validates:

- catalog responses
- web home page
- web knowledge point page
