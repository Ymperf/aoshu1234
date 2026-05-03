import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const DEFAULT_BATCH_STATE_PATH = path.join(ROOT_DIR, "data", "generated", "video-batch", "video-batch-state.json");
const DEFAULT_FAMILY_STATE_PATH = path.join(ROOT_DIR, "data", "generated", "video-batch", "family-verification-state.json");
const DEFAULT_CANARY_MATRIX_PATH = path.join(ROOT_DIR, "data", "generated", "video-batch", "video-canary-matrix.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function parseArgs(argv) {
  const args = {
    batchStatePath: DEFAULT_BATCH_STATE_PATH,
    familyStatePath: DEFAULT_FAMILY_STATE_PATH,
    canaryMatrixPath: DEFAULT_CANARY_MATRIX_PATH,
    batchId: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const nextValue = argv[index + 1];
    if (!current.startsWith("--") || !nextValue || nextValue.startsWith("--")) {
      continue;
    }

    if (current === "--batch-state-path") {
      args.batchStatePath = path.resolve(nextValue);
    } else if (current === "--family-state-path") {
      args.familyStatePath = path.resolve(nextValue);
    } else if (current === "--canary-matrix-path") {
      args.canaryMatrixPath = path.resolve(nextValue);
    } else if (current === "--batch-id") {
      args.batchId = nextValue;
    } else {
      continue;
    }

    index += 1;
  }

  return args;
}

function assertFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${label}: ${filePath}`);
  }
}

function verifyReleaseVersion(versionTag) {
  const result = spawnSync(process.execPath, [path.join(ROOT_DIR, "scripts", "verify", "check-release-version.mjs"), versionTag], {
    cwd: ROOT_DIR,
    encoding: "utf-8",
    stdio: "pipe",
    env: process.env
  });

  if (result.status !== 0) {
    throw new Error(`Release verification failed for ${versionTag}: ${result.stderr || result.stdout}`);
  }

  return JSON.parse(result.stdout);
}

function pickTargetBatch(batchState, batchId) {
  if (batchId) {
    const batch = (batchState.batches ?? []).find((entry) => entry.batchId === batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }
    return batch;
  }

  const publishedBatches = (batchState.batches ?? []).filter((batch) =>
    (batch.items ?? []).some((item) => item.status === "published")
  );

  if (!publishedBatches.length) {
    throw new Error("No published video batches found.");
  }

  return [...publishedBatches].sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))[0];
}

function verifyItemArtifacts(item, batch) {
  const requiredPaths = [
    item.paths.teacherScriptPath,
    item.paths.spokenScriptPath,
    item.paths.audioPath,
    item.paths.timingPath,
    item.paths.videoPath,
    item.paths.posterPath,
    item.paths.manifestPath,
    item.paths.qaSummaryPath,
    item.paths.reviewSnapshotPath
  ];

  for (const filePath of requiredPaths) {
    assertFileExists(filePath, `artifact for ${item.knowledgePointId}`);
  }

  const qaSummary = readJson(item.paths.qaSummaryPath);
  const manifest = readJson(item.paths.manifestPath);
  if (!manifest.audioUrl || !manifest.videoUrl || !manifest.posterUrl) {
    throw new Error(`Manifest is incomplete for ${item.knowledgePointId}`);
  }
  const manualQaApproved = item.reviews?.qa?.decision === "approved";
  if (qaSummary.autoChecksPassed === false && !manualQaApproved) {
    throw new Error(`QA checks failed for ${item.knowledgePointId}`);
  }

  return {
    knowledgePointId: item.knowledgePointId,
    qaAutoChecksPassed: qaSummary.autoChecksPassed !== false,
    qaManuallyApproved: manualQaApproved,
    qaFrameCount: qaSummary.frameCount ?? 0,
    videoUrl: manifest.videoUrl,
    releaseVersionTag: batch.contentRelease?.versionTag ?? null
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  assertFileExists(args.batchStatePath, "video batch state");
  assertFileExists(args.familyStatePath, "family verification state");
  assertFileExists(args.canaryMatrixPath, "video canary matrix");

  const batchState = readJson(args.batchStatePath);
  const familyState = readJson(args.familyStatePath);
  const canaryMatrix = readJson(args.canaryMatrixPath);
  const batch = pickTargetBatch(batchState, args.batchId);
  const publishedItems = (batch.items ?? []).filter((item) => item.status === "published");

  if (!publishedItems.length) {
    throw new Error(`Batch ${batch.batchId} has no published items to verify.`);
  }

  const verifiedItems = publishedItems.map((item) => verifyItemArtifacts(item, batch));
  let releaseVerification = null;
  if (batch.contentRelease?.versionTag) {
    releaseVerification = verifyReleaseVersion(batch.contentRelease.versionTag);
  }

  console.log(
    JSON.stringify(
      {
        batchId: batch.batchId,
        publishedItemCount: publishedItems.length,
        verifiedItems,
        releaseVerification,
        familyVerificationSummary: familyState.summary,
        canaryMatrixSummary: canaryMatrix.canaryMatrix
          ? {
              totalFamilies: canaryMatrix.canaryMatrix.totalFamilies,
              totalRows: canaryMatrix.canaryMatrix.totalRows,
              activeRows: canaryMatrix.canaryMatrix.activeRows
            }
          : null,
        status: "ok"
      },
      null,
      2
    )
  );
}

main();
