# Data Flow

## Primary Read Path

The normal runtime path is:

1. `apps/web` reads generated catalog data through `apps/web/src/lib/catalog.ts`
2. The page layer resolves grades, topics, knowledge points, and quiz previews from `data/generated/content-json/course-catalog.json`
3. Learning progress is stored separately in Supabase tables

## Content Provider Order

## Generated Content Source

The web app reads:

- `data/generated/content-json/course-catalog.json`

When that file is unavailable, the helper functions return empty catalog structures so the site can still render.

## Generated State Stores

Current local runtime state is written to generated SQLite files:

- published release catalogs: `data/generated/content-releases/<versionTag>/course-catalog.json`
- release state: `data/generated/app-state/content-release-state.json`

In the no-backend version, user learning state is written to Supabase tables instead of local SQLite files.
