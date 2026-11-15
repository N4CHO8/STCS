// Deliberate cache load in the named disposable lab. Never creates communication events.
import assert from "node:assert/strict";
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { HARDWARE_DEMO_ACCOUNTS } from "./fixtures/hardware-demo-accounts.ts";
const base = "http://127.0.0.1:3100";
assert.equal(process.env.STCS_TEST_ISOLATED, "1");
assert.equal(
  (await (await fetch(base + "/api/health")).json()).testDatabase,
  "127.0.0.1:55432/postgres",
);
const file = join(
  process.env.LOCALAPPDATA,
  "STCS-private",
  "hito3-cache-test.json",
);
const account = HARDWARE_DEMO_ACCOUNTS.find((a) => a.role === "teacher");
const r = await fetch(base + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({ email: account.email, password: account.password }),
});
assert.equal(r.status, 200);
const cookie = r.headers.get("set-cookie").split(";")[0];
async function api(path, body, method = body ? "POST" : "GET") {
  const response = await fetch(base + path, {
    method,
    headers: {
      Cookie: cookie,
      Origin: base,
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    },
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  assert.ok(response.ok, data.message ?? "Lab request failed");
  return data;
}
const save = (state) =>
  writeFileSync(file, JSON.stringify(state, null, 2), { mode: 0o600 });
try {
  if (process.argv.includes("--cleanup")) {
    if (existsSync(file)) {
      const state = JSON.parse(readFileSync(file, "utf8"));
      for (const id of state.ids)
        await api(
          "/api/stcs/pictograms/" + id + "?profileId=" + state.profileId,
          null,
          "DELETE",
        );
      save({ ...state, retiredIds: state.ids, ids: [] });
      console.log(
        "Temporary cache test pictograms retired; original board preserved.",
      );
    }
  } else {
    if (existsSync(file))
      assert.equal(
        JSON.parse(readFileSync(file, "utf8")).ids.length,
        0,
        "Retire the previous cache test before repeating.",
      );
    const portal = (await api("/api/stcs/portal")).data,
      profileId = portal.detail.profile.id;
    const counts = new Map(
      ["Necesidades", "Emociones", "Acciones", "Lugares"].map((c) => [
        c,
        portal.detail.pictograms.filter((p) => p.category === c).length,
      ]),
    );
    const state = { profileId, ids: [], createdAt: new Date().toISOString() };
    save(state);
    let i = 0;
    for (const [category, count] of counts) {
      for (let slot = count; slot < 8; slot++) {
        i++;
        const bytes = await sharp({
          create: {
            width: 96,
            height: 96,
            channels: 3,
            background: {
              r: (i * 31 + 37) % 256,
              g: (i * 71 + 19) % 256,
              b: (i * 101 + 77) % 256,
            },
          },
        })
          .png()
          .toBuffer();
        const form = new FormData();
        form.set(
          "image",
          new Blob([bytes], { type: "image/png" }),
          "cache-test.png",
        );
        const image = await api(
          "/api/stcs/images?profileId=" + profileId,
          form,
        );
        const result = await api(
          "/api/stcs/pictograms?profileId=" + profileId,
          {
            label: "Ensayo caché " + String(i).padStart(2, "0"),
            message: "Necesito beber agua, por favor",
            category,
            colorTone: "sky",
            iconName: "MessageCircle",
            imagePath: image.data.imagePath,
            position: Math.min(32, 14 + i),
          },
        );
        state.ids.push(result.data.id);
        save(state);
      }
    }
    console.log(
      "Created " +
        state.ids.length +
        " temporary images. The assigned board now contains 32 unique images; observe physical cache telemetry before --cleanup.",
    );
  }
} finally {
  await api("/api/auth/logout", {});
}
