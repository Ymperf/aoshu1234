import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const versionTag = process.argv[2];

if (!versionTag) {
  throw new Error("Usage: node scripts/verify/check-release-version.mjs <versionTag>");
}

const manifestPath = `data/generated/content-releases/${versionTag}/release-manifest.json`;
const catalogPath = `data/generated/content-releases/${versionTag}/course-catalog.json`;

if (!existsSync(manifestPath)) {
  throw new Error(`Missing release manifest: ${manifestPath}`);
}

if (!existsSync(catalogPath)) {
  throw new Error(`Missing release catalog: ${catalogPath}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
const catalogRaw = readFileSync(catalogPath, "utf-8");
const catalogChecksum = createHash("sha256").update(catalogRaw.trimEnd()).digest("hex");

if (manifest.catalogChecksum !== catalogChecksum) {
  throw new Error(`Checksum mismatch for ${versionTag}`);
}

console.log(JSON.stringify({ versionTag, manifestPath, catalogPath, catalogChecksum, status: "ok" }, null, 2));
