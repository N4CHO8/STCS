import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

// Compile the actual browser transport with its pure dependencies; no server module or database is loaded.
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const localRequire = createRequire(file);
  new Function("require", "module", "exports", code)(
    (name) =>
      name.startsWith(".")
        ? load(path.resolve(path.dirname(file), name + ".ts"))
        : localRequire(name),
    module,
    module.exports,
  );
  return module.exports;
}
const { createDemo, resetDemo } = load(
  fileURLToPath(new URL("../src/lib/demo.ts", import.meta.url)),
);
const storage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};
async function api(
  demo,
  path = "/api/stcs/portal",
  body,
  expected = 200,
  method = body ? "POST" : "GET",
  headers = {},
) {
  const response = await demo.request(path, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  assert.equal(response.status, expected, JSON.stringify(result));
  return result;
}
test("Four demo projections preserve the intended role boundaries", async () => {
  const store = storage(),
    d = Object.fromEntries(
      ["therapist", "teacher", "guardian", "admin"].map((r) => [
        r,
        createDemo(r, store, () => {}),
      ]),
    );
  const specialist = (await api(d.therapist)).data,
    teacher = (await api(d.teacher)).data,
    guardian = (await api(d.guardian)).data,
    admin = (await api(d.admin)).data;
  assert.equal(specialist.profiles.length, 2);
  assert.equal(guardian.profiles.length, 1);
  assert.equal(teacher.detail.profile.label, "Alex");
  assert.equal(teacher.detail.reports[0].diagnosis, undefined);
  assert.equal(teacher.detail.overview, undefined);
  for (const key of ["age", "supportLevel", "notes", "fullName"])
    assert.equal(teacher.detail.profile[key], undefined);
  assert.ok(admin.profiles.every((p) => /^Usuario \d+$/.test(p.label)));
  assert.equal(admin.detail, undefined);
  assert.ok(!JSON.stringify(admin).includes("Alex"));
  assert.ok(!JSON.stringify(admin).includes("Informe de ejemplo"));
  await api(
    d.guardian,
    "/api/stcs/portal?profileId=" + specialist.profiles[1].id,
    undefined,
    403,
  );
  await api(d.teacher, "/api/stcs/events", undefined, 403);
  await api(d.admin, "/api/stcs/events", undefined, 403);
});
test("Edits persist across demo roles; diagnosis and guidance remain separate", async () => {
  const store = storage(),
    specialist = createDemo("therapist", store, () => {}),
    guardian = createDemo("guardian", store, () => {}),
    teacher = createDemo("teacher", store, () => {});
  const profileId = (await api(guardian)).data.profiles[0].id;
  const profile = {
    action: "profile",
    profileId,
    fullName: "Alex Ficticio",
    age: 9,
    supportLevel: "Apoyo de ejemplo",
    mainContext: "Demo",
    notes: "Nota ficticia editada",
  };
  await api(teacher, "/api/stcs/portal", profile, 403);
  await api(guardian, "/api/stcs/portal", profile);
  assert.equal(
    (await api(specialist)).data.detail.profile.notes,
    profile.notes,
  );
  const report = {
    action: "report",
    profileId,
    requestId: crypto.randomUUID(),
    diagnosis: "Diagnóstico ficticio de prueba",
    guidance: "Orientación de prueba",
  };
  await api(teacher, "/api/stcs/portal", report, 403);
  await api(specialist, "/api/stcs/portal", report);
  await api(specialist, "/api/stcs/portal", report);
  assert.equal((await api(guardian)).data.detail.reports.length, 2);
  assert.equal(
    (await api(teacher)).data.detail.reports[0].guidance,
    report.guidance,
  );
  assert.ok(!JSON.stringify(await api(teacher)).includes(report.diagnosis));
});
test("Pictogram create/edit/delete and category limits work without hardware", async () => {
  const store = storage(),
    teacher = createDemo("teacher", store, () => {}),
    guardian = createDemo("guardian", store, () => {});
  const profileId = (await api(teacher)).data.profiles[0].id,
    path = "/api/stcs/pictograms?profileId=" + profileId;
  const pictogram = {
    label: "Ejemplo",
    message: "Quiero ayuda",
    category: "Necesidades",
    imagePath: "/pictograms/water.png",
    colorTone: "sky",
    iconName: "Droplets",
    position: 1,
  };
  await api(guardian, path, pictogram, 403);
  const item = (await api(teacher, path, pictogram, 201)).data;
  await api(teacher, path, pictogram, 409);
  await api(
    teacher,
    "/api/stcs/pictograms/" + item.id + "?profileId=" + profileId,
    { ...pictogram, label: "Editado" },
    200,
    "PUT",
  );
  assert.ok(
    (await api(teacher)).data.detail.pictograms.some(
      (p) => p.label === "Editado",
    ),
  );
  await api(
    teacher,
    "/api/stcs/pictograms/" + item.id + "?profileId=" + profileId,
    undefined,
    200,
    "DELETE",
  );
  for (let i = 0; i < 4; i++)
    await api(teacher, path, { ...pictogram, label: "Límite " + i }, 201);
  await api(teacher, path, { ...pictogram, label: "Noveno" }, 409);
});
test("Demo administration and approval use synthetic assignments", async () => {
  const store = storage(),
    admin = createDemo("admin", store, () => {}),
    guardian = createDemo("guardian", store, () => {});
  const profileId = (await api(admin)).data.profiles[0].id;
  await api(admin, "/api/stcs/portal", {
    action: "user",
    fullName: "Otro apoderado demo",
    email: "otro@demo.invalid",
    role: "guardian",
    active: true,
    profileIds: [profileId],
  });
  const user = (await api(admin)).data.users.find(
    (u) => u.email === "otro@demo.invalid",
  );
  assert.deepEqual(user.pendingProfileIds, [profileId]);
  assert.ok(
    (await api(guardian)).data.pendingApprovals.some(
      (p) => p.actorId === user.id,
    ),
  );
  const approval = {
    action: "approval",
    profileId,
    actorId: user.id,
    approve: true,
  };
  await api(admin, "/api/stcs/portal", approval, 403);
  await api(guardian, "/api/stcs/portal", approval);
  assert.deepEqual(
    (await api(admin)).data.users.find((u) => u.id === user.id)
      .pendingProfileIds,
    [],
  );
  await api(
    admin,
    "/api/stcs/portal",
    {
      action: "user",
      id: "demo-admin",
      fullName: "Admin",
      email: "admin@demo.invalid",
      role: "teacher",
      active: true,
      profileIds: [],
    },
    403,
  );
});
test("Demo never forwards network requests or replaces the real session", async () => {
  const store = storage();
  store.setItem("stcs-auth-session", "real-session-sentinel");
  const realFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = () => {
    requests++;
    throw new Error("Unexpected real network request");
  };
  try {
    const demo = createDemo("admin", store, () => {});
    await api(demo);
    await api(demo, "/api/auth/login", {}, 404);
    await api(
      demo,
      "https://0stcs0.vercel.app/api/stcs/portal",
      undefined,
      403,
    );
    resetDemo(store);
    assert.equal((await api(demo)).data.users.length, 4);
    assert.equal(store.getItem("stcs-auth-session"), "real-session-sentinel");
    assert.equal(requests, 0);
  } finally {
    globalThis.fetch = realFetch;
  }
});
