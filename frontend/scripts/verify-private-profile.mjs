import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { provisionPrivateProfile } from "./lib/private-profile.mjs";
import { testSession } from "./lib/test-session.mjs";
import { HARDWARE_DEMO_ACCOUNTS } from "../src/lib/hardware-demo-accounts.ts";

export async function verifyPrivateProfiles({
  db,
  base,
  adminToken,
  realToken,
  realProfileId,
  realChildId,
  publicToken,
}) {
  assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
  const marker = randomUUID(),
    deviceIds = [randomUUID(), randomUUID()],
    otherChild = randomUUID(),
    otherProfile = randomUUID();
  const config = {
    name: "Luis",
    childEmail: `private-${marker}-child@test.invalid`,
    deviceCode: `PRIVATE-${marker}`,
    accounts: ["therapist", "teacher", "guardian"].map((role) => ({
      role,
      fullName: `Adulto privado ${role}`,
      email: `private-${marker}-${role}@test.invalid`,
      password: HARDWARE_DEMO_ACCOUNTS.find((a) => a.role === role).password,
    })),
  };
  let fixture,
    checks = 0;
  const api = async (path, token, body, status = 200) => {
    const r = await fetch(base + path, {
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const json = testSession(r, await r.json());
    assert.equal(r.status, status, `${path}: ${JSON.stringify(json)}`);
    checks++;
    return json;
  };
  const deviceKey = "private-isolated-device";
  await db.query(
    "INSERT INTO devices(id,student_profile_id,device_code,name,api_key_hash) VALUES($1,$2,$3,'Equipo de prueba',$4)",
    [
      deviceIds[0],
      realProfileId,
      config.deviceCode,
      createHash("sha256").update(deviceKey).digest("hex"),
    ],
  );
  try {
    fixture = await provisionPrivateProfile(db, config);
    assert.equal(
      (
        await db.query(
          "SELECT COUNT(*)::int AS n FROM device_events WHERE student_profile_id=$1",
          [fixture.profileId],
        )
      ).rows[0].n,
      0,
    );
    const sessions = {};
    for (const a of config.accounts) {
      const s = await api("/api/auth/login", null, {
        email: a.email,
        password: a.password,
      });
      assert.equal(s.user.isPrivateTest, true);
      assert.equal(s.user.isDemo, false);
      sessions[a.role] = s;
    }
    await api(
      "/api/auth/login",
      null,
      { email: config.accounts[0].email, password: "DemoSTCS2026!" },
      401,
    );
    await api(
      "/api/auth/login",
      null,
      { email: config.childEmail, password: config.accounts[0].password },
      401,
    );
    await api(
      "/api/auth/activate",
      null,
      { email: config.accounts[0].email },
      400,
    );
    const t = sessions.therapist.token,
      g = sessions.guardian.token,
      teacher = sessions.teacher.token;
    const sensitiveNote = "NOTA_PRIVADA_LUIS";
    await api("/api/stcs/portal", g, {
      action: "profile",
      profileId: fixture.profileId,
      fullName: "Luis Privado",
      age: 8,
      supportLevel: "Prueba",
      mainContext: "Prueba privada",
      notes: sensitiveNote,
    });
    const specialist = (await api("/api/stcs/portal", t)).data;
    assert.equal(specialist.detail.profile.notes, sensitiveNote);
    assert.equal(specialist.detail.devices[0].powerSource, "usb");
    assert.equal(specialist.detail.devices[0].batteryLevel, null);
    const teaching = (await api("/api/stcs/portal", teacher)).data;
    assert.equal(teaching.detail.profile.label, "Luis");
    for (const key of [
      "notes",
      "age",
      "supportLevel",
      "mainContext",
      "fullName",
    ])
      assert.equal(teaching.detail.profile[key], undefined);
    assert.equal(teaching.detail.overview, undefined);
    assert.ok(!JSON.stringify(teaching).includes(sensitiveNote));
    assert.equal(teaching.detail.devices[0].code, config.deviceCode);
    const admin = (await api("/api/stcs/portal", adminToken)).data;
    assert.ok(!JSON.stringify(admin).includes("Luis"));
    assert.ok(!JSON.stringify(admin).includes(sensitiveNote));
    assert.ok(
      /^Usuario \d+$/.test(
        admin.profiles.find((p) => p.id === fixture.profileId).label,
      ),
    );
    assert.equal(
      (await api("/api/stcs/portal?profileId=" + fixture.profileId, adminToken))
        .data.detail,
      undefined,
    );
    for (const token of [realToken, publicToken])
      await api(
        "/api/stcs/portal?profileId=" + fixture.profileId,
        token,
        null,
        403,
      );
    for (const token of [t, g, teacher])
      await api(
        "/api/stcs/portal?profileId=" + realProfileId,
        token,
        null,
        403,
      );
    for (const path of ["/api/records", "/api/emotions"]) {
      await api(path + "?userId=" + fixture.childId, publicToken, null, 403);
      await api(path + "?userId=" + realChildId, t, null, 403);
    }
    await assert.rejects(
      db.query(
        "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at) VALUES($1,$2,'therapist',NOW())",
        [fixture.accounts[0].id, realChildId],
      ),
      { code: "23514" },
    );
    await assert.rejects(
      db.query("UPDATE users SET is_private_test=FALSE WHERE id=$1", [
        fixture.accounts[0].id,
      ]),
      { code: "23514" },
    );
    await assert.rejects(
      db.query("UPDATE users SET role='admin' WHERE id=$1", [
        fixture.accounts[0].id,
      ]),
      { code: "23514" },
    );
    await api(
      "/api/stcs/portal",
      adminToken,
      { action: "user", is_private_test: true },
      403,
    );
    // A second child/device exercises isolation and specialist multi-client selection without real hardware.
    await db.query(
      "INSERT INTO users(id,full_name,email,password_hash,role,is_private_test) VALUES($1,'Otro Privado',$2,'unused','child',TRUE)",
      [otherChild, `private-${marker}-other@test.invalid`],
    );
    await db.query(
      "INSERT INTO student_profiles(id,child_user_id,display_name,age,support_level,main_context,is_private_test) VALUES($1,$2,'Otro Privado',8,'Prueba','Prueba',TRUE)",
      [otherProfile, otherChild],
    );
    await db.query(
      "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at) VALUES($1,$2,'therapist',NOW())",
      [fixture.accounts.find((a) => a.role === "therapist").id, otherChild],
    );
    await db.query(
      "INSERT INTO devices(id,student_profile_id,device_code,name,power_source) VALUES($1,$2,$3,'Otro equipo','usb')",
      [deviceIds[1], otherProfile, `OTHER-${marker}`],
    );
    assert.equal((await api("/api/stcs/portal", t)).data.profiles.length, 2);
    assert.equal(
      (await api("/api/stcs/portal?profileId=" + otherProfile, t)).data.detail
        .profile.label,
      "Otro Privado",
    );
    assert.equal((await api("/api/stcs/portal", g)).data.profiles.length, 1);
    await api("/api/stcs/portal?profileId=" + otherProfile, g, null, 403);
    await api("/api/stcs/portal?profileId=" + otherProfile, teacher, null, 403);
    // Actual hardware API contract; one unique event, no activity generated by provisioning.
    const pictogram = (
      await db.query(
        "SELECT id FROM pictograms WHERE student_profile_id=$1 ORDER BY position LIMIT 1",
        [fixture.profileId],
      )
    ).rows[0];
    const event = {
      eventType: "pictogram_selected",
      pictogramId: pictogram.id,
      externalEventId: randomUUID(),
      context: "Prueba privada",
      firmwareVersion: "isolated-test",
    };
    let persistedEventId;
    for (const expected of [201, 200]) {
      const r = await fetch(
        base + `/api/stcs/devices/${config.deviceCode}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-stcs-device-key": deviceKey,
          },
          body: JSON.stringify(event),
        },
      );
      assert.equal(r.status, expected);
      const acknowledgement = await r.json();
      assert.equal(acknowledgement.ack.accepted, true);
      assert.equal(acknowledgement.ack.externalEventId, event.externalEventId);
      if (persistedEventId)
        assert.equal(acknowledgement.data.id, persistedEventId);
      persistedEventId = acknowledgement.data.id;
      checks++;
    }
    const rejected = await fetch(
      base + `/api/stcs/devices/${config.deviceCode}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-stcs-device-key": deviceKey,
        },
        body: JSON.stringify({ ...event, eventType: "invalid-event" }),
      },
    );
    assert.equal(rejected.status, 400);
    assert.notEqual((await rejected.json()).ack?.accepted, true);
    checks++;
    const history = await api(
      "/api/stcs/events?profileId=" + fixture.profileId,
      t,
    );
    assert.equal(history.total, 1);
    await api(
      "/api/stcs/events?profileId=" + fixture.profileId,
      teacher,
      null,
      403,
    );
    const same = await provisionPrivateProfile(db, config);
    assert.equal(same.created, false);
    assert.equal(
      (await api("/api/stcs/portal", g)).data.detail.profile.notes,
      sensitiveNote,
    );
    for (const s of Object.values(sessions)) {
      await api("/api/auth/logout", s.token, {});
      await api("/api/auth/me", s.token, null, 401);
    }
    return checks;
  } finally {
    await db.query("BEGIN");
    try {
      const profiles = [fixture?.profileId, otherProfile].filter(Boolean),
        users = [
          fixture?.childId,
          otherChild,
          ...(fixture?.accounts.map((a) => a.id) ?? []),
        ].filter(Boolean);
      await db.query(
        "DELETE FROM device_events WHERE student_profile_id=ANY($1::uuid[])",
        [profiles],
      );
      await db.query("DELETE FROM devices WHERE id=ANY($1::uuid[])", [
        deviceIds,
      ]);
      for (const table of ["specialist_reports", "pictograms"])
        await db.query(
          `DELETE FROM ${table} WHERE student_profile_id=ANY($1::uuid[])`,
          [profiles],
        );
      await db.query(
        "DELETE FROM user_access WHERE actor_user_id=ANY($1::uuid[]) OR subject_user_id=ANY($1::uuid[])",
        [users],
      );
      await db.query("DELETE FROM student_profiles WHERE id=ANY($1::uuid[])", [
        profiles,
      ]);
      await db.query("DELETE FROM users WHERE id=ANY($1::uuid[])", [users]);
      await db.query("COMMIT");
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    }
  }
}
