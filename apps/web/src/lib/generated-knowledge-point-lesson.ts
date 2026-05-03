import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import type {
  KnowledgePointLessonMediaManifest,
  KnowledgePointLessonPackage,
  KnowledgePointLessonTimingPayload
} from "@/lib/knowledge-point-lesson";
import { getKnowledgePointMedia } from "@/lib/knowledge-point-media";

function getLessonPath(knowledgePointId: number) {
  return resolve(process.cwd(), "src", "lib", "generated-lessons", `${knowledgePointId}.json`);
}

function getMediaDir(knowledgePointId: number) {
  return resolve(process.cwd(), "public", "media", "knowledge-points", `${knowledgePointId}-demo`);
}

function getMediaFilePath(knowledgePointId: number, fileName: string) {
  return resolve(getMediaDir(knowledgePointId), fileName);
}

function appendAssetVersion(url: string | undefined, version: string | undefined) {
  if (!url || !version) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

export function getGeneratedKnowledgePointLesson(knowledgePointId: number): KnowledgePointLessonPackage | null {
  const lessonPath = getLessonPath(knowledgePointId);
  if (!existsSync(lessonPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(lessonPath, "utf-8")) as KnowledgePointLessonPackage;
  } catch {
    return null;
  }
}

export function getGeneratedKnowledgePointLessonMediaManifest(knowledgePointId: number): KnowledgePointLessonMediaManifest | null {
  const lessonPath = getLessonPath(knowledgePointId);
  const manifestPath = resolve(getMediaDir(knowledgePointId), "manifest.json");
  const timingPath = getMediaFilePath(knowledgePointId, "timing.json");
  const audioPath = getMediaFilePath(knowledgePointId, "lecture.mp3");
  const videoPath = getMediaFilePath(knowledgePointId, "lecture.mp4");
  const registeredMedia = getKnowledgePointMedia(knowledgePointId);

  let localManifest: KnowledgePointLessonMediaManifest | null = null;
  if (existsSync(manifestPath)) {
    try {
      localManifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as KnowledgePointLessonMediaManifest;
    } catch {
      localManifest = null;
    }
  }

  if (!localManifest && !registeredMedia) {
    return null;
  }

  const audioUrl = registeredMedia?.audioUrl ?? localManifest?.audioUrl;
  const videoUrl = registeredMedia?.videoUrl ?? localManifest?.videoUrl;
  const posterUrl = registeredMedia?.posterUrl ?? localManifest?.posterUrl;
  const lessonUpdatedAtMs = existsSync(lessonPath) ? statSync(lessonPath).mtimeMs : null;
  const mediaArtifacts = [
    { label: "timing", path: timingPath, required: Boolean(localManifest?.sceneTimingUrl ?? localManifest?.sentenceTimingUrl ?? audioUrl ?? videoUrl) },
    { label: "audio", path: audioPath, required: Boolean(audioUrl) },
    { label: "video", path: videoPath, required: Boolean(videoUrl) }
  ].filter((artifact) => artifact.required);
  const staleArtifacts =
    lessonUpdatedAtMs === null
      ? []
      : mediaArtifacts
          .filter((artifact) => !existsSync(artifact.path) || statSync(artifact.path).mtimeMs < lessonUpdatedAtMs)
          .map((artifact) => artifact.label);
  const mediaUpdatedAtMs =
    mediaArtifacts.length > 0
      ? Math.max(
          ...mediaArtifacts.map((artifact) => (existsSync(artifact.path) ? statSync(artifact.path).mtimeMs : 0))
        )
      : null;
  const isConsistent = staleArtifacts.length === 0;
  const assetVersion = localManifest?.generatedAt ?? (mediaUpdatedAtMs ? new Date(mediaUpdatedAtMs).toISOString() : undefined);

  return {
    generatedAt: localManifest?.generatedAt ?? "",
    audioUrl: isConsistent ? appendAssetVersion(audioUrl, assetVersion) : undefined,
    videoUrl: isConsistent ? appendAssetVersion(videoUrl, assetVersion) : undefined,
    posterUrl: appendAssetVersion(posterUrl, assetVersion),
    sentenceTimingUrl: appendAssetVersion(localManifest?.sentenceTimingUrl, assetVersion),
    wordTimingUrl: appendAssetVersion(localManifest?.wordTimingUrl, assetVersion),
    sceneTimingUrl: appendAssetVersion(localManifest?.sceneTimingUrl, assetVersion),
    audioDurationSec: localManifest?.audioDurationSec,
    hasVideo: Boolean(videoUrl) && isConsistent,
    hasAudio: Boolean(audioUrl) && isConsistent,
    isConsistent,
    inconsistencyReason: isConsistent ? undefined : `Media artifacts are older than lesson: ${staleArtifacts.join(", ")}`,
    lessonUpdatedAt: lessonUpdatedAtMs ? new Date(lessonUpdatedAtMs).toISOString() : undefined,
    mediaUpdatedAt: mediaUpdatedAtMs ? new Date(mediaUpdatedAtMs).toISOString() : undefined,
    staleArtifacts
  };
}

export function getGeneratedKnowledgePointLessonTiming(knowledgePointId: number): KnowledgePointLessonTimingPayload | null {
  const timingPath = resolve(getMediaDir(knowledgePointId), "timing.json");
  if (!existsSync(timingPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(timingPath, "utf-8")) as KnowledgePointLessonTimingPayload;
  } catch {
    return null;
  }
}
