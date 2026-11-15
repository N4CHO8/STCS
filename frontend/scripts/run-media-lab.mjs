// Explicit functional-test fixtures and local processes. Never loads .env or connects to Supabase.
import pg from "pg";
import bcrypt from "bcryptjs";
import { spawn } from "node:child_process";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isIP } from "node:net";
import { HARDWARE_DEMO_ACCOUNTS } from "./fixtures/hardware-demo-accounts.ts";
import { DEVICE_PICTOGRAM_ASSETS } from "../src/lib/pictogramCatalog.ts";
import { MEDIA_VOICE } from "../src/lib/media-contract.ts";
const root = fileURLToPath(new URL("../../", import.meta.url)),
  frontend = join(root, "frontend");
try {
  await fetch("http://127.0.0.1:3100/api/health", {
    signal: AbortSignal.timeout(1000),
  });
  throw new Error(
    "Port 3100 is already in use. Stop the existing server before starting the isolated lab.",
  );
} catch (error) {
  if (error.message.startsWith("Port 3100")) throw error;
}
const folder = join(
  process.env.LOCALAPPDATA ?? process.env.HOME,
  "STCS-private",
);
mkdirSync(folder, { recursive: true });
const configPath = join(folder, "hito3-local.json");
let config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, "utf8"))
  : {
      deviceKey: randomBytes(32).toString("hex"),
      workerKey: randomBytes(32).toString("hex"),
      jwtKey: randomBytes(32).toString("hex"),
      setupPassword: randomBytes(12).toString("base64url"),
    };
