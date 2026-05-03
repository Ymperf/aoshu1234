# Database Cutover

## Current State

- business data uses `data/databases/business.sqlite`
- content operations use `data/databases/content.sqlite`
- schema versions are tracked in `schema_migrations`
- current runtime provider is selected by `DB_PROVIDER`

## Cutover Targets

- production business database: MySQL or PostgreSQL
- production content database: MySQL or PostgreSQL

## Recommended Steps

1. Freeze content publish and admin write operations.
2. Export current SQLite data to handoff snapshots.
3. Apply production schema migrations in the target database.
4. Load exported business data.
5. Load exported content data.
6. Validate:
   - latest content version
   - release state
   - admin action audit rows
   - user/session/order counts
7. Switch application environment variables to the production database provider.
8. Run runtime verification against the target environment.

## Provider Switch

- local/default:
  - `DB_PROVIDER=sqlite`
- target production:
  - reserve `DB_PROVIDER=postgres` or `DB_PROVIDER=mysql`
  - implement production connector before final cutover

## Business Data To Move

- users
- user_sessions
- user_topic_access
- learning_records
- quiz_attempts
- products
- orders

## Content Data To Move

- admin_content_actions
- content_versions
- content_release_state

## Cutover Validation Checklist

- active release version matches release state file
- published catalog path exists and checksum matches manifest
- admin role users can access admin endpoints
- learner users cannot access admin endpoints
- paid orders still map to granted topic access
