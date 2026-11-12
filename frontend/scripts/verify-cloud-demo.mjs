import assert from "node:assert/strict";
import { verifyCookieSession } from "./verify-cookie-session.mjs";
import { verifyPrivateProfiles } from "./verify-private-profile.mjs";
import { testSession } from "./lib/test-session.mjs";
import { randomUUID, createHmac, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { provisionCloudDemo } from "./lib/cloud-demo.mjs";
import {
  CLOUD_DEMO_PASSWORD,
  CLOUD_DEMO_ACCOUNTS,
} from "../src/lib/cloud-demo-accounts.ts";

export async function verifyCloudDemo({
  db,
  base,
  adminToken,
  therapistToken,
  realProfileId,
  realChildId,
}) {
  const fixture = await provisionCloudDemo(db),
    extraId = randomUUID();
  let checks = 0;
  async function api(
    path,
    token,
    body,
    expected = 200,
    method = body ? "POST" : "GET",
  ) {
    const r = await fetch(base + path, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = testSession(r, await r.json());
    assert.equal(r.status, expected, `${path}: ${JSON.stringify(result)}`);
    checks++;
    return result;
  }
  const login = async (email) =>
    api("/api/auth/login", undefined, { email, password: CLOUD_DEMO_PASSWORD });
  try {
    checks += await verifyCookieSession(base);
    await api(
      "/api/auth/login",
      undefined,
      { email: "alex@demo.stcs.local", password: CLOUD_DEMO_PASSWORD },
      401,
    );
    const sessions = Object.fromEntries(
      await Promise.all(
        fixture.accounts.map(async (a) => [a.role, await login(a.email)]),
      ),
    );
    for (const s of Object.values(sessions)) {
      assert.equal(s.user.isDemo, true);
      assert.equal((await api("/api/auth/me", s.token)).user.isDemo, true);
    }
    const specialist = await api("/api/stcs/portal", sessions.therapist.token),
      teacher = await api("/api/stcs/portal", sessions.teacher.token),
      guardian = await api("/api/stcs/portal", sessions.guardian.token);
    assert.equal(specialist.data.profiles.length, 2);
    assert.ok(specialist.data.profiles.every((p) => p.isDemo));
    assert.equal(guardian.data.profiles.length, 1);
    assert.equal(teacher.data.detail.profile.label, "Alex");
    assert.ok(!("diagnosis" in teacher.data.detail.reports[0]));
    assert.equal(teacher.data.detail.overview, undefined);
    const profileId = fixture.profileIds[0],
      demoChild = (
        await db.query(
          "SELECT child_user_id FROM student_profiles WHERE id=$1",
          [profileId],
        )
      ).rows[0].child_user_id;
    for (const s of Object.values(sessions)) {
      await api(
        "/api/stcs/portal?profileId=" + realProfileId,
        s.token,
        undefined,
        403,
      );
      for (const path of ["/api/records", "/api/emotions"])
        await api(path + "?userId=" + realChildId, s.token, undefined, 403);
    }
    await api(
      "/api/stcs/portal?profileId=" + profileId,
      therapistToken,
      undefined,
      403,
    );
    await api(
      "/api/records?userId=" + demoChild,
      therapistToken,
      undefined,
      403,
    );
    await api(
      "/api/stcs/portal?profileId=" + fixture.profileIds[1],
      sessions.guardian.token,
      undefined,
      403,
    );
    await api(
      "/api/auth/activate",
      undefined,
      { email: fixture.accounts[0].email },
      400,
    );
    const managed = (await api("/api/stcs/portal", adminToken)).data;
    assert.ok(
      managed.profiles
        .filter((p) => fixture.profileIds.includes(p.id))
        .every((p) => /^Usuario \d+$/.test(p.label)),
    );
    const demoAccount = fixture.accounts[0],
      update = {
        action: "user",
        id: demoAccount.id,
        fullName: demoAccount.fullName,
        email: demoAccount.email,
        role: demoAccount.role,
        active: true,
        profileIds: fixture.profileIds,
      };
    await api(
      "/api/stcs/portal",
      adminToken,
      { ...update, isDemo: false },
      403,
    );
    await api(
      "/api/stcs/portal",
      adminToken,
      { ...update, profileIds: [realProfileId] },
      403,
    );
    await api(
      "/api/stcs/portal",
      adminToken,
      { ...update, role: "admin", profileIds: [] },
      403,
    );
    await api(
      "/api/stcs/portal",
      adminToken,
      {
        action: "user",
        fullName: "Real sin acceso demo",
        email: `${extraId}@test.invalid`,
        role: "teacher",
        active: true,
        profileIds: [profileId],
      },
      403,
    );
    assert.equal(
      (
        await db.query("SELECT 1 FROM users WHERE email=$1", [
          `${extraId}@test.invalid`,
        ])
      ).rowCount,
      0,
    );
    await assert.rejects(
      db.query(
        "INSERT INTO user_access(actor_user_id,subject_user_id,relationship) VALUES($1,$2,$3)",
        [demoAccount.id, realChildId, "therapist"],
      ),
      (e) => e.code === "23514",
    );
    checks++;
    await assert.rejects(
      db.query("UPDATE users SET role='admin' WHERE id=$1", [demoAccount.id]),
      (e) => e.code === "23514",
    );
    checks++;
    await assert.rejects(
      db.query("UPDATE users SET is_demo=FALSE WHERE id=$1", [demoAccount.id]),
      (e) => e.code === "23514",
    );
    checks++;
    await assert.rejects(
      db.query("UPDATE student_profiles SET is_demo=FALSE WHERE id=$1", [
        profileId,
      ]),
      (e) => e.code === "23514",
    );
    checks++;
    // Even a correctly signed claim cannot turn a real database identity into a demo identity.
    const parts = therapistToken.split("."),
      claims = {
        ...JSON.parse(Buffer.from(parts[1], "base64url")),
        isDemo: true,
      },
      body = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const forged = `${parts[0]}.${body}.${createHmac("sha256", process.env.JWT_ACCESS_SECRET).update(`${parts[0]}.${body}`).digest("base64url")}`;
    await api(
      "/api/stcs/portal?profileId=" + profileId,
      forged,
      undefined,
      403,
    );
    assert.equal((await api("/api/stcs/portal", forged)).data.isDemo, false);
    // A fictitious email does not grant the exemption: only the protected database flag does.
    const fakeEmail = `${extraId}@demo.stcs.local`;
    await db.query(
      "INSERT INTO users(id,full_name,email,password_hash,role) VALUES($1,'Sin verificar',$2,$3,'teacher')",
      [extraId, fakeEmail, await bcrypt.hash(CLOUD_DEMO_PASSWORD, 10)],
    );
    await api(
      "/api/auth/login",
      undefined,
      { email: fakeEmail, password: CLOUD_DEMO_PASSWORD },
      403,
    );
    await api("/api/stcs/portal", sessions.guardian.token, {
      action: "profile",
      profileId,
      fullName: "Alex Ficticio Editado",
      age: 9,
      supportLevel: "Apoyo demo",
      mainContext: "Nube demo",
      notes: "Cambio persistente en la nube de prueba",
    });
    assert.equal(
      (await api("/api/stcs/portal", sessions.therapist.token)).data.detail
        .profile.notes,
      "Cambio persistente en la nube de prueba",
    );
    const report = {
      action: "report",
      profileId,
      requestId: randomUUID(),
      diagnosis: "INFORME_DEMO_PRIVADO",
      guidance: "ORIENTACION_DEMO",
    };
    await api("/api/stcs/portal", sessions.therapist.token, report);
    await api("/api/stcs/portal", sessions.therapist.token, report);
    const forTeacher = (await api("/api/stcs/portal", sessions.teacher.token))
      .data;
    assert.equal(forTeacher.detail.reports[0].guidance, report.guidance);
    assert.ok(!JSON.stringify(forTeacher).includes(report.diagnosis));
    await api(
      "/api/records",
      sessions.guardian.token,
      {
        userId: demoChild,
        title: "Registro ficticio demo",
        category: "Demo",
        description: "Ejemplo guardado por API",
      },
      201,
    );
    assert.ok(
      (await api("/api/records", sessions.therapist.token)).data.some(
        (r) => r.title === "Registro ficticio demo",
      ),
    );
    assert.ok(
      !(await api("/api/records", therapistToken)).data.some(
        (r) => r.title === "Registro ficticio demo",
      ),
    );
    const history = await api(
      "/api/stcs/events?profileId=" + profileId,
      sessions.therapist.token,
    );
    assert.equal(history.total, 3);
    assert.ok(history.data.every((e) => e.payload.source === "demo-fixture"));
    const overview = await api(
      "/api/stcs/overview?profileId=" + profileId,
      sessions.therapist.token,
    );
    assert.ok(overview.data.metrics.interactionsToday >= 1);
    assert.equal(overview.data.device.status, "offline");
    const p = {
      label: "Nuevo demo",
      message: "Quiero ayuda",
      category: "Necesidades",
      colorTone: "sky",
      iconName: "Droplets",
      imagePath: "/pictograms/water.png",
      position: 17,
    };
    const created = (
      await api(
        "/api/stcs/pictograms?profileId=" + profileId,
        sessions.teacher.token,
        p,
        201,
      )
    ).data;
    await api(
      "/api/stcs/pictograms/" + created.id + "?profileId=" + profileId,
      sessions.teacher.token,
      { ...p, label: "Demo editado" },
      200,
      "PUT",
    );
    await api(
      "/api/stcs/pictograms/" + created.id + "?profileId=" + profileId,
      sessions.teacher.token,
      undefined,
      200,
      "DELETE",
    );
    const again = await login(
      fixture.accounts.find((a) => a.role === "guardian").email,
    );
    assert.equal(
      (await api("/api/stcs/portal", again.token)).data.detail.profile.fullName,
      "Alex Ficticio Editado",
    );
    const before = await db.query(
      "SELECT COUNT(*)::int AS n FROM device_events WHERE student_profile_id=ANY($1::uuid[])",
      [fixture.profileIds],
    );
    await provisionCloudDemo(db);
    assert.equal(
      (await api("/api/stcs/portal", again.token)).data.detail.profile.notes,
      "Cambio persistente en la nube de prueba",
    );
    assert.equal(
      (
        await db.query("SELECT is_active FROM pictograms WHERE id=$1", [
          created.id,
        ])
      ).rows[0].is_active,
      false,
    );
    assert.equal(
      (
        await db.query(
          "SELECT COUNT(*)::int AS n FROM device_events WHERE student_profile_id=ANY($1::uuid[])",
          [fixture.profileIds],
        )
      ).rows[0].n,
      before.rows[0].n,
    );
    await api("/api/auth/logout", again.token, {});
    await api("/api/auth/me", again.token, undefined, 401);
    assert.equal((await api("/api/auth/me", adminToken)).user.isDemo, false);
    checks += await verifyPrivateProfiles({
      db,
      base,
      adminToken,
      realToken: therapistToken,
      realProfileId,
      realChildId,
      publicToken: sessions.teacher.token,
    });
    return checks;
  } finally {
    await db.query("BEGIN");
    try {
      for (const table of [
        "device_events",
        "specialist_reports",
        "pictograms",
        "devices",
      ])
        await db.query(
          `DELETE FROM ${table} WHERE student_profile_id=ANY($1::uuid[])`,
          [fixture.profileIds],
        );
      for (const table of ["records", "emotions"])
        await db.query(`DELETE FROM ${table} WHERE user_id=ANY($1::uuid[])`, [
          fixture.userIds,
        ]);
      await db.query(
        "DELETE FROM user_access WHERE actor_user_id=ANY($1::uuid[]) OR subject_user_id=ANY($1::uuid[])",
        [fixture.userIds],
      );
      await db.query("DELETE FROM student_profiles WHERE id=ANY($1::uuid[])", [
        fixture.profileIds,
      ]);
      await db.query("DELETE FROM users WHERE id=ANY($1::uuid[])", [
        [...fixture.userIds, extraId],
      ]);
      await db.query("DELETE FROM app_rate_limits WHERE key=ANY($1::text[])", [
        CLOUD_DEMO_ACCOUNTS.map((a) =>
          createHash("sha256")
            .update("login:" + a.email)
            .digest("hex"),
        ),
      ]);
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  }
}
