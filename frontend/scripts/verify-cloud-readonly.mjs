// No fixtures, login, DDL or DML: verify the existing STCS Data API with an anonymous key.
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import nextEnv from "@next/env";
assert.equal(
  process.env.STCS_VERIFY_CLOUD_READONLY,
  "1",
  "Explicit read-only cloud verification required",
);
nextEnv.loadEnvConfig(resolve(".."));
const url = new URL(process.env.SUPABASE_URL);
assert.equal(url.origin, "https://mvdjzjwidygmhvhfcpgg.supabase.co");
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
assert.ok(
  key && !key.startsWith("sb_secret_"),
  "An anonymous/publishable key is required; privileged keys are never used",
);
if (!key.startsWith("sb_publishable_"))
  assert.equal(
    JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role,
    "anon",
  );
const read = (path) =>
  fetch(url.origin + path, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(15000),
  });
assert.equal(
  (await read("/auth/v1/settings")).status,
  200,
  "Verify the key before interpreting any denial as protection",
);
const columns = {
  users: "id",
  student_profiles: "id",
  devices: "id",
  device_events: "id",
  pictograms: "id",
  user_access: "actor_user_id",
  specialist_reports: "id",
  app_sessions: "id",
  app_rate_limits: "key",
  app_settings: "id",
  pictogram_images: "id",
  phrase_audio: "cache_key",
  records: "id",
  emotions: "id",
};
const checks = [];
for (const [table, column] of Object.entries(columns)) {
  const response = await read(
    "/rest/v1/" + table + "?select=" + column + "&limit=1",
  );
  const body = await response.json();
  const empty =
    response.status === 200 && Array.isArray(body) && body.length === 0;
  const denied =
    ([401, 403].includes(response.status) && body.code === "42501") ||
    (response.status === 401 && body.message === "Secret API key required");
  assert.ok(
    empty || denied,
    "Unexpected anonymous access result for " +
      table +
      " (HTTP " +
      response.status +
      "); no returned data is printed",
  );
  checks.push({
    table,
    status: response.status,
    result: empty ? "zero rows" : "permission denied",
  });
}
await mkdir("../.codex-work/arreglos-locales-20261116", { recursive: true });
await writeFile(
  "../.codex-work/arreglos-locales-20261116/supabase-readonly.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      project: "mvdjzjwidygmhvhfcpgg",
      scope:
        "Anonymous Data API GET of identifier columns only; no real identities selected, no writes",
      passed: true,
      checks,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "PASS: anonymous API cannot read any rows from " +
    checks.length +
    " STCS tables. Read-only, no data printed.",
);
