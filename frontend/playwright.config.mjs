import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  retries: 0,
  reporter: [
    ["list"],
    [
      "junit",
      {
        outputFile:
          process.env.STCS_E2E_JUNIT ?? "../docs/pruebas/reportes/e2e.xml",
      },
    ],
    ["json", { outputFile: "../.codex-work/e2e-results.json" }],
  ],
  outputDir: "../.codex-work/e2e-artifacts",
  use: {
    baseURL: "http://127.0.0.1:3400",
    browserName: process.env.STCS_E2E_BROWSER ?? "chromium",
    headless: true,
    trace: "retain-on-failure",
  },
});
