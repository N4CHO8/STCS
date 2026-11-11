import pg from "pg";
import { readFileSync } from "node:fs";
import { rootCertificates } from "node:tls";
import nextEnv from "@next/env";
import { fileURLToPath } from "node:url";
import { provisionCloudDemo } from "./lib/cloud-demo.mjs";
import { CLOUD_DEMO_ACCOUNTS } from "../src/lib/cloud-demo-accounts.ts";

const args = process.argv.slice(2),
  project = "mvdjzjwidygmhvhfcpgg";
if (!args.includes("--apply")) {
  console.log(
    JSON.stringify({
      mode: "plan",
      project,
      accounts: CLOUD_DEMO_ACCOUNTS,
      children: 2,
      devices: 2,
      notes:
        "Creates only reserved demo records; preserves existing changes. Run with --apply --project-ref " +
        project,
    }),
  );
} else {
  if (args[args.indexOf("--project-ref") + 1] !== project)
    throw new Error("Explicit STCS project confirmation is required.");
  nextEnv.loadEnvConfig(fileURLToPath(new URL("../../", import.meta.url)));
  const url = new URL(process.env.DATABASE_URL);
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (
    local
      ? process.env.STCS_TEST_ISOLATED !== "1"
      : !`${url.hostname} ${url.username}`.includes(project)
  )
    throw new Error(
      "Database does not match the authorized STCS project or isolated test database.",
    );
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
    url.searchParams.delete(key);
  const db = new pg.Client({
    connectionString: url.toString(),
    ssl: local
      ? false
      : {
          rejectUnauthorized: true,
          ca: [
            ...rootCertificates,
            readFileSync(
              new URL("../certs/supabase-ca.crt", import.meta.url),
              "utf8",
            ),
          ],
        },
  });
  await db.connect();
  try {
    const result = await provisionCloudDemo(db);
    console.log(
      JSON.stringify({
        project,
        provisioned: true,
        existingRealDataUnchanged: result.existingRealDataUnchanged,
        accounts: result.accounts.map((a) => ({
          role: a.role,
          email: a.email,
        })),
        profiles: result.profileIds.length,
        devices: result.deviceIds.length,
      }),
    );
  } finally {
    await db.end();
  }
}
