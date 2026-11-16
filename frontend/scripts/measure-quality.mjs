import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { hostname, cpus, totalmem } from "node:os";
import pg from "pg";

assert.equal(
  process.env.STCS_TEST_ISOLATED,
  "1",
  "Requires explicit isolated-test mode",
);
const origin = "http://127.0.0.1:3300";
const database =
  "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/postgres";
const db = new pg.Client({ connectionString: database });
await db.connect();
try {
  const fixture = await db.query(
    "SELECT is_private_test,role FROM users WHERE email=$1",
    ["especialista.prueba01@stcs.test"],
  );
  assert.equal(
    fixture.rows[0]?.is_private_test,
    true,
    "Existing synthetic local fixture required; this script never seeds",
  );
  assert.equal(fixture.rows[0]?.role, "therapist");
} finally {
  await db.end();
}
try {
  await fetch(origin, { signal: AbortSignal.timeout(500) });
  throw new Error(
    "Port 3300 already in use; refusing to test an unknown server",
  );
} catch (error) {
  if (error.message.includes("already in use")) throw error;
}
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3300",
  ],
  {
    windowsHide: true,
    stdio: "ignore",
    env: {
      ...process.env,
      DATABASE_URL: database,
      DATABASE_SSL: "false",
      JWT_ACCESS_SECRET: randomBytes(32).toString("hex"),
      STCS_DEVICE_API_KEY: randomBytes(32).toString("hex"),
      STCS_TEST_ISOLATED: "1",
      STCS_MEDIA_STORAGE: "local",
      STCS_VOICE_URL: "",
      VERCEL_URL: "",
      SUPABASE_URL: "http://127.0.0.1:3399",
      SUPABASE_SECRET_KEY: "",
      SUPABASE_PUBLISHABLE_KEY: "isolated-no-provider",
    },
  },
);
let cookie;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const health = await (await fetch(origin + "/api/health")).json();
      if (health.testDatabase === "127.0.0.1:55432/postgres") {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(
    ready,
    "Server must confirm the exact local database before any login or measurement",
  );
  const login = await fetch(origin + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "especialista.prueba01@stcs.test",
      password: "Especialista123!",
    }),
  });
  assert.equal(login.status, 200);
  cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  const headers = { Cookie: cookie };
  assert.equal(
    (await fetch(origin + "/api/stcs/portal", { headers })).status,
    200,
  );
  const stages = [];
  for (const concurrency of [5, 10]) {
    const start = performance.now(),
      end = start + 15000;
    const durations = [];
    let errors = 0;
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        while (performance.now() < end) {
          const before = performance.now();
          try {
            const response = await fetch(origin + "/api/stcs/portal", {
              headers,
              signal: AbortSignal.timeout(5000),
            });
            await response.arrayBuffer();
            if (response.status !== 200) errors++;
          } catch {
            errors++;
          }
          durations.push(performance.now() - before);
          // Short think time bounds load on this single-machine lab.
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }),
    );
    durations.sort((a, b) => a - b);
    const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
    const errorRate = errors / durations.length;
    stages.push({
      concurrency,
      plannedDurationSeconds: 15,
      elapsedSeconds: (performance.now() - start) / 1000,
      requests: durations.length,
      errors,
      errorRate,
      p95Milliseconds: p95,
      passed: p95 <= 2000 && errorRate < 0.01,
    });
  }
  const report = {
    generatedAt: new Date().toISOString(),
    codeCommit: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    node: process.version,
    environment:
      "Loopback Next.js production build and disposable PostgreSQL; existing synthetic data; not a Vercel capacity test",
    machine: {
      cpuModel: cpus()[0]?.model,
      logicalCpus: cpus().length,
      totalMemoryBytes: totalmem(),
    },
    endpoint: "/api/stcs/portal",
    thresholds: { p95Milliseconds: 2000, maximumErrorRateExclusive: 0.01 },
    stages,
    limitations: [
      "One machine hosts load generator, server and database",
      "Warm authenticated read only; no uploads, synthesis or device fleet",
      "No production traffic or writes beyond isolated login/logout",
      "Threshold is a proposed engineering target, not stakeholder-approved",
    ],
  };
  await writeFile(
    "../docs/calidad/carga-local.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({ stages, passed: stages.every((s) => s.passed) }),
  );
  if (stages.some((s) => !s.passed)) process.exitCode = 1;
} finally {
  if (cookie)
    await fetch(origin + "/api/auth/logout", {
      method: "POST",
      headers: { Cookie: cookie },
    }).catch(() => {});
  server.kill();
}
