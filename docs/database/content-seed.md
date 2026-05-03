# Content Seed

## Input

- source workbook: `data/raw/*.xls`

## Generated Output

- `data/generated/content-json/course-catalog.json`
- `data/generated/import-preview/course-catalog-summary.json`
- `data/generated/import-preview/latest-content-import-job.json`
- `data/generated/sql/content-seed.sql`
- `data/generated/sql/content-seed.bundle.sql`

## Commands

```bash
npm run content:import
npm run db:seed
```

## SQL Usage

- `content-seed.sql`
  - content rows only
- `content-seed.bundle.sql`
  - schema plus content seed statements
- `ContentRepository`
  - supports reading `content-seed.sql` directly in `generated_sql` mode
