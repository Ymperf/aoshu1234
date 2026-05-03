import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ChickenRabbitMediaManifest, ChickenRabbitTimingPayload } from "@/lib/chicken-rabbit-demo";

const MEDIA_DIR = resolve(process.cwd(), "public", "media", "knowledge-points", "40601-demo");
const MANIFEST_PATH = resolve(MEDIA_DIR, "manifest.json");
const TIMING_PATH = resolve(MEDIA_DIR, "timing.json");

export function getChickenRabbitDemoMediaManifest(): ChickenRabbitMediaManifest | null {
  if (!existsSync(MANIFEST_PATH)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8")) as ChickenRabbitMediaManifest;
  } catch {
    return null;
  }
}

export function getChickenRabbitDemoTiming(): ChickenRabbitTimingPayload | null {
  if (!existsSync(TIMING_PATH)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(TIMING_PATH, "utf-8")) as ChickenRabbitTimingPayload;
  } catch {
    return null;
  }
}
