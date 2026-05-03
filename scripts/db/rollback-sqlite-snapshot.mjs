import { copyFileSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const target = process.argv[2];
const snapshotVersion = process.argv[3];

if (!target || !snapshotVersion || !["business", "content"].includes(target)) {
  throw new Error("Usage: node scripts/db/rollback-sqlite-snapshot.mjs <business|content> <snapshotVersion>");
}

const dbBase = target === "business" ? resolve("data/databases/business.sqlite") : resolve("data/databases/content.sqlite");
const snapshotDir = resolve("data/databases/_snapshots", target, snapshotVersion);

if (!existsSync(resolve(snapshotDir, "database.sqlite"))) {
  throw new Error(`Snapshot not found: ${snapshotDir}`);
}

rmSync(dbBase, { force: true });
rmSync(`${dbBase}-wal`, { force: true });
rmSync(`${dbBase}-shm`, { force: true });

copyFileSync(resolve(snapshotDir, "database.sqlite"), dbBase);
if (existsSync(resolve(snapshotDir, "database.sqlite-wal"))) {
  copyFileSync(resolve(snapshotDir, "database.sqlite-wal"), `${dbBase}-wal`);
}
if (existsSync(resolve(snapshotDir, "database.sqlite-shm"))) {
  copyFileSync(resolve(snapshotDir, "database.sqlite-shm"), `${dbBase}-shm`);
}

console.log(JSON.stringify({ target, restoredFrom: snapshotDir }, null, 2));
