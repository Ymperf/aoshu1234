import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const outputDir = resolve("data", "exports", "business");
mkdirSync(outputDir, { recursive: true });

const db = new DatabaseSync(resolve("data", "databases", "business.sqlite"));
const tables = ["users", "user_sessions", "user_topic_access", "learning_records", "quiz_attempts", "products", "orders"];

for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  writeFileSync(resolve(outputDir, `${table}.json`), `${JSON.stringify(rows, null, 2)}\n`);
}

console.log(JSON.stringify({ outputDir, tables }, null, 2));
