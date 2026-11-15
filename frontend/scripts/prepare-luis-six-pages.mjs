// Explicit owner-authorized catalog population, never invoked by login.
// Uses the assigned adult API and preserves all existing pictograms and events.
import assert from "node:assert/strict";
import {
  ADDITIONAL_PICTOGRAM_ASSETS,
  DEVICE_CATEGORIES,
} from "../src/lib/pictogramCatalog.ts";
import { HARDWARE_DEMO_ACCOUNTS } from "./fixtures/hardware-demo-accounts.ts";
const args = process.argv.slice(2);
const origin = new URL(
  args.includes("--origin")
    ? args[args.indexOf("--origin") + 1]
    : "https://0stcs0.vercel.app",
);
assert.ok(
  origin.protocol === "https:" &&
    (origin.hostname === "0stcs0.vercel.app" ||
      /^frontend-[a-z0-9]+-nachobenegas-projects\.vercel\.app$/.test(
        origin.hostname,
      )),
);
let cookie = "";
async function api(path, body) {
  const r = await fetch(origin.origin + path, {
    method: body ? "POST" : "GET",
    redirect: "error",
    headers: {
      Origin: origin.origin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(90000),
  });
  assert.ok(r.ok, `STCS API returned ${r.status} at ${path}`);
  return r;
}
const account = HARDWARE_DEMO_ACCOUNTS.find((a) => a.role === "therapist");
const login = await api("/api/auth/login", {
  email: account.email,
  password: account.password,
});
cookie = login.headers.get("set-cookie").split(";")[0];
try {
  const portal = (await (await api("/api/stcs/portal")).json()).data;
  assert.equal(portal.role, "therapist");
  assert.equal(portal.isPrivateTest, true);
  assert.equal(portal.profiles.length, 1);
  assert.equal(portal.profiles[0].label, "Luis");
  const profile = portal.profiles[0].id,
    existing = portal.detail.pictograms;
  const missing = ADDITIONAL_PICTOGRAM_ASSETS.filter(
    (a) =>
      !existing.some((p) => p.category === a.category && p.label === a.label),
  );
  const counts = Object.fromEntries(
    DEVICE_CATEGORIES.map((category) => [
      category,
      existing.filter((p) => p.category === category).length +
        missing.filter((p) => p.category === category).length,
    ]),
  );
  assert.ok(
    Object.values(counts).every((n) => n === 24),
    "Unexpected baseline; review instead of deleting or replacing records.",
  );
  console.log(
    JSON.stringify({
      dryRun: !args.includes("--apply"),
      existing: existing.length,
      add: missing.length,
      result: counts,
      noEventsCreated: true,
    }),
  );
  if (args.includes("--apply")) {
    let created = 0;
    for (const {
      label,
      message,
      category,
      colorTone,
      iconName,
      imagePath,
    } of missing) {
      // Omit position: the serialized server transaction chooses the first free slot.
      await api("/api/stcs/pictograms?profileId=" + profile, {
        label,
        message,
        category,
        colorTone,
        iconName,
        imagePath,
      });
      console.log(
        "Catalog pictogram added: " + ++created + "/" + missing.length,
      );
    }
    const final = (
      await (await api("/api/stcs/portal?profileId=" + profile)).json()
    ).data.detail.pictograms;
    assert.equal(final.length, 96);
    assert.ok(
      DEVICE_CATEGORIES.every(
        (c) => final.filter((p) => p.category === c).length === 24,
      ),
    );
    console.log(
      "PASS: 96 active pictograms, 24 per category; original records preserved.",
    );
  }
} finally {
  await api("/api/auth/logout", {});
}
