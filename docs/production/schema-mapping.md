# Schema Mapping

## Business Schema

### users
- SQLite `TEXT` -> PostgreSQL `TEXT` / MySQL `VARCHAR(255)`
- Unique: `email`
- Primary key: `id`

### user_sessions
- SQLite `TEXT` -> PostgreSQL `TEXT` / MySQL `VARCHAR(255)`
- Primary key: `token`
- Foreign key: `user_id -> users.id`

### user_topic_access
- Composite primary key: `(user_id, topic_id)`

### learning_records
- Composite primary key: `(user_id, knowledge_point_id)`

### quiz_attempts
- Primary key: `id`

### products
- Primary key: `id`
- Unique: `topic_id`

### orders
- Primary key: `id`
- Suggested indexes:
  - `user_id`
  - `product_id`
  - `status`

## Content Schema

### admin_content_actions
- Primary key: `id`
- Suggested indexes:
  - `created_at`
  - `version_tag`
  - `result_status`

### content_versions
- Primary key: `version_tag`
- Suggested indexes:
  - `created_at`

### content_release_state
- Single row table
- Primary key fixed to `id = 1`

## Provider Notes

### PostgreSQL
- Prefer `TEXT` for ids and JSON payload strings.
- `metadata_json` can migrate to `JSONB`.
- target script entry:
  - `npm run db:import:postgres`

### MySQL
- Prefer `VARCHAR(255)` for ids and enum-like strings.
- `metadata_json` can migrate to `JSON`.
- target script entry:
  - `npm run db:import:mysql`