const deviceCode = "STCS-LAB-H3-001";
const db = new pg.Client({
  connectionString:
    "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/postgres",
  ssl: false,
});
await db.connect();
try {
  await db.query("BEGIN");
  const found = await db.query(
    "SELECT id,role,is_private_test FROM users WHERE email='perfil.hito3@local.test'",
  );
  if (
    found.rowCount &&
    (!found.rows[0].is_private_test || found.rows[0].role !== "child")
  )
    throw new Error("Local fixture conflict");
  const childId = found.rows[0]?.id ?? randomUUID();
  if (!found.rowCount)
    await db.query(
      "INSERT INTO users(id,full_name,email,password_hash,role,is_private_test) VALUES($1,'Luis','perfil.hito3@local.test',$2,'child',TRUE)",
      [childId, await bcrypt.hash(randomUUID(), 12)],
    );
  const p = await db.query(
    "SELECT id FROM student_profiles WHERE child_user_id=$1",
    [childId],
  );
  const profileId = p.rows[0]?.id ?? randomUUID();
  if (!p.rowCount)
    await db.query(
      "INSERT INTO student_profiles(id,child_user_id,display_name,age,support_level,main_context,sensitive_notes,is_private_test) VALUES($1,$2,'Luis',8,'Ficticio: sin evaluación clínica','Ensayo local Hito 3','Datos ficticios de ensayo local. Sin pacientes reales.',TRUE)",
      [profileId, childId],
    );
  for (const a of HARDWARE_DEMO_ACCOUNTS) {
    const current = await db.query(
      "SELECT id,role,is_private_test FROM users WHERE email=$1",
      [a.email],
    );
    if (
      current.rowCount &&
      (current.rows[0].role !== a.role || !current.rows[0].is_private_test)
    )
      throw new Error("Local account conflict");
    const id = current.rows[0]?.id ?? randomUUID();
    if (!current.rowCount)
      await db.query(
        "INSERT INTO users(id,full_name,email,password_hash,role,is_private_test) VALUES($1,$2,$3,$4,$5,TRUE)",
        [
          id,
          `Evaluación ${a.role}`,
          a.email,
          await bcrypt.hash(a.password, 12),
          a.role,
        ],
      );
    await db.query(
      "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at) VALUES($1,$2,$3,NOW()) ON CONFLICT DO NOTHING",
      [id, childId, a.role],
    );
  }
  const admin = await db.query(
    "SELECT id FROM users WHERE email='admin.evaluacion@local.test'",
  );
  if (!admin.rowCount)
    await db.query(
      "INSERT INTO users(id,full_name,email,password_hash,role,credential_verified_at) VALUES($1,'Administrador de ensayo local','admin.evaluacion@local.test',$2,'admin',NOW())",
      [randomUUID(), await bcrypt.hash("AdminHito3-123!", 12)],
    );
  const device = await db.query(
    "SELECT id,student_profile_id,api_key_hash FROM devices WHERE device_code=$1",
    [deviceCode],
  );
  const keyHash = createHash("sha256").update(config.deviceKey).digest("hex");
  if (
    device.rowCount &&
    (device.rows[0].student_profile_id !== profileId ||
      device.rows[0].api_key_hash !== keyHash)
  )
    throw new Error("Local device conflict");
  if (!device.rowCount)
    await db.query(
      "INSERT INTO devices(id,student_profile_id,device_code,name,power_source,api_key_hash) VALUES($1,$2,$3,'Comunicador de ensayo local','usb',$4)",
      [randomUUID(), profileId, deviceCode, keyHash],
    );
  if (!p.rowCount) {
    for (const item of DEVICE_PICTOGRAM_ASSETS.filter((a) =>
      [1, 5, 9, 13].includes(a.position),
    )) {
      const key = createHash("sha256")
        .update(
          JSON.stringify([MEDIA_VOICE, item.message.normalize("NFC").trim()]),
        )
        .digest("hex");
      await db.query(
        "INSERT INTO phrase_audio(cache_key,phrase,voice) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
        [key, item.message, MEDIA_VOICE],
      );
      await db.query(
        "INSERT INTO pictograms(id,student_profile_id,label,message,category,color_tone,icon_name,image_path,position,audio_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [
          randomUUID(),
          profileId,
          item.label,
          item.message,
          item.category,
          item.colorTone,
          item.iconName,
          item.imagePath,
          item.position,
          key,
        ],
      );
    }
  }
  config = { ...config, profileId, childId, deviceCode };
  await db.query("COMMIT");
  writeFileSync(configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
} catch (e) {
  await db.query("ROLLBACK");
  throw e;
} finally {
  await db.end();
}
const host = process.env.STCS_LAB_HOST;
if (host) {
  if (
    isIP(host) !== 4 ||
    !/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(host)
  )
    throw new Error("Set a private LAN IPv4 address for the physical device");
  writeFileSync(
    join(folder, "hito3-network.h"),
    `#pragma once\n#define STCS_API_BASE_URL "http://${host}:3100"\n#define STCS_DEVICE_CODE "${deviceCode}"\n#define STCS_DEVICE_API_KEY "${config.deviceKey}"\n#define STCS_WIFI_SETUP_PASSWORD "${config.setupPassword}"\n#define STCS_ALLOW_INSECURE_HTTP 1\n`,
    { mode: 0o600 },
  );
}
const env = {
  ...process.env,
  DATABASE_URL:
    "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/postgres",
  DATABASE_SSL: "false",
  JWT_ACCESS_SECRET: config.jwtKey,
  STCS_MEDIA_WORKER_KEY: config.workerKey,
  STCS_MEDIA_DIR: join(folder, "hito3-media"),
  STCS_MEDIA_STORAGE: "local",
  STCS_VOICE_URL: "",
  VERCEL_URL: "",
  SUPABASE_URL: "http://127.0.0.1:3199",
  SUPABASE_PUBLISHABLE_KEY: "isolated-lab-no-email-provider",
  SUPABASE_SECRET_KEY: "",
  STCS_TEST_ISOLATED: "1",
  STCS_WORKER_URL: "http://127.0.0.1:3100",
  STCS_TTS_PYTHON:
    process.env.STCS_TTS_PYTHON ??
    join(root, ".codex-work", "tts-env", "Scripts", "python.exe"),
  STCS_TTS_MODEL:
    process.env.STCS_TTS_MODEL ??
    join(
      process.env.LOCALAPPDATA,
      "STCS-tools",
      "piper-voice",
      "es_ES-davefx-medium.onnx",
    ),
};
if (!existsSync(env.STCS_TTS_MODEL) || !existsSync(env.STCS_TTS_PYTHON))
  throw new Error(
    "Prepare Piper and its voice as documented before starting the local lab",
  );
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "0.0.0.0",
    "--port",
    "3100",
  ],
  { cwd: frontend, env, stdio: "inherit", windowsHide: true },
);
let worker;
function stop() {
  worker?.kill();
  server.kill();
}
process.once("SIGINT", () => {
  stop();
  process.exit(0);
});
process.once("SIGTERM", () => {
  stop();
  process.exit(0);
});
process.once("exit", stop);
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch("http://127.0.0.1:3100/api/health");
      const health = await r.json();
      if (r.ok && health.testDatabase === "127.0.0.1:55432/postgres") {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!ready) throw new Error("Local lab did not start");
  worker = spawn(process.execPath, ["scripts/media-worker.mjs", "--watch"], {
    cwd: frontend,
    env,
    stdio: "inherit",
    windowsHide: true,
  });
  console.log(
    "Local Hito 3 lab ready: http://localhost:3100/login; synthetic data only. No production changes.",
  );
  await new Promise((resolve, reject) => {
    server.once("exit", resolve);
    server.once("error", reject);
  });
} finally {
  stop();
}
