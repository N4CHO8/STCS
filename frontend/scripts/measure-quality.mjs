// Dedicated disposable database only; this runner never loads shared environment files.
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { cpus, totalmem } from "node:os";
import pg from "pg";
import bcrypt from "bcryptjs";
assert.equal(process.env.STCS_TEST_ISOLATED, "1");
const origin = "http://127.0.0.1:3300";
const database =
  "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/stcs_release_tests";
const db = new pg.Client({ connectionString: database, ssl: false });
const ids = [randomUUID(), randomUUID(), randomUUID()];
const email = "load-" + ids[0] + "@test.invalid",
  password = randomBytes(24).toString("base64url");
let server,
  cookie,
  created = false;
await db.connect();
try {
  try {
    await fetch(origin, { signal: AbortSignal.timeout(500) });
    throw Error("Port 3300 occupied; refusing an unknown server");
  } catch (e) {
    if (e.message.includes("occupied")) throw e;
  }
  server = spawn(
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
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const h = await (await fetch(origin + "/api/health")).json();
      if (h.testDatabase === "127.0.0.1:55432/stcs_release_tests") {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(
    ready,
    "Same isolated database must be confirmed before any fixture write",
  );
  const hash = await bcrypt.hash(password, 10);
  await db.query("BEGIN");
  try {
    await db.query(
      "INSERT INTO users(id,full_name,email,password_hash,role,is_private_test,credential_verified_at) VALUES($1,'Carga aislada',$2,$3,'therapist',TRUE,NOW()),($4,'Perfil carga',$5,$3,'child',TRUE,NULL)",
      [ids[0], email, hash, ids[1], "child-" + email],
    );
    await db.query(
      "INSERT INTO student_profiles(id,child_user_id,display_name,age,support_level,main_context,is_private_test) VALUES($1,$2,'Perfil carga',8,'Prueba','Prueba',TRUE)",
      [ids[2], ids[1]],
    );
    await db.query(
      "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at) VALUES($1,$2,'therapist',NOW())",
      [ids[0], ids[1]],
    );
    await db.query("COMMIT");
    created = true;
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
  const response = await fetch(origin + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200);
  cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  const stages = [];
  for (const concurrency of [5, 10]) {
    const start = performance.now(),
      end = start + 15000,
      durations = [];
    let errors = 0;
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        while (performance.now() < end) {
          const before = performance.now();
          try {
            const r = await fetch(origin + "/api/stcs/portal", {
              headers: { Cookie: cookie },
              signal: AbortSignal.timeout(5000),
            });
            const body = await r.json();
            if (!r.ok || body.data?.profiles?.length !== 1) errors++;
          } catch {
            errors++;
          }
          durations.push(performance.now() - before);
          await new Promise((r) => setTimeout(r, 50));
        }
      }),
    );
    durations.sort((a, b) => a - b);
    const p95 = durations[Math.ceil(durations.length * 0.95) - 1],
      errorRate = errors / durations.length;
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
    workingTreeDirty:
      execFileSync("git", ["status", "--porcelain"], {
        encoding: "utf8",
      }).trim().length > 0,
    environment:
      "Loopback Next production build and disposable stcs_release_tests; per-run owned fixture, one assigned profile, zero pictograms",
    node: process.version,
    machine: {
      cpuModel: cpus()[0]?.model,
      logicalCpus: cpus().length,
      totalMemoryBytes: totalmem(),
    },
    endpoint: "/api/stcs/portal",
    thresholds: { p95Milliseconds: 2000, maximumErrorRateExclusive: 0.01 },
    stages,
    limitations: [
      "Single workstation, authenticated reads only",
      "One profile without media; not a production volume or fleet test",
      "Engineering thresholds pending external approval",
    ],
  };
  await mkdir("../.codex-work/arreglos-locales-20261116", { recursive: true });
  await writeFile(
    "../.codex-work/arreglos-locales-20261116/carga-local.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({ stages, passed: stages.every((s) => s.passed) }),
  );
  if (stages.some((s) => !s.passed)) process.exitCode = 1;
} finally {
  try {
    if (cookie) {
      const r = await fetch(origin + "/api/auth/logout", {
        method: "POST",
        headers: { Cookie: cookie, Origin: origin },
      });
      assert.equal(r.status, 200);
    }
  } finally {
    server?.kill();
    try {
      if (created) {
        await db.query("DELETE FROM users WHERE id=ANY($1::uuid[])", [
          ids.slice(0, 2),
        ]);
        assert.equal(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM users WHERE id=ANY($1::uuid[])",
              [ids.slice(0, 2)],
            )
          ).rows[0].n,
          0,
        );
      }
    } finally {
      await db.end();
    }
  }
}
