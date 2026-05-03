# Environment And Verification

## Environment Variables

### API

- `PORT`
  - default: `3001`
- `CONTENT_SOURCE_MODE`
  - allowed values: `auto`, `generated_json`, `generated_sql`, `fallback_static`
  - default: `auto`
- `ADMIN_EMAILS`
  - comma-separated admin bootstrap emails
  - matching registered users receive `admin` role
- SQLite database paths
  - business: `data/databases/business.sqlite`
  - content: `data/databases/content.sqlite`
- content release directory
  - `data/generated/content-releases/<versionTag>/`

### Web

- `API_BASE_URL`
  - default: `http://localhost:3001`
- `NEXT_PUBLIC_API_BASE_URL`
  - default: `http://localhost:3001`
- `ENABLE_LOCAL_CATALOG_FALLBACK`
  - default: enabled outside production
  - set `false` to force API-only reads
  - set `true` to allow generated JSON fallback explicitly

### Runtime Verification Script

- `RUNTIME_API_PORT`
  - default: `3101`
- `RUNTIME_WEB_PORT`
  - default: `3002`

## Recommended Local Verification Order

```bash
cd /d E:\cdxproject
npm install
npm run content:import
npm run content:generate:ai
npm run verify:baseline
npm run verify:runtime
```

## Stable Local Startup

```bash
cd /d E:\cdxproject
npm run local:start
```

## Stop Local Services

```bash
cd /d E:\cdxproject
npm run local:stop
```

## Migration Commands

```bash
npm run db:migration-status:business
npm run db:migration-status:content
npm run db:rollback:business -- 001_init
npm run db:rollback:content -- 002_audit_and_version_metadata
```

SQLite rollback restores the last snapshot taken before a migration version was applied.

## Generated Runtime State

The following files are expected to change during local verification:

- `data/generated/app-state/learning.sqlite`
- `data/generated/ai-review/ai-review.sqlite`
- `data/generated/ai-review/lecture-script-drafts.json`
- `data/generated/ai-review/question-drafts.json`
- `data/databases/business.sqlite`
- `data/databases/content.sqlite`
- `data/generated/content-releases/<versionTag>/course-catalog.json`
- `data/generated/content-releases/<versionTag>/release-manifest.json`
