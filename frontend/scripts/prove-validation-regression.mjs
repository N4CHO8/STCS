import { mkdtemp, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import assert from "node:assert/strict";

// Mutate a disposable source copy, never the real validator or the running app.
const folder = await mkdtemp(join(tmpdir(), "stcs-mutant-"));
try {
  for (const path of ["scripts/test-typescript.mjs", "tests/validation.test.mjs", "src/lib/server/validation.ts", "src/lib/permissions.ts", "src/lib/media-contract.ts", "src/lib/pictogramCatalog.ts", "src/lib/additionalPictograms.json"]) {
    await mkdir(dirname(join(folder, path)), { recursive: true });
    await cp(path, join(folder, path));
  }
  const target = join(folder, "src/lib/server/validation.ts");
  const original = await readFile(target, "utf8");
  const guard = "Buffer.byteLength(label) > 31 || Buffer.byteLength(message) > 95";
  assert.ok(original.includes(guard));
  await writeFile(target, original.replace(guard, "false"));
  const result = spawnSync(process.execPath, ["--import", "./scripts/test-typescript.mjs", "--test", "--test-reporter=spec", "tests/validation.test.mjs"], { cwd: folder, encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 1, "Removing UTF-8 protection must make the tests fail");
  assert.match(result.stdout + result.stderr, /CP-RF03-U02/);
  await writeFile("../docs/pruebas/reportes/regresion.json", JSON.stringify({ generatedAt: new Date().toISOString(), codeCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), mutation: "Disabled UTF-8 byte-length guard in a temporary copy only", expected: "CP-RF03-U02 fails", exitCode: result.status, detected: true, originalSourceChanged: false, productionAccess: false }, null, 2) + "\n");
  console.log("PASS: removing the UTF-8 protection in a disposable copy is detected by CP-RF03-U02");
} finally {
  // The path originates from mkdtemp under the OS temporary directory.
  await rm(folder, { recursive: true, force: true });
}
