import assert from "node:assert/strict";
import { authenticatedDast } from "./lib/authenticated-dast.mjs";
import { spawn } from "node:child_process";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { join, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import pg from "pg";
import bcrypt from "bcryptjs";
import { DEVICE_PICTOGRAM_ASSETS } from "../src/lib/pictogramCatalog.ts";

assert.equal(process.env.STCS_TEST_ISOLATED, "1");
const origin = "http://127.0.0.1:3400";
const connectionString =
  "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/stcs_release_tests";
const dast = process.argv.includes("--dast");
const review = process.argv.includes("--review");
assert.ok(
  !process.argv.includes("--dast-only") || process.argv.includes("--dast-auth"),
);
const folder = await mkdtemp(join(tmpdir(), "stcs-web-quality-"));
const db = new pg.Client({ connectionString, ssl: false });
const ids = Array.from({ length: 6 }, () => randomUUID());
const profiles = [randomUUID(), randomUUID()];
const roles = ["therapist", "teacher", "guardian", "admin", "child", "child"];
const marker = "e2e-" + randomUUID();
const password = "Pruebas-Aisladas-123!";
const accounts = Object.fromEntries(
  roles
    .slice(0, 4)
    .map((role, i) => [
      role,
      review
        ? `${["especialista", "docente", "apoderado", "admin"][i]}.revision@stcs.test`
        : `${marker}-${i}@test.invalid`,
    ]),
);
const fixture = {
  profiles,
  accounts,
  password,
  imagePath: DEVICE_PICTOGRAM_ASSETS[0].imagePath,
  label: "Ensayo " + marker.slice(4, 12),
  phrase: marker + " quiero agua",
};
const fixtureFile = join(folder, "fixture.json");
await writeFile(fixtureFile, JSON.stringify(fixture));
await mkdir("../docs/calidad/dast", { recursive: true });
await mkdir("../.codex-work", { recursive: true });
try {
  await fetch(origin, { signal: AbortSignal.timeout(500) });
  throw new Error("Port 3400 is occupied; refusing an unknown server");
} catch (error) {
  if (error.message.includes("occupied")) throw error;
}
const log = createWriteStream("../.codex-work/web-quality-server.log");
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    dast || review || process.argv.includes("--dast-auth")
      ? "0.0.0.0"
      : "127.0.0.1",
    "--port",
    "3400",
  ],
  {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
      DATABASE_SSL: "false",
      STCS_TEST_ISOLATED: "1",
      JWT_ACCESS_SECRET: randomBytes(32).toString("hex"),
      STCS_DEVICE_API_KEY: randomBytes(32).toString("hex"),
      STCS_MEDIA_STORAGE: "local",
      STCS_MEDIA_DIR: join(folder, "media"),
      STCS_VOICE_URL: "",
      STCS_MEDIA_WORKER_KEY: "isolated-worker-key-never-used-in-cloud-123456",
      VERCEL_URL: "",
      SUPABASE_URL: "http://127.0.0.1:3399",
      SUPABASE_PUBLISHABLE_KEY: "isolated-no-provider",
      SUPABASE_SECRET_KEY: "",
    },
  },
);
server.stdout.pipe(log);
server.stderr.pipe(log);
async function run(command, args, env) {
  return await new Promise((done, reject) => {
    const child = spawn(command, args, {
      env: env ?? process.env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code) => done(code ?? 1));
  });
}
let connected = false,
  created = false;
