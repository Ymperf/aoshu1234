const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const webDir = path.join(rootDir, "apps", "web");
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const nextBuildDir = path.join(webDir, ".next");

if (fs.existsSync(nextBuildDir)) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(nextBuildDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      break;
    } catch (error) {
      if (attempt === 4) {
        throw error;
      }
    }
  }
}

const child = spawn(process.execPath, [nextBin, "build"], {
  cwd: webDir,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_DISABLE_WORKER_FARM: "1"
  }
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
