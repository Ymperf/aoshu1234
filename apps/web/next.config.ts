import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
  eslint: {
    // Linting is executed separately in a non-interactive step.
    ignoreDuringBuilds: true
  },
  experimental: {
    webpackBuildWorker: false,
    workerThreads: false
  }
};

export default nextConfig;
