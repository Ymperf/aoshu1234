import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite");

const target = process.argv[2];
if (!target || !["business", "content"].includes(target)) {
  throw new Error("Usage: node scripts/db/migration-status.mjs <business|content>");
}

const dbPath = target === "business" ? "data/databases/business.sqlite" : "data/databases/content.sqlite";
const database = new DatabaseSync(dbPath);
database.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  );
`);

const rows = database.prepare("SELECT version, applied_at FROM schema_migrations ORDER BY version ASC").all();
console.log(JSON.stringify({ target, dbPath, appliedMigrations: rows }, null, 2));
