# Current Status And Next Plan

## Current Status

The repository has moved to a static-content plus Supabase learning-progress baseline.

Implemented areas:

- monorepo structure for `apps/web`, `packages/*`, and `services/content-pipeline`
- workbook import pipeline from `data/raw/*.xls`
- generated catalog JSON and SQL seed output
- web pages for home, grade, topic, knowledge point, and learning center
- Supabase Auth and Supabase-backed learning progress
- static content rendering from generated JSON

## Current Delivery Boundary

The current codebase is a static content site with a lightweight user-learning layer.

Not yet production-ready:

- Supabase project configuration and migration execution
- production storage policy for generated releases
- broader automated integration coverage

## Next Plan

Immediate execution focus:

1. configure Supabase Auth and database environment variables
2. run the Supabase migration and verify RLS
3. harden the static content rendering and learning-progress writes
4. decide whether to keep any release tooling outside the main app
