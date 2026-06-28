import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // googleapis is a heavy Node-only package; keep it external to the bundler so
  // it is required at runtime on the server instead of being bundled.
  serverExternalPackages: ["googleapis"],
};

export default nextConfig;
