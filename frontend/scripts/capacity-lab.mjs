// Owned synthetic load only. Fixed loopback database + server identity, never shared .env.
import assert from "node:assert/strict";
import pg from "pg";
import sharp from "sharp";
import { randomUUID, createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  DEVICE_CATEGORIES,
  DEVICE_MAX_PICTOGRAMS,
} from "../src/lib/pictogramCatalog.ts";
import { MEDIA_VOICE } from "../src/lib/media-contract.ts";
assert.equal(process.env.STCS_TEST_ISOLATED, "1");
const base = "http://127.0.0.1:3100";
assert.equal(
  (await (await fetch(base + "/api/health")).json()).testDatabase,
  "127.0.0.1:55432/postgres",
);
const folder = join(process.env.LOCALAPPDATA, "STCS-private");
const config = JSON.parse(
  readFileSync(join(folder, "hito3-local.json"), "utf8"),
);
assert.equal(config.deviceCode, "STCS-LAB-H3-001");
const statePath = join(folder, "capacity-lab.json");
const state = existsSync(statePath)
  ? JSON.parse(readFileSync(statePath, "utf8"))
  : { ids: [], sequence: 0 };
const db = new pg.Client({
  connectionString:
    "postgresql://postgres:stcs-isolated-tests@127.0.0.1:55432/postgres",
});
await db.connect();
try {
  const owner = await db.query(
    "SELECT sp.id FROM student_profiles sp JOIN users u ON u.id=sp.child_user_id WHERE sp.id=$1 AND u.email='perfil.hito3@local.test' AND sp.is_private_test=TRUE",
    [config.profileId],
  );
  assert.equal(owner.rowCount, 1);
  if (process.argv.includes("--cleanup")) {
    await db.query(
      "UPDATE pictograms SET is_active=FALSE WHERE id=ANY($1::uuid[]) AND student_profile_id=$2",
      [state.ids, config.profileId],
    );
    state.retiredIds = [...(state.retiredIds ?? []), ...state.ids];
    state.ids = [];
  } else {
    const target = Number(process.argv[process.argv.indexOf("--target") + 1]);
    assert.ok(
      target >= 32 && target <= DEVICE_MAX_PICTOGRAMS && target % 4 === 0,
    );
    const phrase = "Necesito beber agua, por favor";
    const audioKey = createHash("sha256")
      .update(JSON.stringify([MEDIA_VOICE, phrase]))
      .digest("hex");
    await db.query(
      "INSERT INTO phrase_audio(cache_key,phrase,voice) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
      [audioKey, phrase, MEDIA_VOICE],
    );
    const positions = new Set(
      (
        await db.query(
          "SELECT position FROM pictograms WHERE student_profile_id=$1 AND is_active=TRUE",
          [config.profileId],
        )
      ).rows.map((r) => r.position),
    );
    let next = 1;
    for (const category of DEVICE_CATEGORIES) {
      const currentCount = Number(
        (
          await db.query(
            "SELECT count(*) FROM pictograms WHERE student_profile_id=$1 AND category=$2 AND is_active=TRUE",
            [config.profileId, category],
          )
        ).rows[0].count,
      );
      if (currentCount > target / 4) {
        const retired = await db.query(
          "UPDATE pictograms SET is_active=FALSE WHERE id IN (SELECT id FROM pictograms WHERE id=ANY($1::uuid[]) AND student_profile_id=$2 AND category=$3 AND is_active=TRUE ORDER BY position DESC LIMIT $4) RETURNING id",
          [state.ids, config.profileId, category, currentCount - target / 4],
        );
        assert.equal(retired.rowCount, currentCount - target / 4);
        const ids = retired.rows.map((r) => r.id);
        state.ids = state.ids.filter((id) => !ids.includes(id));
        state.retiredIds = [...(state.retiredIds ?? []), ...ids];
      }

      const count = Number(
        (
          await db.query(
            "SELECT count(*) FROM pictograms WHERE student_profile_id=$1 AND category=$2 AND is_active=TRUE",
            [config.profileId, category],
          )
        ).rows[0].count,
      );
      for (let slot = count; slot < target / 4; slot++) {
        const number = ++state.sequence,
          id = randomUUID(),
          imageId = randomUUID();
        const svg = `<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="90" height="90" rx="16" fill="hsl(${(number * 47) % 360},65%,70%)"/><circle cx="48" cy="48" r="34" fill="white"/><text x="48" y="62" text-anchor="middle" font-family="sans-serif" font-size="38" fill="black">${number}</text></svg>`;
        const png = await sharp(Buffer.from(svg)).png().toBuffer(),
          pixels = await sharp(png)
            .removeAlpha()
            .toColourspace("srgb")
            .raw()
            .toBuffer(),
          rgb = Buffer.alloc(18432);
        for (let i = 0; i < 9216; i++)
          rgb.writeUInt16LE(
            ((pixels[i * 3] >> 3) << 11) |
              ((pixels[i * 3 + 1] >> 2) << 5) |
              (pixels[i * 3 + 2] >> 3),
            i * 2,
          );
        const prefix = `images/${config.profileId}/${imageId}`,
          media = join(folder, "hito3-media");
        mkdirSync(join(media, "images", config.profileId), { recursive: true });
        writeFileSync(join(media, prefix + ".png"), png);
        writeFileSync(join(media, prefix + ".rgb"), rgb);
        while (positions.has(next)) next++;
        assert.ok(next <= target);
        positions.add(next);
        await db.query("BEGIN");
        try {
          await db.query(
            "INSERT INTO pictogram_images(id,student_profile_id,png_key,rgb_key,rgb_sha256,png_bytes) VALUES($1,$2,$3,$4,$5,$6)",
            [
              imageId,
              config.profileId,
              prefix + ".png",
              prefix + ".rgb",
              createHash("sha256").update(rgb).digest("hex"),
              png.length,
            ],
          );
          await db.query(
            "INSERT INTO pictograms(id,student_profile_id,label,message,category,color_tone,icon_name,image_path,position,is_active,audio_key) VALUES($1,$2,$3,$4,$5,'sky','MessageCircle',$6,$7,TRUE,$8)",
            [
              id,
              config.profileId,
              "Ensayo " + String(number).padStart(3, "0"),
              phrase,
              category,
              "/api/stcs/images/" + imageId,
              next++,
              audioKey,
            ],
          );
          await db.query("COMMIT");
        } catch (e) {
          await db.query("ROLLBACK");
          throw e;
        }
        state.ids.push(id);
        writeFileSync(statePath, JSON.stringify(state, null, 2));
      }
    }
  }
  if (process.argv.includes("--unique-phrases")) {
    // Only our numbered, isolated fixtures. Real messages and the five manual
    // baseline pictograms remain untouched; every generated phrase has its own job.
    const owned = await db.query(
      "SELECT id,label FROM pictograms WHERE id=ANY($1::uuid[]) AND student_profile_id=$2 AND is_active=TRUE",
      [state.ids, config.profileId],
    );
    await db.query("BEGIN");
    try {
      for (const item of owned.rows) {
        assert.match(item.label, /^Ensayo \d+$/);
        const phrase =
          "Este es el mensaje de ensayo número " +
          Number(item.label.split(" ")[1]) +
          ".";
        const key = createHash("sha256")
          .update(JSON.stringify([MEDIA_VOICE, phrase]))
          .digest("hex");
        await db.query(
          "INSERT INTO phrase_audio(cache_key,phrase,voice) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
          [key, phrase, MEDIA_VOICE],
        );
        await db.query(
          "UPDATE pictograms SET message=$2,audio_key=$3 WHERE id=$1",
          [item.id, phrase, key],
        );
      }
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  }
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  const board = await fetch(
    base + "/api/stcs/devices/" + config.deviceCode + "/config",
    { headers: { "x-stcs-device-key": config.deviceKey } },
  );
  assert.equal(board.status, 200);
  const text = await board.text(),
    data = JSON.parse(text).data;
  console.log(
    JSON.stringify({
      activePictograms: data.pictograms.length,
      jsonBytes: Buffer.byteLength(text),
      configuredLimit: DEVICE_MAX_PICTOGRAMS,
      syntheticOnly: true,
      noCommunicationEventsCreated: true,
    }),
  );
} finally {
  await db.end();
}
