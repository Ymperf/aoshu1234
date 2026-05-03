import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const MEDIA_METADATA_PATH = resolve(process.cwd(), "..", "..", "data", "generated", "app-state", "knowledge-point-media.json");

interface KnowledgePointMediaItem {
  id: number;
  lectureText?: string;
  audioUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
}

interface KnowledgePointMediaFile {
  knowledgePoints: KnowledgePointMediaItem[];
}

export function getKnowledgePointMedia(id: number): KnowledgePointMediaItem | null {
  if (!existsSync(MEDIA_METADATA_PATH)) {
    return null;
  }

  try {
    const payload = JSON.parse(readFileSync(MEDIA_METADATA_PATH, "utf-8")) as KnowledgePointMediaFile;
    if (!Array.isArray(payload.knowledgePoints)) {
      return null;
    }

    return payload.knowledgePoints.find((item) => item.id === id) ?? null;
  } catch {
    return null;
  }
}
