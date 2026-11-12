import pg from "pg";
import { readFileSync } from "node:fs";
// Fixed disposable container endpoint. Never load the project's shared .env files here.
let db;
for (let attempt = 0; attempt < 30; attempt++) {
  const client = new pg.Client({
    connectionString:
      "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/postgres",
    ssl: false,
  });
  try {
    await client.connect();
    db = client;
    break;
  } catch (error) {
    await client.end().catch(() => undefined);
    if (attempt === 29) throw error;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
try {
  await db.query(
    "DO $$ BEGIN CREATE ROLE anon; EXCEPTION WHEN duplicate_object THEN NULL; END $$; DO $$ BEGIN CREATE ROLE authenticated; EXCEPTION WHEN duplicate_object THEN NULL; END $$",
  );
  await db.query(
    readFileSync(new URL("../../supabase/schema.sql", import.meta.url), "utf8"),
  );
  // The historical records/emotions tables predate the consolidated schema file.
  await db.query(
    `CREATE TABLE IF NOT EXISTS records(id UUID PRIMARY KEY,user_id UUID REFERENCES users(id),category TEXT,title TEXT,description TEXT,observed_at TIMESTAMP,created_at TIMESTAMP DEFAULT NOW());CREATE TABLE IF NOT EXISTS emotions(id UUID PRIMARY KEY,user_id UUID REFERENCES users(id),emotion TEXT,intensity INTEGER,note TEXT,recorded_at TIMESTAMP,created_at TIMESTAMP DEFAULT NOW())`,
  );
  for (const name of [
    "20261111163114_role_based_portal.sql",
    "20261111185152_audit_hardening.sql",
    "20261111202504_cloud_demo_accounts.sql",
    "20261112164531_private_device_profiles.sql",
  ])
    await db.query(
      readFileSync(
        new URL("../../supabase/migrations/" + name, import.meta.url),
        "utf8",
      ),
    );
  console.log(
    "Disposable local PostgreSQL prepared. No seed or production connection.",
  );
} finally {
  await db.end();
}
