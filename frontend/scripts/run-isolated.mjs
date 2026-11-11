// This runner only uses the disposable PostgreSQL container documented in docs/PRUEBAS.md.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
const env = {
  ...process.env,
  DATABASE_URL:
    "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/postgres",
  DATABASE_SSL: "false",
  JWT_ACCESS_SECRET: randomBytes(32).toString("hex"),
  STCS_DEVICE_API_KEY: "isolated-device-test",
  STCS_LEGACY_DEVICE_CODE: "STCS-ESP32-001",
  SUPABASE_URL: "http://127.0.0.1:3101",
  SUPABASE_PUBLISHABLE_KEY: "isolated-provider",
  STCS_TEST_URL: "http://127.0.0.1:3100",
  STCS_TEST_ISOLATED: "1",
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
await new Promise((resolve) => email.listen(3101, "127.0.0.1", resolve));
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  { env, stdio: "inherit" },
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
        "3102",
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
          await fetch("http://127.0.0.1:3102/login");
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
        const response = await fetch("http://127.0.0.1:3102" + url, {
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
  }
} finally {
  server.kill();
  email.close();
}
