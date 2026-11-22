import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { randomUUID, createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";

assert.equal(process.env.STCS_TEST_ISOLATED, "1");
const root = resolve("..");
const raw = resolve(root, ".codex-work", "coverage-" + randomUUID());
const canonical = raw + "-canonical";
const reports = resolve(
  root,
  process.env.STCS_COVERAGE_REPORT_DIR ??
    "docs/pruebas/reportes/cobertura-negocio",
);
assert.ok(
  [
    resolve(root, ".codex-work") + sep,
    resolve(root, "docs/pruebas/reportes") + sep,
  ].some((prefix) => reports.startsWith(prefix)),
);
await Promise.all([
  mkdir(raw, { recursive: true }),
  mkdir(canonical, { recursive: true }),
  mkdir(reports, { recursive: true }),
]);
async function run(args, env = {}) {
  const code = await new Promise((done, reject) => {
    const child = spawn(process.execPath, args, {
      env: { ...process.env, ...env },
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", done);
  });
  assert.equal(code, 0, `Quality command failed: ${args[0]}`);
}
await run(["node_modules/next/dist/bin/next", "build", "--webpack"], {
  STCS_TEST_COVERAGE: "1",
});
await run(["scripts/run-isolated.mjs"], {
  STCS_TEST_DB: "stcs_release_tests",
  STCS_TEST_PORT: "3500",
  STCS_COVERAGE_DIR: raw,
});
let remapped = 0;
const inputs = [];
for (const name of await readdir(raw)) {
  if (!name.endsWith(".json")) continue;
  const buffer = await readFile(resolve(raw, name));
  inputs.push({
    file: name,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  });
  const coverage = JSON.parse(buffer);
  // Webpack uses virtual URLs. c8 needs real filesystem source names. Preserve
  // every V8 range/count and mappings/sourcesContent; only canonicalize own URLs.
  for (const entry of Object.values(coverage["source-map-cache"] ?? {})) {
    if (!entry.data?.sources) continue;
    entry.data.sources = entry.data.sources.map((source) => {
      const prefix = "webpack://stcs-frontend/";
      if (!source.startsWith(prefix)) return source;
      const target = resolve(source.slice(prefix.length));
      if (!target.startsWith(resolve("src") + sep) || !existsSync(target))
        return source;
      remapped++;
      return target.replaceAll("\\", "/");
    });
  }
  await writeFile(resolve(canonical, name), JSON.stringify(coverage));
}
await run([
  "node_modules/c8/bin/c8.js",
  "report",
  "--temp-directory",
  canonical,
  "--reports-dir",
  reports,
  "--reporter=text",
  "--reporter=json-summary",
  "--reporter=json",
  "--all",
  "--src",
  "src",
  "--include",
  "**/src/lib/server/**/*.ts",
  "--include",
  "**/src/app/api/**/*.ts",
  "--include",
  "**/src/proxy.ts",
  "--include",
  "**/src/lib/permissions.ts",
  "--include",
  "**/src/lib/media-contract.ts",
  "--include",
  "**/src/lib/history-contract.ts",
  "--exclude-after-remap",
  "--extension",
  ".ts",
]);
const summary = JSON.parse(
  await readFile(resolve(reports, "coverage-summary.json"), "utf8"),
);
const full = JSON.parse(
  await readFile(resolve(reports, "coverage-final.json"), "utf8"),
);
const portal = Object.entries(full).find(([name]) =>
  name.replaceAll("\\", "/").endsWith("/src/lib/server/portal.ts"),
)?.[1];
assert.ok(
  portal && Object.keys(portal.fnMap).length >= 4,
  "Reject source-map reports that lose portal function ranges",
);
const metadata = {
  generatedAt: new Date().toISOString(),
  codeCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  workingTreeDirty:
    execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()
      .length > 0,
  tool: "c8 9.1.0 / Node V8",
  scope:
    "All server modules, API route handlers, proxy.ts, permissions.ts, media-contract.ts and history-contract.ts",
  excluded: "UI, firmware and Python voice runtime; measured separately",
  sourceURLNormalizationOnly: true,
  remapped,
  inputs,
  lines: summary.total.lines,
  branches: summary.total.branches,
  functions: summary.total.functions,
  thresholdLines: 70,
  passed: summary.total.lines.pct >= 70,
};
await writeFile(
  resolve(reports, "metadatos.json"),
  JSON.stringify(metadata, null, 2) + "\n",
);
assert.ok(metadata.passed, "Business-source line coverage must reach 70%");
