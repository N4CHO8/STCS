// Integration tests use isolated fictitious rows and delete only those UUIDs afterwards.
import assert from "node:assert/strict";
import { verifyCloudDemo } from "./verify-cloud-demo.mjs";
import { randomUUID, createHmac, createHash } from "node:crypto";
import path from "node:path";
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";
import bcrypt from "bcryptjs";
import nextEnv from "@next/env";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
nextEnv.loadEnvConfig(root);
const base = process.env.STCS_TEST_URL ?? "http://localhost:3000";
assert.match(
  base,
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
  "Tests must target a local server",
);
const databaseUrl = new URL(process.env.DATABASE_URL);
assert.ok(
  ["localhost", "127.0.0.1"].includes(databaseUrl.hostname),
  "Tests refuse any remote/shared database",
);
assert.equal(
  process.env.STCS_TEST_ISOLATED,
  "1",
  "Set STCS_TEST_ISOLATED=1 only for the disposable local database",
);
const health = await fetch(base + "/api/health");
assert.equal(
  (await health.json()).testDatabase,
  databaseUrl.host + databaseUrl.pathname,
  "The local server must confirm it uses this same isolated database before any fixture or login",
);
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL.replace("?sslmode=require", ""),
  ssl: false,
});
await db.connect();
const marker = `rbac-${randomUUID()}`;
const roles = ["therapist", "guardian", "teacher", "admin", "child", "child"];
const ids = roles.map(() => randomUUID()),
  profiles = [randomUUID(), randomUUID()];
const extraIds = [];
const deviceId = randomUUID(),
  emotionId = randomUUID();
