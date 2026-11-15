import nextEnv from "@next/env";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(
  resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  process.env.NODE_ENV !== "production",
  console,
  true,
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Device APIs read immutable catalog pixels; CDN assets alone are not a function filesystem.
  outputFileTracingIncludes: {
    "/api/stcs/devices/**": ["./public/pictograms/*.png"],
  },
};

export default nextConfig;
