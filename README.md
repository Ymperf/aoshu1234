# Math Olympiad Learning Platform

This repository uses a `monorepo` structure and currently contains:

- `apps/web`: Next.js learning site
- `services/content-pipeline`: Excel import and content generation pipeline
- `packages/shared-types`: shared TypeScript contracts
- `packages/content-schema`: fallback sample catalog
- `data/raw`: source workbook files
- `data/generated`: generated JSON, SQL, and import preview artifacts

The current delivery status:

1. Parse `data/raw/*.xls`
2. Generate `data/generated/content-json/course-catalog.json`
3. Generate quiz preview data and import preview metadata
4. Generate `data/generated/sql/content-seed.sql` for MySQL import
5. Web reads the generated catalog directly
6. Web renders grades, topics, knowledge points, and quiz preview pages

Useful commands:

```bash
npm run content:import
npm run content:generate:ai
npm run db:seed
npm run local:start
npm run local:stop
npm run verify:baseline
npm run verify:runtime
npm run test:smoke
npm run lint
npm run build:web
npm run dev:web
```

`npm run db:seed` always prepares `data/generated/sql/content-seed.bundle.sql`.
If `mysql` is available in `PATH` and `MYSQL_USER` plus `MYSQL_DATABASE` are set, it also imports the schema and seed into MySQL.

See the UTF-8 project docs in `docs/` for startup, data flow, and verification details.

Quick local startup:

```bash
cd /d E:\cdxproject
npm run local:start
```
