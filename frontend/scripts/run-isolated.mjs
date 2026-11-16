// This runner only uses the disposable PostgreSQL container documented in docs/PRUEBAS.md.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const testPort = Number(process.env.STCS_TEST_PORT ?? 3100);
assert.ok(Number.isInteger(testPort) && testPort >= 1024 && testPort <= 65000);
const testDb = process.env.STCS_TEST_DB ?? "postgres";
assert.ok(["postgres", "stcs_release_tests"].includes(testDb));
const mediaDir = await mkdtemp(join(tmpdir(), "stcs-isolated-media-"));
const coverageDir = process.env.STCS_COVERAGE_DIR;
if (coverageDir) {
  assert.ok(
    resolve(coverageDir).startsWith(
      resolve("../.codex-work") + (process.platform === "win32" ? "\\" : "/"),
    ),
  );
  await mkdir(coverageDir, { recursive: true });
}
const env = {
  ...process.env,
  DATABASE_URL: `postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/${testDb}`,
  DATABASE_SSL: "false",
  STCS_MEDIA_STORAGE: "local",
  STCS_VOICE_URL: "",
  VERCEL_URL: "",
  JWT_ACCESS_SECRET: randomBytes(32).toString("hex"),
  STCS_DEVICE_API_KEY: "isolated-device-test",
  STCS_LEGACY_DEVICE_CODE: "STCS-ESP32-001",
  SUPABASE_URL: `http://127.0.0.1:${testPort + 1}`,
  SUPABASE_PUBLISHABLE_KEY: "isolated-provider",
  STCS_TEST_URL: `http://127.0.0.1:${testPort}`,
  STCS_TEST_ISOLATED: "1",
  STCS_MEDIA_DIR: mediaDir,
  STCS_MEDIA_WORKER_KEY: "isolated-worker-key-never-used-in-cloud-123456",
  ...(coverageDir ? { NODE_V8_COVERAGE: resolve(coverageDir) } : {}),
};
// A local fake transport verifies error handling without sending email or creating Auth users.
const email = createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = JSON.parse(raw);
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/auth/v1/otp") {
    res.end("{}");
    return;
  }
  if (req.url === "/auth/v1/verify" && body.token === "123456") {
    res.end(
      JSON.stringify({
        user: {
          email: body.email,
          email_confirmed_at: new Date().toISOString(),
        },
      }),
    );
    return;
  }
  res.statusCode = 400;
  res.end("{}");
});
await new Promise((resolve) =>
  email.listen(testPort + 1, "127.0.0.1", resolve),
);
const server = spawn(
  process.execPath,
  [
    ...(coverageDir ? ["--require", "./scripts/coverage-preload.cjs"] : []),
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(testPort),
  ],
  { env, stdio: ["inherit", "inherit", "inherit", "ipc"] },
);
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(env.STCS_TEST_URL + "/api/health");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("Isolated server did not become healthy");
  const result = await new Promise((resolve) => {
    const test = spawn(process.execPath, ["scripts/verify-roles.mjs"], {
      env,
      stdio: "inherit",
    });
    test.on("exit", resolve);
  });
  process.exitCode = result ?? 1;
  if (result === 0) {
    const offline = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(testPort + 2),
      ],
      {
        env: {
          ...env,
          DATABASE_URL: "postgresql://postgres:unused@127.0.0.1:1/postgres",
        },
        stdio: "inherit",
      },
    );
    try {
      for (let i = 0; i < 60; i++) {
        try {
          await fetch(`http://127.0.0.1:${testPort + 2}/login`);
          break;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      const header = Buffer.from(
        JSON.stringify({ alg: "HS256", typ: "JWT" }),
      ).toString("base64url");
      const body = Buffer.from(
        JSON.stringify({
          sub: randomUUID(),
          sid: randomUUID(),
          exp: Math.floor(Date.now() / 1000) + 60,
        }),
      ).toString("base64url");
      const token = `${header}.${body}.${createHmac("sha256", env.JWT_ACCESS_SECRET).update(`${header}.${body}`).digest("base64url")}`;
      for (const url of ["/api/health", "/api/auth/me"]) {
        const response = await fetch(`http://127.0.0.1:${testPort + 2}` + url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(response.status, 503);
        await response.json();
      }
      console.log(
        "PASS: 2 database outage checks; health and authenticated requests return JSON 503.",
      );
    } finally {
      offline.kill();
    }
    const workerCheck = await new Promise((resolve, reject) => {
      const test = spawn(
        process.execPath,
        ["scripts/verify-media-worker.mjs"],
        { env, stdio: "inherit", windowsHide: true },
      );
      test.once("error", reject);
      test.once("exit", resolve);
    });
    assert.equal(workerCheck, 0, "Voice worker reconnection test failed");
  }
} finally {
  if (coverageDir && server.connected) {
    await new Promise((done) => {
      const timer = setTimeout(done, 2000);
      server.once("message", () => {
        clearTimeout(timer);
        done();
      });
      server.send("stcs-flush-coverage");
    });
  }
  server.kill();
  email.close();
  if (
    !resolve(mediaDir).startsWith(
      resolve(tmpdir()) + "\\stcs-isolated-media-",
    ) &&
    !resolve(mediaDir).startsWith(resolve(tmpdir()) + "/stcs-isolated-media-")
  )
    throw new Error("Unexpected cleanup path");
  await rm(mediaDir, { recursive: true, force: true });
}