const sessionIds = ids.map(() => randomUUID());
const tokens = ids.map((id, i) => {
  const head = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      sub: id,
      sid: sessionIds[i],
      role: roles[i],
      email: `${marker}-${i}@test.invalid`,
      fullName: "Prueba",
      exp: Math.floor(Date.now() / 1000) + 600,
    }),
  ).toString("base64url");
  return `${head}.${body}.${createHmac("sha256", process.env.JWT_ACCESS_SECRET).update(`${head}.${body}`).digest("base64url")}`;
});
let checks = 0;
async function api(
  index,
  url,
  body,
  status = 200,
  method = body ? "POST" : "GET",
) {
  const response = await fetch(base + url, {
    method,
    headers: {
      Authorization: `Bearer ${tokens[index]}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  assert.equal(response.status, status, `${url}: ${JSON.stringify(data)}`);
  checks++;
  return data;
}
try {
  const hash = await bcrypt.hash("Testing-Only-123!", 10);
  for (let i = 0; i < ids.length; i++)
    await db.query(
      "INSERT INTO users(id,full_name,email,password_hash,role,credential_verified_at) VALUES($1,$2,$3,$4,$5,NOW())",
      [
        ids[i],
        i >= 4 ? "PRIVADO Apellido Sensible" : `Adulto ${i}`,
        `${marker}-${i}@test.invalid`,
        hash,
        roles[i],
      ],
    );
  for (let i = 0; i < ids.length; i++)
    await db.query(
      "INSERT INTO app_sessions(id,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '10 minutes')",
      [sessionIds[i], ids[i]],
    );
  for (let i = 0; i < 2; i++)
    await db.query(
      "INSERT INTO student_profiles(id,child_user_id,display_name,age,support_level,main_context,sensitive_notes) VALUES($1,$2,$3,8,$4,$5,$6)",
      [
        profiles[i],
        ids[i + 4],
        "Nombre Apellido",
        "APOYO_PRIVADO",
        "CONTEXTO_PRIVADO",
        "NOTA_PRIVADA",
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
  const login = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `${marker}-0@test.invalid`,
      password: "Testing-Only-123!",
    }),
  });
  assert.equal(
    (await db.query("SELECT COUNT(*)::int AS n FROM users")).rows[0].n,
    ids.length,
  );
  assert.equal(login.status, 200);
  checks++;
  const therapist = await api(0, `/api/stcs/portal?profileId=${profiles[0]}`);
  assert.equal(therapist.data.profiles.length, 2);
  assert.equal(therapist.data.detail.profile.notes, "NOTA_PRIVADA");
  await api(0, "/api/stcs/portal", {
    action: "report",
    profileId: profiles[0],
    requestId: randomUUID(),
    diagnosis: "DIAGNOSTICO_PRIVADO",
    guidance: "Apoyar con pictogramas y dar tiempo.",
  });
  const teacher = await api(2, `/api/stcs/portal?profileId=${profiles[0]}`);
  assert.equal(teacher.data.detail.profile.label, "Nombre");
  const teacherJson = JSON.stringify(teacher);
  for (const secret of [
    "PRIVADO",
    "Apellido",
    "diagnosis",
    "overview",
    "age",
    "supportLevel",
    "childUserId",
  ])
    assert.ok(!teacherJson.includes(secret), `Teacher received ${secret}`);
  assert.equal(
    teacher.data.detail.reports[0].guidance,
    "Apoyar con pictogramas y dar tiempo.",
  );
  const admin = await api(3, "/api/stcs/portal");
  assert.ok(admin.data.profiles.every((p) => /^Usuario \d+$/.test(p.label)));
  assert.ok(!JSON.stringify(admin).includes("PRIVADO"));
  assert.ok(!admin.data.detail);
  const guardian = await api(1, "/api/stcs/portal");
  assert.equal(guardian.data.profiles.length, 1);
  assert.equal(
    guardian.data.detail.reports[0].diagnosis,
    "DIAGNOSTICO_PRIVADO",
  );
  await api(1, `/api/stcs/portal?profileId=${profiles[1]}`, null, 403);
  await api(2, `/api/stcs/portal?profileId=${profiles[1]}`, null, 403);
  for (const role of [2, 3])
    for (const url of [
      "/api/stcs/overview",
      "/api/stcs/events",
      "/api/records",
      "/api/emotions",
    ])
      await api(role, url, null, 403);
  await api(
    1,
    "/api/stcs/portal",
    {
      action: "report",
      profileId: profiles[0],
      diagnosis: "No autorizado",
      guidance: "",
    },
    403,
  );
  await api(
    2,
    "/api/stcs/portal",
    { action: "profile", profileId: profiles[0] },
    403,
  );
  await api(1, "/api/stcs/portal", {
    action: "profile",
    profileId: profiles[0],
    fullName: "PRIVADO Editado",
    age: 9,
    supportLevel: "APOYO_PRIVADO",
    mainContext: "CONTEXTO_PRIVADO",
    notes: "EDITADO_PRIVADO",
  });
  const updated = await api(0, `/api/stcs/portal?profileId=${profiles[0]}`);
  assert.equal(updated.data.detail.profile.age, 9);
  const pictogram = {
    label: "Prueba",
    message: "Quiero ayuda",
    category: "Necesidades",
    colorTone: "sky",
    iconName: "MessageCircle",
    imagePath: "/pictograms/water.png",
    position: 1,
  };
  const board = await api(
    2,
    `/api/stcs/pictograms?profileId=${profiles[0]}`,
    pictogram,
    201,
  );
  assert.ok(board.data.id);
  await api(
    2,
    `/api/stcs/pictograms/${board.data.id}?profileId=${profiles[0]}`,
    { ...pictogram, label: "Actualizado" },
    200,
    "PUT",
  );
  await api(2, `/api/stcs/pictograms?profileId=${profiles[1]}`, pictogram, 403);
  await api(
    0,
    `/api/stcs/pictograms/${board.data.id}?profileId=${profiles[1]}`,
    pictogram,
    404,
    "PUT",
  );
  await api(
    2,
    `/api/stcs/pictograms/${board.data.id}?profileId=${profiles[0]}`,
    null,
    200,
    "DELETE",
  );
  await api(
    2,
    "/api/stcs/portal",
    { action: "settings", appTitle: "No autorizado", supportEmail: "" },
    403,
  );
  await api(1, "/api/stcs/portal", { action: "user" }, 403);
  await api(1, `/api/stcs/pictograms?profileId=${profiles[0]}`, pictogram, 403);
  await api(3, `/api/stcs/pictograms?profileId=${profiles[0]}`, pictogram, 403);
  await api(3, "/api/stcs/portal", {
    action: "user",
    fullName: "Cuenta de prueba",
    email: `${marker}-extra@test.invalid`,
    role: "teacher",
    active: true,
    profileIds: [profiles[1]],
  });
  const extra = await db.query("SELECT id FROM users WHERE email=$1", [
    `${marker}-extra@test.invalid`,
  ]);
  extraIds.push(extra.rows[0].id);
  const extraId = extra.rows[0].id,
    extraEmail = `${marker}-extra@test.invalid`;
  const loginAs = async (email, password, status = 200) => {
    const r = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await r.json();
    assert.equal(r.status, status, JSON.stringify(result));
    checks++;
    return result;
  };
  await loginAs(extraEmail, "Testing-Only-123!", 401); // An administrator does not know the generated credential.
  const editExtra = {
    action: "user",
    id: extraId,
    fullName: "Profesional pendiente",
    email: extraEmail,
    role: "therapist",
    active: true,
    profileIds: [profiles[0]],
  };
  await api(
    3,
    "/api/stcs/portal",
    { ...editExtra, password: "Chosen-by-admin-123!" },
    403,
  );
  await api(
    3,
    "/api/stcs/portal",
    { ...editExtra, email: "attacker@test.invalid" },
    403,
  );
  await api(3, "/api/stcs/portal", editExtra);
  const activate = async (body, status = 200) => {
    const r = await fetch(base + "/api/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await r.json();
    assert.equal(r.status, status, JSON.stringify(result));
    checks++;
    return result;
  };
  await db.query("UPDATE users SET password_hash=$2 WHERE id=$1", [
    extraId,
    hash,
  ]);
  await loginAs(extraEmail, "Testing-Only-123!", 403);
  await api(
    1,
    "/api/stcs/portal",
    {
      action: "approval",
      actorId: extraId,
      profileId: profiles[0],
      approve: true,
    },
    403,
  );
  await activate({ email: extraEmail });
  await activate(
    { email: extraEmail, code: "incorrect", password: "  Owner-Only-123!  " },
    400,
  );
  await activate({ email: extraEmail, code: "123456", password: "short" }, 400);
  const activated = await activate({
    email: extraEmail,
    code: "123456",
    password: "  Owner-Only-123!  ",
  });
  tokens.push(activated.token); // Index 6 is a real OTP session from the local fake email transport.
  await loginAs(extraEmail, "Owner-Only-123!", 401);
  await loginAs(extraEmail, "  Owner-Only-123!  ");
  assert.equal((await api(6, "/api/stcs/portal")).data.profiles.length, 0);
  await api(6, `/api/stcs/portal?profileId=${profiles[0]}`, null, 403);
  await api(6, `/api/records?userId=${ids[4]}`, null, 403);
  await api(6, `/api/emotions?userId=${ids[4]}`, null, 403);
  await db.query(
    "INSERT INTO records(id,user_id,category,title,observed_at) VALUES($1,$2,'Test','PRIVATE',NOW())",
    [randomUUID(), ids[4]],
  );
  assert.equal((await api(6, "/api/records")).data.length, 0);
  const approval = {
    action: "approval",
    actorId: extraId,
    profileId: profiles[0],
    approve: true,
  };
  await api(3, "/api/stcs/portal", approval, 403);
  await api(2, "/api/stcs/portal", approval, 403);
  await api(6, "/api/stcs/portal", approval, 403);
  assert.ok(
    (await api(1, "/api/stcs/portal")).data.pendingApprovals.some(
      (p) => p.actorId === extraId,
    ),
  );
  await api(1, "/api/stcs/portal", approval);
  assert.equal(
    (await api(6, "/api/stcs/portal")).data.detail.profile.notes,
    "EDITADO_PRIVADO",
  );
  // Duplicate report requests are idempotent, including retries after a lost response.
  const report = {
    action: "report",
    profileId: profiles[0],
    requestId: randomUUID(),
    diagnosis: "INFORME",
    guidance: "Orientación",
  };
  await api(0, "/api/stcs/portal", report);
  await api(0, "/api/stcs/portal", report);
  assert.equal(
    (
      await db.query(
        "SELECT COUNT(*)::int AS n FROM specialist_reports WHERE request_id=$1",
        [report.requestId],
      )
    ).rows[0].n,
    1,
  );
  // Malformed bodies stay JSON 400 responses on the old routes as well.
  for (const url of [
    "/api/auth/login",
    "/api/auth/activate",
    "/api/records",
    "/api/emotions",
    "/api/stcs/portal",
  ]) {
    for (const body of ["null", "{"]) {
      const r = await fetch(base + url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens[0]}`,
          "Content-Type": "application/json",
        },
        body,
      });
      assert.equal(r.status, 400, url);
      await r.json();
      checks++;
    }
  }
  await api(
    0,
    "/api/records",
    { userId: ids[4], title: "a", category: { bad: true } },
    400,
  );
  await api(
    0,
    "/api/emotions",
    { userId: ids[4], emotion: 12, intensity: 3 },
    400,
  );
  await api(0, "/api/records?userId=invalid", null, 400);
  await api(0, "/api/stcs/events?offset=-1", null, 400);
  await api(
    1,
    "/api/stcs/device-events",
    { eventType: "pictogram_selected", pictogramId: board.data.id },
    410,
  );
  const oldToken = tokens[6];
  tokens[6] = oldToken + ".extra";
  await api(6, "/api/auth/me", null, 401);
  tokens[6] = oldToken;
  const sign = (claims) => {
    const h = Buffer.from(
        JSON.stringify({ alg: "HS256", typ: "JWT" }),
      ).toString("base64url"),
      b = Buffer.from(JSON.stringify(claims)).toString("base64url");
    return `${h}.${b}.${createHmac("sha256", process.env.JWT_ACCESS_SECRET).update(`${h}.${b}`).digest("base64url")}`;
  };
  for (const exp of [undefined, 0, "9999999999"]) {
    tokens[6] = sign({
      sub: extraId,
      sid: randomUUID(),
      ...(exp === undefined ? {} : { exp }),
    });
    await api(6, "/api/auth/me", null, 401);
  }
  tokens[6] = oldToken;
  // Hardware credentials are per-device; GET config must not update last_sync_at.
  const deviceKey = "isolated-key-" + marker,
    code = "device-" + marker;
  await db.query(
    "INSERT INTO devices(id,student_profile_id,device_code,name,api_key_hash) VALUES($1,$2,$3,'Test device',$4)",
    [
      deviceId,
      profiles[0],
      code,
      createHash("sha256").update(deviceKey).digest("hex"),
    ],
  );
  await db.query(
    "INSERT INTO pictograms(id,student_profile_id,label,message,category,color_tone,icon_name,image_path) VALUES($1,$2,'Alegría renombrada','Estoy feliz','Emociones','yellow','Smile','/pictograms/happy.png')",
    [emotionId, profiles[0]],
  );
  const hardware = async (path, body, status = 200, key = deviceKey) => {
    const r = await fetch(base + path, {
      method: body ? "POST" : "GET",
      headers: { "x-stcs-device-key": key, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await r.json();
    assert.equal(r.status, status, JSON.stringify(payload));
    checks++;
    return payload;
  };
  const config = await hardware(`/api/stcs/devices/${code}/config`);
  assert.deepEqual(Object.keys(config.data.profile), ["id"]);
  assert.ok(!JSON.stringify(config).includes("PRIVADO"));
  assert.equal(
    (await db.query("SELECT last_sync_at FROM devices WHERE id=$1", [deviceId]))
      .rows[0].last_sync_at,
    null,
  );
  await hardware(
    `/api/stcs/devices/${code}/config`,
    undefined,
    401,
    "isolated-device-test",
  );
  await hardware(`/api/stcs/devices/other-device/config`, undefined, 401);
  const event = {
    eventType: "pictogram_selected",
    pictogramId: emotionId,
    externalEventId: randomUUID(),
    context: "Test",
  };
  const first = await hardware(`/api/stcs/devices/${code}/events`, event, 201);
  assert.equal(first.data.emotion, "feliz");
  assert.equal(
    (await hardware(`/api/stcs/devices/${code}/events`, event)).data.id,
    first.data.id,
  );
  // Events queued before a pictogram was retired remain valid for this same device/profile.
  await hardware(
    `/api/stcs/devices/${code}/events`,
    { ...event, pictogramId: board.data.id, externalEventId: randomUUID() },
    201,
  );
  await hardware(
    `/api/stcs/devices/${code}/events`,
    { ...event, pictogramId: "invalid" },
    400,
  );
  await hardware(
    `/api/stcs/devices/${code}/events`,
    { ...event, pictogramId: randomUUID() },
    404,
  );
  const now = await api(0, `/api/stcs/overview?profileId=${profiles[0]}`);
  assert.equal(now.data.metrics.emotionsToday, 1);
  const yesterday = (
    await db.query(
      "SELECT ((((NOW() AT TIME ZONE 'America/Santiago')::date-1)+TIME '23:30') AT TIME ZONE 'America/Santiago') AS time",
    )
  ).rows[0].time.toISOString();
  await hardware(
    `/api/stcs/devices/${code}/events`,
    { ...event, externalEventId: randomUUID(), occurredAt: yesterday },
    201,
  );
  assert.equal(
    (await api(0, `/api/stcs/overview?profileId=${profiles[0]}`)).data.metrics
      .emotionsToday,
    1,
  );
  await db.query(
    `INSERT INTO device_events(id,device_id,student_profile_id,event_type,action_label,context,payload) SELECT gen_random_uuid(),$1,$2,'navigation','Test','Test','{"source":"esp32-device"}'::jsonb FROM generate_series(1,105)`,
    [deviceId, profiles[0]],
  );
  const page1 = await api(0, `/api/stcs/events?profileId=${profiles[0]}`),
    page2 = await api(
      0,
      `/api/stcs/events?profileId=${profiles[0]}&offset=100`,
    );
  assert.equal(page1.total, 108);
  assert.equal(page1.data.length, 100);
  assert.equal(page2.data.length, 8);
  assert.ok(
    !page2.data.some((e) => page1.data.some((first) => first.id === e.id)),
  );
  // Count and INSERT share a transaction lock; only eight concurrent creations fit a category.
  const concurrent = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      fetch(base + `/api/stcs/pictograms?profileId=${profiles[0]}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens[0]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...pictogram,
          label: "Concurrent " + i,
          category: "Lugares",
        }),
      }),
    ),
  );
  assert.equal(concurrent.filter((r) => r.status === 201).length, 8);
  assert.equal(concurrent.filter((r) => r.status === 409).length, 4);
  checks += 12;
  await api(6, "/api/auth/logout", {}, 200);
  await api(6, "/api/auth/me", null, 401);

  await api(
    3,
    "/api/stcs/portal",
    {
      action: "user",
      id: ids[1],
      fullName: "Apoderado prueba",
      email: `${marker}-1@test.invalid`,
      role: "guardian",
      active: true,
      profileIds: profiles,
    },
    400,
  );
  await api(3, "/api/stcs/portal", {
    action: "user",
    id: ids[2],
    fullName: "Docente prueba",
    email: `${marker}-2@test.invalid`,
    role: "teacher",
    active: false,
    profileIds: [profiles[0]],
  });
  await api(2, "/api/stcs/portal", null, 401);
  await api(4, "/api/stcs/portal", null, 401);
  checks += await verifyCloudDemo({
    db,
    base,
    adminToken: tokens[3],
    therapistToken: tokens[0],
    realProfileId: profiles[0],
    realChildId: ids[4],
  });
  if (process.env.STCS_TEST_UI === "1") {
    await db.query("UPDATE users SET is_active=TRUE WHERE id=$1", [ids[2]]);
    const release = path.join(root, ".codex-work", "ui-release");
    writeFileSync(
      path.join(root, ".codex-work", "ui-fixtures.json"),
      JSON.stringify({
        emails: roles
          .slice(0, 4)
          .map((role, i) => ({ role, email: `${marker}-${i}@test.invalid` })),
        password: "Testing-Only-123!",
      }),
    );
    console.log(
      "UI fixtures ready on localhost:3100; create .codex-work/ui-release to finish.",
    );
    const deadline = Date.now() + 300000;
    while (!existsSync(release) && Date.now() < deadline)
      await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log(
    `PASS: ${checks} checks; roles, privacy, assignments, reports, profile editing, pictograms and session revocation.`,
  );
} finally {
  await db.query("BEGIN");
  try {
    await db.query(
      "DELETE FROM device_events WHERE student_profile_id=ANY($1::uuid[])",
      [profiles],
    );
    await db.query(
      "DELETE FROM devices WHERE student_profile_id=ANY($1::uuid[])",
      [profiles],
    );
    await db.query("DELETE FROM records WHERE user_id=ANY($1::uuid[])", [ids]);
    await db.query("DELETE FROM emotions WHERE user_id=ANY($1::uuid[])", [ids]);
    await db.query(
      "DELETE FROM specialist_reports WHERE student_profile_id=ANY($1::uuid[])",
      [profiles],
    );
    await db.query(
      "DELETE FROM pictograms WHERE student_profile_id=ANY($1::uuid[])",
      [profiles],
    );
    await db.query("DELETE FROM student_profiles WHERE id=ANY($1::uuid[])", [
      profiles,
    ]);
    await db.query(
      "DELETE FROM user_access WHERE actor_user_id=ANY($1::uuid[]) OR subject_user_id=ANY($1::uuid[])",
      [[...ids, ...extraIds]],
    );
    await db.query("DELETE FROM users WHERE id=ANY($1::uuid[])", [
      [...ids, ...extraIds],
    ]);
    // Catch an extra account even if a failed assertion interrupted ID capture.
    await db.query("DELETE FROM users WHERE email=$1", [
      `${marker}-extra@test.invalid`,
    ]);
    await db.query("COMMIT");
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    await db.end();
  }
}
