import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import pg from "pg";

// Each independent browser case starts with its own rate-limit budget. This is
// test fixture cleanup, never a switch that disables rate limiting in the app.
export async function resetLoginLimits(request, accounts) {
  assert.equal(process.env.STCS_TEST_ISOLATED, "1");
  const health = await request.get("/api/health");
  assert.equal(
    (await health.json()).testDatabase,
    "127.0.0.1:55432/stcs_release_tests",
  );
  const emails = Object.values(accounts);
  assert.ok(emails.every((email) => /^e2e-.*@test\.invalid$/.test(email)));
  const db = new pg.Client({
    connectionString:
      "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/stcs_release_tests",
    ssl: false,
  });
  await db.connect();
  try {
    await db.query("DELETE FROM app_rate_limits WHERE key=ANY($1::text[])", [
      emails.map((email) =>
        createHash("sha256")
          .update("login:" + email)
          .digest("hex"),
      ),
    ]);
  } finally {
    await db.end();
  }
}
