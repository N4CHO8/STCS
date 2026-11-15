// Explicit maintenance of existing messages only. No users, profiles, pictograms or events are created.
import assert from "node:assert/strict";
import pg from "pg";
import nextEnv from "@next/env";
import { rootCertificates } from "node:tls";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPABASE_CA } from "../src/lib/server/supabase-ca.ts";
import { MEDIA_VOICE } from "../src/lib/media-contract.ts";
nextEnv.loadEnvConfig(fileURLToPath(new URL("../../", import.meta.url)), false);
const args = process.argv.slice(2),
  device = args[args.indexOf("--device-code") + 1];
assert.equal(
  device,
  "STCS-ESP32-001",
  "This maintenance command is scoped to the existing STCS demonstration device",
);
const url = new URL(process.env.DATABASE_URL);
assert.ok(
  url.hostname.endsWith("pooler.supabase.com") &&
    decodeURIComponent(url.username).includes("mvdjzjwidygmhvhfcpgg"),
);
for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
  url.searchParams.delete(key);
const db = new pg.Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: true, ca: [...rootCertificates, SUPABASE_CA] },
});
await db.connect();
try {
  const scope = await db.query(
    "SELECT student_profile_id FROM devices WHERE device_code=$1",
    [device],
  );
  assert.equal(scope.rowCount, 1);
  const profile = scope.rows[0].student_profile_id;
  const count = Number(
    (
      await db.query(
        "SELECT count(*) FROM pictograms WHERE student_profile_id=$1 AND is_active=TRUE",
        [profile],
      )
    ).rows[0].count,
  );
  if (!args.includes("--apply")) {
    console.log(
      JSON.stringify({
        dryRun: true,
        existingPictograms: count,
        createsUsers: false,
        createsPictograms: false,
        createsEvents: false,
      }),
    );
  } else {
    const origin = new URL(args[args.indexOf("--origin") + 1]);
    assert.ok(
      origin.protocol === "https:" &&
        (origin.hostname === "0stcs0.vercel.app" ||
          /^frontend-[a-z0-9]+-nachobenegas-projects\.vercel\.app$/.test(
            origin.hostname,
          )),
    );
    const worker =
      process.env.STCS_MEDIA_WORKER_KEY ??
      JSON.parse(
        readFileSync(
          join(
            process.env.LOCALAPPDATA,
            "STCS-private",
            "release-cloud-config.json",
          ),
          "utf8",
        ),
      ).workerKey;
    assert.ok(worker.length >= 32);
    await db.query("BEGIN");
    try {
      await db.query("SET LOCAL lock_timeout='5s'");
      await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        profile,
      ]);
      const records = await db.query(
        "SELECT id,message FROM pictograms WHERE student_profile_id=$1 AND is_active=TRUE FOR UPDATE",
        [profile],
      );
      for (const record of records.rows) {
        const phrase = record.message.normalize("NFC").trim();
        const key = createHash("sha256")
          .update(JSON.stringify([MEDIA_VOICE, phrase]))
          .digest("hex");
        await db.query(
          "INSERT INTO phrase_audio(cache_key,phrase,voice) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
          [key, phrase, MEDIA_VOICE],
        );
        await db.query("UPDATE pictograms SET audio_key=$2 WHERE id=$1", [
          record.id,
          key,
        ]);
      }
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
    let prepared = 0;
    for (let i = 0; i < count + 3; i++) {
      const r = await fetch(origin.origin + "/api/internal/media-run", {
        method: "POST",
        headers: { "x-stcs-worker-key": worker },
        signal: AbortSignal.timeout(90000),
      });
      assert.equal(r.status, 200, "Cloud voice maintenance failed");
      if (!(await r.json()).prepared) break;
      prepared++;
      console.log("Existing voice prepared: " + prepared);
    }
    const result = await db.query(
      "SELECT a.status,count(*)::int AS n FROM pictograms p JOIN phrase_audio a ON a.cache_key=p.audio_key WHERE p.student_profile_id=$1 AND p.is_active=TRUE GROUP BY a.status",
      [profile],
    );
    console.log(
      JSON.stringify({
        existingPictograms: count,
        statuses: result.rows,
        cloudJobsPrepared: prepared,
        noClinicalEventsCreated: true,
      }),
    );
    assert.equal(
      result.rows.find((r) => r.status === "ready")?.n,
      count,
      "Not all existing voices are ready",
    );
  }
} finally {
  await db.end();
}
