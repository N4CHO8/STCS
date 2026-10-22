import nextEnv from "@next/env";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(
  resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  process.env.NODE_ENV !== "production",
  console,
  true
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default nextConfig;
