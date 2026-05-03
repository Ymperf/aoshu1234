import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const outputDir = resolve("data", "exports", "content");
mkdirSync(outputDir, { recursive: true });

const db = new DatabaseSync(resolve("data", "databases", "content.sqlite"));
const tables = ["admin_content_actions", "content_versions", "content_release_state"];

for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  writeFileSync(resolve(outputDir, `${table}.json`), `${JSON.stringify(rows, null, 2)}\n`);
}

console.log(JSON.stringify({ outputDir, tables }, null, 2));
