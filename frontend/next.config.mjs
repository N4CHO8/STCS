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
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  // Coverage builds retain readable server ranges; production keeps defaults.
  ...(process.env.STCS_TEST_COVERAGE === "1"
    ? { experimental: { serverMinification: false, serverSourceMaps: true } }
    : {}),
  // Device APIs read immutable catalog pixels; CDN assets alone are not a function filesystem.
  outputFileTracingIncludes: {
    "/api/stcs/devices/**": ["./public/pictograms/*.png"],
  },
};

export default nextConfig;
