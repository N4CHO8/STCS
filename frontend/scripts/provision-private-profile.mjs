import pg from "pg";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { randomBytes } from "node:crypto";
import { rootCertificates } from "node:tls";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { provisionPrivateProfile } from "./lib/private-profile.mjs";

const project = "mvdjzjwidygmhvhfcpgg",
  args = process.argv.slice(2);
if (!args.includes("--apply")) {
  console.log(
    "Plan: link existing STCS-ESP32-001 to private test profile Luis; create three private adults. No events or clinical reports. Requires --apply --project-ref " +
      project,
  );
} else {
  if (args[args.indexOf("--project-ref") + 1] !== project)
    throw new Error("Explicit STCS project confirmation is required.");
  nextEnv.loadEnvConfig(fileURLToPath(new URL("../../", import.meta.url)));
  const url = new URL(process.env.DATABASE_URL);
  if (!`${url.hostname} ${url.username}`.includes(project))
    throw new Error(
      "This maintenance command only targets the explicitly authorized STCS project.",
    );
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
    url.searchParams.delete(key);
  const folder = join(process.env.LOCALAPPDATA ?? homedir(), "STCS-private");
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const credentialsPath = join(folder, "accesos-prueba01.json");
  if (!existsSync(credentialsPath)) {
    const config = {
      name: "Luis",
      childEmail: "perfil.prueba01@stcs.test",
      deviceCode: "STCS-ESP32-001",
      accounts: [
        {
          role: "therapist",
          fullName: "Especialista de prueba A",
          email: "especialista.prueba01@stcs.test",
        },
        {
          role: "teacher",
          fullName: "Docente de prueba A",
          email: "docente.prueba01@stcs.test",
        },
        {
          role: "guardian",
          fullName: "Apoderado de prueba A",
          email: "apoderado.prueba01@stcs.test",
        },
      ].map((a) => ({ ...a, password: randomBytes(24).toString("base64url") })),
    };
    writeFileSync(credentialsPath, JSON.stringify(config, null, 2), {
      flag: "wx",
      mode: 0o600,
    });
  }
  const config = JSON.parse(readFileSync(credentialsPath, "utf8"));
  const db = new pg.Client({
    connectionString: url.toString(),
    ssl: {
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
    const result = await provisionPrivateProfile(db, config);
    console.log(
      JSON.stringify({
        provisioned: true,
        created: result.created,
        profileId: result.profileId,
        credentialsPath,
        accounts: result.accounts.map((a) => ({
          role: a.role,
          email: a.email,
        })),
        historicalEventsPreserved: true,
        noSyntheticActivity: true,
      }),
    );
  } finally {
    await db.end();
  }
}