try {
  let healthy = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(origin + "/api/health");
      const health = await r.json();
      if (
        r.ok &&
        health.testDatabase === "127.0.0.1:55432/stcs_release_tests"
      ) {
        healthy = true;
        break;
      }
    } catch {}
    await new Promise((done) => setTimeout(done, 500));
  }
  assert.ok(
    healthy,
    "The server must confirm the same isolated database before fixture writes",
  );
  await db.connect();
  connected = true;
  assert.equal(
    (await db.query("SELECT COUNT(*)::int AS n FROM users")).rows[0].n,
    0,
    "Use the empty disposable release-tests database; never overwrite existing fixtures",
  );
  await db.query("BEGIN");
  try {
    const hash = await bcrypt.hash(password, 10);
    for (let i = 0; i < roles.length; i++)
      await db.query(
        "INSERT INTO users(id,full_name,email,password_hash,role,credential_verified_at) VALUES($1,$2,$3,$4,$5,NOW())",
        [
          ids[i],
          i >= 4
            ? `Prueba${i === 4 ? "A" : "B"} ApellidoReservado`
            : `Adulto E2E ${roles[i]}`,
          i < 4 ? accounts[roles[i]] : `${marker}-${i}@test.invalid`,
          hash,
          roles[i],
        ],
      );
    for (let i = 0; i < 2; i++)
      await db.query(
        "INSERT INTO student_profiles(id,child_user_id,display_name,age,support_level,main_context,sensitive_notes) VALUES($1,$2,$3,8,'APOYO_PRIVADO','CONTEXTO_PRIVADO','NOTA_PRIVADA_E2E')",
        [
          profiles[i],
          ids[i + 4],
          `Prueba${i === 0 ? "A" : "B"} ApellidoReservado`,
        ],
      );
    for (const [actor, child] of [
      [0, 0],
      [0, 1],
      [1, 0],
      [2, 0],
    ])
      await db.query(
        "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at) VALUES($1,$2,$3,NOW())",
        [ids[actor], ids[child + 4], roles[actor]],
      );
    const asset = DEVICE_PICTOGRAM_ASSETS[0];
    await db.query(
      "INSERT INTO pictograms(id,student_profile_id,label,message,category,color_tone,icon_name,image_path,position) VALUES($1,$2,$3,$4,$5,$6,$7,$8,1)",
      [
        randomUUID(),
        profiles[0],
        asset.label,
        asset.message,
        asset.category,
        asset.colorTone,
        asset.iconName,
        asset.imagePath,
      ],
    );
    await db.query(
      "INSERT INTO specialist_reports(id,student_profile_id,author_user_id,diagnosis,teacher_guidance) VALUES($1,$2,$3,'DIAGNOSTICO_PRIVADO','ORIENTACION_PERMITIDA')",
      [randomUUID(), profiles[0], ids[0]],
    );
    await db.query("COMMIT");
    created = true;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
  let e2eCode = 0;
  if (review) {
    for (let i = 0; i < 2; i++) {
      const device = randomUUID();
      await db.query(
        "INSERT INTO devices(id,student_profile_id,device_code,name,api_key_hash) VALUES($1,$2,$3,'Equipo ficticio',$4)",
        [
          device,
          profiles[i],
          "LOCAL-REVIEW-" + device,
          createHash("sha256").update(randomBytes(32)).digest("hex"),
        ],
      );
      await db.query(
        `INSERT INTO device_events(id,device_id,student_profile_id,event_type,action_label,context,payload) VALUES($1,$2,$3,'navigation','Evento ficticio de laboratorio','Laboratorio','{"source":"esp32-device"}')`,
        [randomUUID(), device, profiles[i]],
      );
    }
    const accessFile = resolve("../.codex-work/review-access.json");
    await writeFile(
      accessFile,
      JSON.stringify(
        {
          origin,
          accounts,
          password,
          profiles,
          scope: "Isolated synthetic local lab; not the real ESP or production",
        },
        null,
        2,
      ),
    );
    console.log(
      "REVIEW LAB READY on port 3400; synthetic access details in " +
        accessFile,
    );
    console.log("Press Ctrl+C to stop and remove only this run's fixtures.");
    await new Promise((done) => {
      process.once("SIGINT", done);
      process.once("SIGTERM", done);
    });
  } else if (!process.argv.includes("--dast-only")) {
    e2eCode = await run(
      process.execPath,
      [
        "node_modules/playwright/cli.js",
        "test",
        "--config=playwright.config.mjs",
      ],
      { ...process.env, STCS_E2E_FIXTURE_FILE: fixtureFile },
    );
  }
  if (dast) {
    const code = await run("docker", [
      "run",
      "--rm",
      "-v",
      `${resolve("../docs/calidad/dast")}:/zap/wrk:rw`,
      "ghcr.io/zaproxy/zaproxy@sha256:9624669db72f54d86c4b46a7064518bd9bf79d8c61a4c31befa9923489f328af",
      "zap-baseline.py",
      "-t",
      "http://host.docker.internal:3400",
      "-m",
      "1",
      "-T",
      "3",
      "-J",
      "zap.json",
      "-r",
      "zap.html",
    ]);
    console.log(
      `ZAP baseline exit=${code}; 2 means warnings, not proof of exploit or a clean scan`,
    );
    if (![0, 2].includes(code)) process.exitCode = 1;
  }
  if (process.argv.includes("--dast-auth"))
    await authenticatedDast({ origin, accounts, password, profiles });
  if (e2eCode !== 0) process.exitCode = 1;
  if (!review)
    assert.equal(
      (
        await db.query(
          "SELECT COUNT(*)::int AS n FROM device_events WHERE student_profile_id=ANY($1::uuid[])",
          [profiles],
        )
      ).rows[0].n,
      0,
      "Editing the board must not invent child activity",
    );
} finally {
  let cleaned = !created;
  try {
    if (connected) {
      if (created) {
        await db.query(
          "DELETE FROM specialist_reports WHERE author_user_id=ANY($1::uuid[])",
          [ids],
        );
        await db.query(
          "DELETE FROM pictogram_images WHERE student_profile_id=ANY($1::uuid[])",
          [profiles],
        );
        await db.query("DELETE FROM users WHERE id=ANY($1::uuid[])", [ids]);
        await db.query("DELETE FROM phrase_audio WHERE phrase LIKE $1", [
          marker + "%",
        ]);
        const limitKeys = Object.values(accounts).map((email) =>
          createHash("sha256")
            .update("login:" + email)
            .digest("hex"),
        );
        await db.query(
          "DELETE FROM app_rate_limits WHERE key=ANY($1::text[])",
          [limitKeys],
        );
        cleaned = true;
      }
    }
  } finally {
    if (connected) await db.end();
    server.kill();
    log.end();
    assert.ok(
      resolve(folder).startsWith(resolve(tmpdir()) + sep + "stcs-web-quality-"),
    );
    if (cleaned) await rm(folder, { recursive: true, force: true });
    else
      console.error(
        "Isolated fixture metadata retained for recovery; cleanup did not finish.",
      );
  }
}
