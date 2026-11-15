import assert from "node:assert/strict";
import sharp from "sharp";
import { DEVICE_MAX_PICTOGRAMS } from "../src/lib/pictogramCatalog.ts";
import { randomUUID, createHash } from "node:crypto";
const worker = "isolated-worker-key-never-used-in-cloud-123456";
export async function verifyMedia({
  db,
  base,
  profileId,
  therapist,
  teacher,
  guardian,
  admin,
  unassigned,
  deviceCode,
  deviceKey,
}) {
  assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):/);
  let checks = 0;
  const imageIds = [];
  let createdId;
  let previousPosition;
  const pictogram = (
    await db.query(
      "SELECT id,position FROM pictograms WHERE student_profile_id=$1 AND is_active=TRUE ORDER BY position LIMIT 1",
      [profileId],
    )
  ).rows[0];
  assert.ok(
    pictogram,
    "The isolated fixture must contain a baseline pictogram",
  );
  async function call(
    path,
    token,
    body,
    status = 200,
    method = body ? "POST" : "GET",
  ) {
    const headers = {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    };
    const r = await fetch(base + path, {
      method,
      headers,
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });
    assert.equal(r.status, status, path + " HTTP " + r.status);
    checks++;
    return r;
  }
  function form(bytes, type = "image/png") {
    const f = new FormData();
    f.set("image", new Blob([bytes], { type }), "nueva.png");
    return f;
  }
  const image = await sharp({
    create: { width: 47, height: 63, channels: 3, background: "#e835a1" },
  })
    .png()
    .toBuffer();
  try {
    // Cloud maintenance endpoints never inherit adult portal permissions.
    for (const path of [
      "/api/internal/media-run",
      "/api/internal/media-storage",
    ])
      for (const token of [undefined, admin, teacher])
        await call(path, token, {}, 403);
    // A valid PNG header does not mean the compressed pixel payload is decodable.
    await call(
      "/api/stcs/images?profileId=" + profileId,
      therapist,
      form(image.subarray(0, 45)),
      400,
    );
    for (const role of [guardian, admin, unassigned])
      await call(
        "/api/stcs/images?profileId=" + profileId,
        role,
        form(image),
        403,
      );
    await call(
      "/api/stcs/images?profileId=" + profileId,
      therapist,
      form(Buffer.from("<svg/>"), "image/svg+xml"),
      400,
    );
    await call(
      "/api/stcs/images?profileId=" + profileId,
      therapist,
      form(Buffer.from("<svg/>")),
      400,
    );
    await call(
      "/api/stcs/images?profileId=" + profileId,
      therapist,
      form(Buffer.alloc(2 * 1024 * 1024 + 1)),
      400,
    );
    const uploaded = await (
      await call(
        "/api/stcs/images?profileId=" + profileId,
        teacher,
        form(image),
        201,
      )
    ).json();
    imageIds.push(uploaded.data.imagePath.split("/").at(-1));
    const img = await call(uploaded.data.imagePath, therapist);
    assert.equal(
      (await sharp(Buffer.from(await img.arrayBuffer())).metadata()).width,
      96,
    );
    await call(uploaded.data.imagePath, admin, null, 403);
    await call(uploaded.data.imagePath, unassigned, null, 403);
    const message = "Quiero tomar agua " + randomUUID().slice(0, 7);
    const input = {
      label: "Imagen nueva " + randomUUID().slice(0, 5),
      message,
      category: "Lugares",
      colorTone: "sky",
      iconName: "MessageCircle",
      imagePath: uploaded.data.imagePath,
    };
    // A retired/gapped board can retain slot 32 while still having space.
    // Creating without an explicit slot must reuse a gap, never emit slot 33.
    previousPosition = (
      await db.query("SELECT position FROM pictograms WHERE id=$1", [
        pictogram.id,
      ])
    ).rows[0].position;
    await db.query("UPDATE pictograms SET position=$2 WHERE id=$1", [
      pictogram.id,
      DEVICE_MAX_PICTOGRAMS,
    ]);
    const saved = await (
      await call(
        "/api/stcs/pictograms?profileId=" + profileId,
        therapist,
        input,
        201,
      )
    ).json();
    createdId = saved.data.id;
    assert.ok(
      saved.data.position >= 1 && saved.data.position <= DEVICE_MAX_PICTOGRAMS,
    );
    await db.query("UPDATE pictograms SET position=$2 WHERE id=$1", [
      pictogram.id,
      previousPosition,
    ]);
    previousPosition = undefined;
    const stored = (
      await db.query(
        "SELECT message,image_path,audio_key FROM pictograms WHERE id=$1",
        [createdId],
      )
    ).rows[0];
    assert.equal(stored.message, message);
    assert.equal(stored.image_path, input.imagePath);
    assert.match(stored.audio_key, /^[0-9a-f]{64}$/);
    await db.query(
      "UPDATE phrase_audio SET updated_at='2000-01-01' WHERE cache_key=$1",
      [stored.audio_key],
    );
    await call("/api/internal/media-jobs", null, {}, 403);
    // The queue is private even to an adult with the application administrator role.
    await call("/api/internal/media-jobs", admin, {}, 403);
    async function claim() {
      const r = await fetch(base + "/api/internal/media-jobs", {
        method: "POST",
        headers: { "x-stcs-worker-key": worker },
      });
      assert.equal(r.status, 200);
      checks++;
      return (await r.json()).data;
    }
    const job = await claim();
    assert.equal(job.phrase, message);
    assert.equal(job.cache_key, stored.audio_key);
    const noDuplicate = await claim();
    assert.notEqual(noDuplicate?.cache_key, job.cache_key);
    const wav = Buffer.alloc(44 + 3200);
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
    wav.writeUInt32LE(3200, 40);
    async function complete(lease, bytes, status = 200) {
      const f = new FormData();
      f.set("lease", lease);
      f.set("audio", new Blob([bytes], { type: "audio/wav" }), "voice.wav");
      const r = await fetch(
        base + "/api/internal/media-jobs/" + job.cache_key,
        { method: "POST", headers: { "x-stcs-worker-key": worker }, body: f },
      );
      assert.equal(r.status, status);
      checks++;
    }
    await complete(randomUUID(), wav, 400);
    await complete(job.lease, Buffer.from("not a wav"), 400);
    await complete(job.lease, wav);
    const ready = await (
      await call(`/api/stcs/pictograms/${createdId}/audio?status=1`, teacher)
    ).json();
    assert.equal(ready.data.audioStatus, "ready");
    assert.equal(ready.data.audioKey, job.cache_key);
    const audio = await call(
      `/api/stcs/pictograms/${createdId}/audio`,
      guardian,
    );
    assert.deepEqual(Buffer.from(await audio.arrayBuffer()), wav);
    async function hardware(path, status = 200) {
      const r = await fetch(base + path, {
        headers: { "x-stcs-device-key": deviceKey },
      });
      assert.equal(r.status, status);
      checks++;
      return r;
    }
    const board = (
      await (await hardware(`/api/stcs/devices/${deviceCode}/config`)).json()
    ).data;
    assert.deepEqual(Object.keys(board.profile), ["id"]);
    const assigned = board.pictograms.find((p) => p.id === createdId);
    assert.ok(assigned);
    assert.equal(assigned.message, message);
    assert.equal(assigned.audioStatus, "ready");
    const raw = Buffer.from(
      await (await hardware(assigned.imageUrl)).arrayBuffer(),
    );
    assert.equal(raw.length, 96 * 96 * 2);
    assert.equal(
      createHash("sha256").update(raw).digest("hex"),
      assigned.imageSha256,
    );
    assert.deepEqual(
      Buffer.from(await (await hardware(assigned.audioUrl)).arrayBuffer()),
      wav,
    );
    await hardware(
      assigned.imageUrl.replace(assigned.imageSha256, "0".repeat(64)),
      400,
    );
    await hardware(
      `/api/stcs/devices/${deviceCode}/media/${randomUUID()}/image`,
      403,
    );
    await call(`/api/stcs/pictograms/${createdId}/audio`, admin, null, 403);
    await call(
      `/api/stcs/pictograms/${createdId}/audio`,
      unassigned,
      null,
      403,
    );
    await call(`/api/stcs/pictograms/${createdId}/audio`, guardian, {}, 403);
    await call(`/api/stcs/pictograms/${createdId}/audio`, teacher, {});
    assert.equal(
      (
        await db.query("SELECT attempts FROM phrase_audio WHERE cache_key=$1", [
          job.cache_key,
        ])
      ).rows[0].attempts,
      1,
    );
    await call(
      `/api/stcs/pictograms/${createdId}?profileId=${profileId}`,
      therapist,
      { ...input, label: "Otro nombre", imagePath: "/pictograms/food.png" },
      200,
      "PUT",
    );
    assert.equal(
      (
        await db.query("SELECT audio_key FROM pictograms WHERE id=$1", [
          createdId,
        ])
      ).rows[0].audio_key,
      job.cache_key,
    );
    assert.deepEqual(
      Buffer.from(
        await (
          await call(`/api/stcs/pictograms/${createdId}/audio`, teacher)
        ).arrayBuffer(),
      ),
      wav,
    );
    const edited = await (
      await call(
        `/api/stcs/pictograms/${createdId}?profileId=${profileId}`,
        therapist,
        { ...input, message: "Necesito descansar " + randomUUID().slice(0, 5) },
        200,
        "PUT",
      )
    ).json();
    assert.equal(edited.data.id, createdId);
    const after = (
      await db.query("SELECT audio_key FROM pictograms WHERE id=$1", [
        createdId,
      ])
    ).rows[0];
    assert.notEqual(after.audio_key, job.cache_key);
    await call(
      `/api/stcs/pictograms/${createdId}/audio?v=${job.cache_key}`,
      therapist,
      null,
      400,
    );
    await call(`/api/stcs/pictograms/${createdId}/audio`, therapist, null, 503);
    await hardware(assigned.audioUrl, 503);
    await db.query(
      "UPDATE phrase_audio SET updated_at='1999-01-01' WHERE cache_key=$1",
      [after.audio_key],
    );
    const failedJob = await claim();
    assert.equal(failedJob.cache_key, after.audio_key);
    const failed = await fetch(
      base + "/api/internal/media-jobs/" + failedJob.cache_key,
      {
        method: "POST",
        headers: {
          "x-stcs-worker-key": worker,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lease: failedJob.lease }),
      },
    );
    assert.equal(failed.status, 200);
    checks++;
    const failureState = await (
      await call(`/api/stcs/pictograms/${createdId}/audio?status=1`, teacher)
    ).json();
    assert.equal(failureState.data.audioStatus, "error");
    const retried = await (
      await call(`/api/stcs/pictograms/${createdId}/audio`, teacher, {})
    ).json();
    assert.equal(retried.data.audioStatus, "pending");
    // No hardware event is fabricated by creating/editing/previewing a pictogram.
    assert.equal(
      (
        await db.query(
          "SELECT COUNT(*)::int AS n FROM device_events WHERE pictogram_id=$1",
          [createdId],
        )
      ).rows[0].n,
      0,
    );
    return checks;
  } finally {
    if (previousPosition !== undefined)
      await db.query("UPDATE pictograms SET position=$2 WHERE id=$1", [
        pictogram.id,
        previousPosition,
      ]);
    if (createdId)
      await db.query("DELETE FROM pictograms WHERE id=$1", [createdId]);
    await db.query("DELETE FROM pictogram_images WHERE id=ANY($1::uuid[])", [
      imageIds,
    ]);
  }
}
