// Restore only our own synthetic fixture into a new disposable local database.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  copyFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { performance } from "node:perf_hooks";
import pg from "pg";
import bcrypt from "bcryptjs";
import sharp from "sharp";

assert.equal(process.env.STCS_TEST_ISOLATED, "1");
const source = new pg.Client({
  connectionString:
    "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/stcs_release_tests",
  ssl: false,
});
const targetName = "stcs_restore_" + randomUUID().replaceAll("-", "");
assert.match(targetName, /^stcs_restore_[a-f0-9]{32}$/);
const target = new pg.Client({
  connectionString:
    "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/" + targetName,
  ssl: false,
});
const ids = Array.from({ length: 7 }, () => randomUUID()),
  hash = (b) => createHash("sha256").update(b).digest("hex");
const directory = await mkdtemp(join(tmpdir(), "stcs-recovery-"));
let sourceConnected = false,
  created = false,
  targetCreated = false,
  targetConnected = false,
  report;
try {
  await source.connect();
  sourceConnected = true;
  assert.equal(
    (await source.query("SELECT count(*)::int AS n FROM users")).rows[0].n,
    0,
    "Recovery requires the empty disposable release-tests database; never dump real/shared data",
  );
  const png = await sharp({
    create: { width: 96, height: 96, channels: 3, background: "#0000ff" },
  })
    .png()
    .toBuffer();
  const rgb = Buffer.alloc(18432);
  for (let i = 0; i < rgb.length; i += 2) rgb.writeUInt16LE(31, i);
  const wav = Buffer.alloc(3244);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(16000, 24);
  wav.writeUInt32LE(32000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(wav.length - 44, 40);
  const audioKey = hash(Buffer.from(ids[0])),
    passwordHash = await bcrypt.hash("Recovery-Isolated-123!", 10);
  const files = { "picture.png": png, "picture.rgb": rgb, "phrase.wav": wav };
  for (const folder of ["original", "backup", "restored"])
    await mkdir(join(directory, folder));
  for (const [name, bytes] of Object.entries(files))
    await writeFile(join(directory, "original", name), bytes);
  await source.query("BEGIN");
  try {
    await source.query(
      "INSERT INTO users(id,full_name,email,password_hash,role,is_private_test,credential_verified_at) VALUES($1,'Adulto ficticio',$2,$3,'therapist',TRUE,NOW()),($4,'Perfil ficticio',$5,$3,'child',TRUE,NULL)",
      [
        ids[0],
        ids[0] + "@test.invalid",
        passwordHash,
        ids[1],
        ids[1] + "@test.invalid",
      ],
    );
    await source.query(
      "INSERT INTO student_profiles(id,child_user_id,display_name,age,support_level,main_context,is_private_test) VALUES($1,$2,'Perfil ficticio',8,'Prueba','Prueba',TRUE)",
      [ids[2], ids[1]],
    );
    await source.query(
      "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at) VALUES($1,$2,'therapist',NOW())",
      [ids[0], ids[1]],
    );
    await source.query(
      "INSERT INTO devices(id,student_profile_id,device_code,name,api_key_hash) VALUES($1,$2,$3,'Equipo ficticio',$4)",
      [ids[3], ids[2], "recovery-" + ids[3], hash(randomBytes(32))],
    );
    await source.query(
      "INSERT INTO phrase_audio(cache_key,phrase,voice,status,object_key,sha256,byte_size) VALUES($1,'Ensayo de recuperación','fixture','ready','phrase.wav',$2,$3)",
      [audioKey, hash(wav), wav.length],
    );
    await source.query(
      "INSERT INTO pictogram_images(id,student_profile_id,png_key,rgb_key,rgb_sha256,png_bytes) VALUES($1,$2,'picture.png','picture.rgb',$3,$4)",
      [ids[4], ids[2], hash(rgb), png.length],
    );
    await source.query(
      "INSERT INTO pictograms(id,student_profile_id,label,message,category,color_tone,icon_name,image_path,audio_key) VALUES($1,$2,'Recuperación','Ensayo de recuperación','Necesidades','blue','GlassWater',$3,$4)",
      [ids[5], ids[2], "/api/stcs/images/" + ids[4], audioKey],
    );
    await source.query(
      "INSERT INTO device_events(id,device_id,student_profile_id,pictogram_id,event_type,action_label,context,external_event_id,payload) VALUES($1,$2,$3,$4,'pictogram_selected','Ensayo','Laboratorio',$5,'{\"source\":\"esp32-device\"}')",
      [ids[6], ids[3], ids[2], ids[5], ids[6]],
    );
    await source.query(
      "UPDATE student_profiles SET usage_started_on='2020-01-02',board_selection=$2::jsonb WHERE id=$1",
      [
        ids[2],
        JSON.stringify({ categories: ["Necesidades"], pictogramIds: [ids[5]] }),
      ],
    );
    const teacherId = randomUUID();
    await source.query(
      "INSERT INTO users(id,full_name,email,password_hash,role,is_private_test) VALUES($1,'Docente ficticio',$2,$3,'teacher',TRUE)",
      [teacherId, teacherId + "@test.invalid", passwordHash],
    );
    ids.push(teacherId);
    await source.query(
      "INSERT INTO communication_observations(id,student_profile_id,author_user_id,request_id,observation) VALUES($1,$2,$3,$4,'Observación de recuperación')",
      [randomUUID(), ids[2], teacherId, randomUUID()],
    );
    await source.query("COMMIT");
    created = true;
  } catch (e) {
    await source.query("ROLLBACK");
    throw e;
  }
  const started = performance.now();
  const dump = execFileSync(
    "docker",
    [
      "exec",
      "stcs-audit-tests",
      "pg_dump",
      "-U",
      "postgres",
      "-d",
      "stcs_release_tests",
      "--schema=public",
      "--no-owner",
      "--no-acl",
      "--clean",
      "--if-exists",
    ],
    { maxBuffer: 8 * 1024 * 1024, windowsHide: true },
  );
  await writeFile(join(directory, "backup", "database.sql"), dump);
  for (const name of Object.keys(files))
    await copyFile(
      join(directory, "original", name),
      join(directory, "backup", name),
    );
  // Destination is a fresh, uniquely named DB; never restore over the source.
  await source.query('CREATE DATABASE "' + targetName + '"');
  targetCreated = true;
  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      "stcs-audit-tests",
      "psql",
      "-U",
      "postgres",
      "-d",
      targetName,
      "-v",
      "ON_ERROR_STOP=1",
    ],
    { input: dump, stdio: ["pipe", "ignore", "pipe"], windowsHide: true },
  );
  for (const name of Object.keys(files))
    await copyFile(
      join(directory, "backup", name),
      join(directory, "restored", name),
    );
  await target.connect();
  targetConnected = true;
  const restored = await target.query(
    "SELECT p.label,p.message,a.sha256,a.byte_size,i.rgb_sha256,u.password_hash FROM pictograms p JOIN phrase_audio a ON a.cache_key=p.audio_key JOIN pictogram_images i ON i.student_profile_id=p.student_profile_id JOIN student_profiles sp ON sp.id=p.student_profile_id JOIN users u ON u.id=sp.child_user_id WHERE p.id=$1",
    [ids[5]],
  );
  assert.equal(restored.rowCount, 1);
  assert.equal(restored.rows[0].message, "Ensayo de recuperación");
  assert.equal(restored.rows[0].password_hash, passwordHash);
  const followUp = await target.query(
    "SELECT board_selection,to_char(usage_started_on,'YYYY-MM-DD') AS date FROM student_profiles WHERE id=$1",
    [ids[2]],
  );
  assert.deepEqual(followUp.rows[0].board_selection, {
    categories: ["Necesidades"],
    pictogramIds: [ids[5]],
  });
  assert.equal(followUp.rows[0].date, "2020-01-02");
  assert.equal(
    (
      await target.query(
        "SELECT count(*)::int AS n FROM communication_observations WHERE student_profile_id=$1 AND author_user_id=$2 AND observation='Observación de recuperación'",
        [ids[2], ids[7]],
      )
    ).rows[0].n,
    1,
  );
  assert.equal(
    (
      await target.query(
        "SELECT count(*)::int AS n FROM device_events WHERE id=$1 AND student_profile_id=$2 AND device_id=$3",
        [ids[6], ids[2], ids[3]],
      )
    ).rows[0].n,
    1,
  );
  const fileChecks = [];
  for (const [name, bytes] of Object.entries(files)) {
    assert.equal(
      hash(await readFile(join(directory, "restored", name))),
      hash(bytes),
    );
    fileChecks.push({ name, bytes: bytes.length, sha256: hash(bytes) });
  }
  assert.equal(restored.rows[0].sha256, hash(wav));
  assert.equal(restored.rows[0].rgb_sha256, hash(rgb));
  assert.equal(
    (
      await target.query(
        "SELECT bool_and(c.relrowsecurity) AS protected FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'",
      )
    ).rows[0].protected,
    true,
  );
  report = {
    generatedAt: new Date().toISOString(),
    passed: true,
    codeCommit: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    workingTreeDirty: true,
    environment:
      "Fixed localhost:55432 disposable PostgreSQL container; no production data",
    scope:
      "pg_dump/restore into a new DB plus PNG/RGB/WAV recovery, relationships, password hash, RLS, board selection, start date and teacher observation",
    elapsedSeconds: (performance.now() - started) / 1000,
    files: fileChecks,
    dumpSha256: hash(dump),
    limitations: [
      "Synthetic PNG/RGB and silent WAV validate integrity, not clinical use or Piper synthesis",
      "No production restore or ESP flash restore performed",
      "Storage copy uses local files; hosted Storage disaster recovery remains operational work",
    ],
  };
} finally {
  if (targetConnected) await target.end();
  if (sourceConnected) {
    try {
      if (targetCreated) {
        assert.match(targetName, /^stcs_restore_[a-f0-9]{32}$/);
        await source.query('DROP DATABASE "' + targetName + '" WITH (FORCE)');
      }
      if (created) {
        await source.query("DELETE FROM pictogram_images WHERE id=$1", [
          ids[4],
        ]);
        await source.query("DELETE FROM users WHERE id=ANY($1::uuid[])", [
          [...ids.slice(0, 2), ids[7]],
        ]);
        await source.query("DELETE FROM phrase_audio WHERE cache_key=$1", [
          hash(Buffer.from(ids[0])),
        ]);
      }
    } finally {
      await source.end();
    }
  }
  assert.ok(
    resolve(directory).startsWith(resolve(tmpdir()) + sep + "stcs-recovery-"),
  );
  await rm(directory, { recursive: true, force: true });
}
await mkdir("../.codex-work/arreglos-locales-20261116", { recursive: true });
await writeFile(
  "../.codex-work/arreglos-locales-20261116/recuperacion.json",
  JSON.stringify(
    { ...report, ownedFixturesAndDestinationRemoved: true },
    null,
    2,
  ) + "\n",
);
console.log(
  "PASS: disposable database and three media files restored; owned fixtures and destination removed.",
);
