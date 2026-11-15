import sharp from "sharp";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { query, transaction } from "./db";
import { canAccessSubject, ForbiddenError } from "./access";
import { canEditBoard } from "@/lib/permissions";
import { InputValidationError } from "./validation";
import { ServiceUnavailableError } from "./errors";
import { UUID_PATTERN } from "./inputs";
import type { AuthTokenPayload } from "./auth";
import {
  DEVICE_MAX_PICTOGRAMS,
  DEVICE_IMAGE_PATHS,
} from "@/lib/pictogramCatalog";
import {
  MEDIA_IMAGE_SIDE,
  MEDIA_IMAGE_BYTES,
  MEDIA_AUDIO_LIMIT,
  MEDIA_UPLOAD_LIMIT,
  MEDIA_VOICE,
  uploadedImageId,
} from "@/lib/media-contract";
import { putMedia, readMedia } from "./media-store";

export const sha256 = (data: Buffer | string) =>
  createHash("sha256").update(data).digest("hex");
export const phraseKey = (text: string) =>
  sha256(JSON.stringify([MEDIA_VOICE, text.normalize("NFC").trim()]));
export async function mediaProfile(user: AuthTokenPayload, edit = false) {
  if (
    !["therapist", "teacher", "guardian"].includes(user.role) ||
    (edit && !canEditBoard(user.role))
  )
    throw new ForbiddenError();
  const r = await query(
    `SELECT sp.id,sp.child_user_id FROM student_profiles sp JOIN user_access ua ON ua.subject_user_id=sp.child_user_id
    WHERE ua.actor_user_id=$1 AND ua.relationship=$2 AND ua.approved_at IS NOT NULL AND sp.is_demo=$3 AND sp.is_private_test=$4 AND ($5::uuid IS NULL OR sp.id=$5) ORDER BY ua.created_at,sp.id LIMIT 1`,
    [
      user.sub,
      user.role,
      Boolean(user.isDemo),
      Boolean(user.isPrivateTest),
      user.profileId ?? null,
    ],
  );
  if (!r.rowCount) throw new ForbiddenError();
  return r.rows[0] as { id: string; child_user_id: string };
}
export async function limitedForm(request: Request, max: number) {
  if (Number(request.headers.get("content-length") ?? 0) > max)
    throw new InputValidationError("El archivo supera el tamaño permitido.");
  const reader = request.body?.getReader();
  if (!reader) throw new InputValidationError("Falta el archivo.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    length += next.value.length;
    if (length > max) {
      await reader.cancel();
      throw new InputValidationError("El archivo supera el tamaño permitido.");
    }
    chunks.push(next.value);
  }
  return new Response(new Blob(chunks as BlobPart[]), {
    headers: { "Content-Type": request.headers.get("content-type") ?? "" },
  }).formData();
}
export async function normalizeImage(data: Buffer) {
  const pngSignature = data
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg =
    data.length > 3 && data[0] === 255 && data[1] === 216 && data[2] === 255;
  const webp =
    data.toString("ascii", 0, 4) === "RIFF" &&
    data.toString("ascii", 8, 12) === "WEBP";
  if (!pngSignature && !jpeg && !webp)
    throw new InputValidationError(
      "El contenido no corresponde a PNG, JPEG o WebP.",
    );
  let metadata;
  try {
    metadata = await sharp(data, { limitInputPixels: 4000000 }).metadata();
  } catch {
    throw new InputValidationError(
      "La imagen no es válida o supera 4 megapíxeles.",
    );
  }
  if (
    !["png", "jpeg", "webp"].includes(metadata.format ?? "") ||
    (metadata.pages ?? 1) > 1
  )
    throw new InputValidationError("Usa una imagen PNG, JPEG o WebP estática.");
  let png: Buffer;
  try {
    png = await sharp(data, { limitInputPixels: 4000000 })
      .rotate()
      .resize(MEDIA_IMAGE_SIDE, MEDIA_IMAGE_SIDE, {
        fit: "contain",
        background: "white",
      })
      .flatten({ background: "white" })
      .png()
      .toBuffer();
  } catch {
    throw new InputValidationError(
      "La imagen est� da�ada o no puede decodificarse.",
    );
  }
  const pixels = await sharp(png)
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer();
  const rgb = Buffer.alloc(MEDIA_IMAGE_BYTES);
  for (let i = 0; i < MEDIA_IMAGE_SIDE * MEDIA_IMAGE_SIDE; i++)
    rgb.writeUInt16LE(
      ((pixels[i * 3] >> 3) << 11) |
        ((pixels[i * 3 + 1] >> 2) << 5) |
        (pixels[i * 3 + 2] >> 3),
      i * 2,
    );
  return { png, rgb, hash: sha256(rgb) };
}
export async function uploadImage(user: AuthTokenPayload, file: File) {
  const profile = await mediaProfile(user, true);
  if (
    !file.size ||
    file.size > MEDIA_UPLOAD_LIMIT ||
    !["image/png", "image/jpeg", "image/webp"].includes(file.type)
  )
    throw new InputValidationError("Usa PNG, JPEG o WebP de hasta 2 MB.");
  const id = randomUUID(),
    image = await normalizeImage(Buffer.from(await file.arrayBuffer()));
  return transaction(async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      profile.id,
    ]);
    const count = await db.query(
      "SELECT COUNT(*)::int AS n FROM pictogram_images WHERE student_profile_id=$1",
      [profile.id],
    );
    if (count.rows[0].n >= DEVICE_MAX_PICTOGRAMS * 2)
      throw new InputValidationError(
        `El perfil alcanzó el límite de ${DEVICE_MAX_PICTOGRAMS * 2} imágenes. Reutiliza una imagen o solicita limpieza de archivos sin usar.`,
      );
    const prefix = `images/${profile.id}/${id}`;
    await putMedia(prefix + ".png", image.png, "image/png");
    await putMedia(prefix + ".rgb", image.rgb, "application/octet-stream");
    await db.query(
      "INSERT INTO pictogram_images(id,student_profile_id,png_key,rgb_key,rgb_sha256,png_bytes) VALUES($1,$2,$3,$4,$5,$6)",
      [
        id,
        profile.id,
        prefix + ".png",
        prefix + ".rgb",
        image.hash,
        image.png.length,
      ],
    );
    return {
      imagePath: `/api/stcs/images/${id}`,
      width: MEDIA_IMAGE_SIDE,
      height: MEDIA_IMAGE_SIDE,
    };
  });
}
export async function imageForUser(user: AuthTokenPayload, id: string) {
  if (!UUID_PATTERN.test(id))
    throw new InputValidationError("Imagen inválida.");
  const r = await query(
    "SELECT i.png_key,sp.child_user_id FROM pictogram_images i JOIN student_profiles sp ON sp.id=i.student_profile_id WHERE i.id=$1",
    [id],
  );
  if (
    !r.rowCount ||
    !(await canAccessSubject(user, r.rows[0].child_user_id)).allowed
  )
    throw new ForbiddenError();
  return readMedia(r.rows[0].png_key);
}
// Bounded by the fixed allowlist. This is a derivable per-instance optimization,
// not durable state; private uploads and authorization never use this cache.
const catalogCache = new Map<string, ReturnType<typeof normalizeImage>>();
export async function catalogImage(path: string) {
  if (!DEVICE_IMAGE_PATHS.has(path))
    throw new InputValidationError("Imagen no disponible.");
  let image = catalogCache.get(path);
  if (!image) {
    image = readFile(join(process.cwd(), "public", path)).then(normalizeImage);
    catalogCache.set(path, image);
    void image.catch(() => catalogCache.delete(path));
  }
  return image;
}
export function authorizeWorker(request: Request) {
  const expected = process.env.STCS_MEDIA_WORKER_KEY,
    provided = request.headers.get("x-stcs-worker-key");
  if (!expected || expected.length < 32)
    throw new ServiceUnavailableError(
      "El preparador de voz no está configurado.",
    );
  if (
    !provided ||
    !timingSafeEqual(
      Buffer.from(sha256(provided)),
      Buffer.from(sha256(expected)),
    )
  )
    throw new ForbiddenError();
}
export async function claimAudioJob() {
  return transaction(async (db) => {
    await db.query(
      "UPDATE phrase_audio SET status='error',error='La preparación venció. Reintenta.',lease=NULL,lease_until=NULL WHERE status='processing' AND lease_until<NOW() AND attempts>=3",
    );
    const r = await db.query(
      `SELECT cache_key,phrase,voice FROM phrase_audio a WHERE (status='pending' OR (status='processing' AND lease_until<NOW())) AND attempts<3 AND EXISTS(SELECT 1 FROM pictograms p WHERE p.audio_key=a.cache_key AND p.is_active=TRUE) ORDER BY updated_at FOR UPDATE SKIP LOCKED LIMIT 1`,
    );
    if (!r.rowCount) return null;
    const row = r.rows[0],
      lease = randomUUID();
    await db.query(
      "UPDATE phrase_audio SET status='processing',lease=$2,lease_until=NOW()+INTERVAL '90 seconds',attempts=attempts+1,error=NULL,updated_at=NOW() WHERE cache_key=$1",
      [row.cache_key, lease],
    );
    return { ...row, lease };
  });
}

export async function withAudioState<T extends { id: string; message: string }>(
  items: T[],
) {
  if (!items.length) return [];
  const r = await query(
    "SELECT cache_key,status,error,sha256,byte_size FROM phrase_audio WHERE cache_key=ANY($1::text[])",
    [items.map((p) => phraseKey(p.message))],
  );
  const map = new Map(r.rows.map((a) => [a.cache_key, a]));
  return items.map((p) => {
    const key = phraseKey(p.message),
      audio = map.get(key);
    return {
      ...p,
      audioKey: key,
      audioStatus: audio?.status ?? "missing",
      audioError: audio?.error ?? null,
      ...(audio?.status === "ready"
        ? {
            audioSha256: audio.sha256,
            audioBytes: audio.byte_size,
            audioUrl: `/api/stcs/pictograms/${p.id}/audio`,
          }
        : {}),
    };
  });
}

export async function deviceMediaConfig<
  T extends { id: string; imagePath: string | null; audioSha256?: string },
>(code: string, items: T[]) {
  return Promise.all(
    items.map(async (p) => {
      let hash: string;
      const id = uploadedImageId(p.imagePath ?? "");
      if (id) {
        const r = await query(
          "SELECT rgb_sha256 FROM pictogram_images WHERE id=$1",
          [id],
        );
        if (!r.rowCount)
          throw new ServiceUnavailableError("Falta una imagen del tablero.");
        hash = r.rows[0].rgb_sha256;
      } else hash = (await catalogImage(p.imagePath ?? "")).hash;
      const base = `/api/stcs/devices/${encodeURIComponent(code)}/media/${p.id}`;
      return {
        ...p,
        imageSha256: hash,
        imageBytes: MEDIA_IMAGE_BYTES,
        imageUrl: base + `/image?v=${hash}`,
        ...(p.audioSha256
          ? { audioUrl: base + `/audio?v=${p.audioSha256}` }
          : {}),
      };
    }),
  );
}

export async function pictogramForUser(
  user: AuthTokenPayload,
  id: string,
  edit = false,
) {
  if (!UUID_PATTERN.test(id))
    throw new InputValidationError("Pictograma inválido.");
  const r = await query(
    "SELECT id,student_profile_id,message,image_path FROM pictograms WHERE id=$1 AND is_active=TRUE",
    [id],
  );
  if (!r.rowCount) throw new ForbiddenError();
  await mediaProfile(
    { ...user, profileId: r.rows[0].student_profile_id },
    edit,
  );
  return r.rows[0];
}
export async function prepareAudioForUser(user: AuthTokenPayload, id: string) {
  const scope = await pictogramForUser(user, id, true);
  const message = await transaction(async (db) => {
    // Use the same profile lock as editing so a retry cannot restore an old phrase association.
    await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      scope.student_profile_id,
    ]);
    const current = await db.query(
      "SELECT message FROM pictograms WHERE id=$1 AND is_active=TRUE FOR UPDATE",
      [id],
    );
    if (!current.rowCount) throw new ForbiddenError();
    const phrase = current.rows[0].message.normalize("NFC").trim(),
      key = phraseKey(phrase);
    await db.query(
      "INSERT INTO phrase_audio(cache_key,phrase,voice) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
      [key, phrase, MEDIA_VOICE],
    );
    await db.query("UPDATE pictograms SET audio_key=$2 WHERE id=$1", [id, key]);
    await db.query(
      "UPDATE phrase_audio SET status='pending',attempts=0,error=NULL,updated_at=NOW() WHERE cache_key=$1 AND status='error'",
      [key],
    );
    return phrase;
  });
  return (await withAudioState([{ id, message }]))[0];
}
export async function audioForPhrase(text: string) {
  const r = await query(
    "SELECT object_key,sha256,byte_size FROM phrase_audio WHERE cache_key=$1 AND status='ready'",
    [phraseKey(text)],
  );
  if (!r.rowCount)
    throw new ServiceUnavailableError(
      "La voz aún no está preparada. Reintenta cuando esté lista.",
    );
  return {
    data: await readMedia(r.rows[0].object_key),
    hash: r.rows[0].sha256,
  };
}
export async function deviceMedia(
  code: string,
  id: string,
  kind: string,
  version: string | null,
) {
  if (!UUID_PATTERN.test(id) || !["image", "audio"].includes(kind))
    throw new InputValidationError("Archivo inválido.");
  const r = await query(
    "SELECT p.message,p.image_path,p.student_profile_id FROM pictograms p JOIN devices d ON d.student_profile_id=p.student_profile_id WHERE d.device_code=$1 AND p.id=$2 AND p.is_active=TRUE",
    [code, id],
  );
  if (!r.rowCount) throw new ForbiddenError();
  const p = r.rows[0];
  let result: { data: Buffer; hash: string };
  if (kind === "audio") result = await audioForPhrase(p.message);
  else {
    const uploaded = uploadedImageId(p.image_path ?? "");
    if (uploaded) {
      const img = await query(
        "SELECT rgb_key,rgb_sha256 FROM pictogram_images WHERE id=$1 AND student_profile_id=$2",
        [uploaded, p.student_profile_id],
      );
      if (!img.rowCount) throw new ForbiddenError();
      result = {
        data: await readMedia(img.rows[0].rgb_key),
        hash: img.rows[0].rgb_sha256,
      };
    } else {
      const img = await catalogImage(p.image_path);
      result = { data: img.rgb, hash: img.hash };
    }
  }
  if (version && version !== result.hash)
    throw new InputValidationError(
      "El archivo cambió. Sincroniza nuevamente el tablero.",
    );
  return result;
}
export function validateWav(data: Buffer) {
  if (
    data.length < 44 ||
    data.length > MEDIA_AUDIO_LIMIT ||
    data.toString("ascii", 0, 4) !== "RIFF" ||
    data.toString("ascii", 8, 12) !== "WAVE" ||
    data.readUInt32LE(4) + 8 !== data.length
  )
    throw new InputValidationError(
      "Audio WAV inválido o superior a 10 segundos.",
    );
  let pos = 12,
    format = false,
    samples = false;
  while (pos + 8 <= data.length) {
    const name = data.toString("ascii", pos, pos + 4),
      size = data.readUInt32LE(pos + 4);
    if (pos + 8 + size > data.length)
      throw new InputValidationError("Audio incompleto.");
    if (name === "fmt ") {
      format =
        size >= 16 &&
        data.readUInt16LE(pos + 8) === 1 &&
        data.readUInt16LE(pos + 10) === 1 &&
        data.readUInt32LE(pos + 12) === 16000 &&
        data.readUInt32LE(pos + 16) === 32000 &&
        data.readUInt16LE(pos + 20) === 2 &&
        data.readUInt16LE(pos + 22) === 16;
    }
    if (name === "data") samples = size > 0 && size % 2 === 0 && size <= 320000;
    pos += 8 + size + (size % 2);
  }
  if (!format || !samples)
    throw new InputValidationError(
      "Se requiere WAV PCM mono de 16 kHz y 16 bits.",
    );
}
export async function completeAudioJob(
  key: string,
  lease: string,
  wav: Buffer | null,
) {
  if (!/^[a-f0-9]{64}$/.test(key) || !UUID_PATTERN.test(lease))
    throw new InputValidationError("Trabajo inválido.");
  return transaction(async (db) => {
    const r = await db.query(
      "SELECT cache_key FROM phrase_audio WHERE cache_key=$1 AND lease=$2 AND status='processing' AND lease_until>NOW() FOR UPDATE",
      [key, lease],
    );
    if (!r.rowCount)
      throw new InputValidationError(
        "La preparación venció o fue reemplazada.",
      );
    if (!wav) {
      await db.query(
        "UPDATE phrase_audio SET status='error',error='No se pudo preparar la voz. Reintenta.',lease=NULL,lease_until=NULL,updated_at=NOW() WHERE cache_key=$1",
        [key],
      );
      return;
    }
    validateWav(wav);
    const object = `audio/${key}.wav`;
    await putMedia(object, wav, "audio/wav");
    await db.query(
      "UPDATE phrase_audio SET status='ready',object_key=$2,sha256=$3,byte_size=$4,error=NULL,lease=NULL,lease_until=NULL,updated_at=NOW() WHERE cache_key=$1",
      [key, object, sha256(wav), wav.length],
    );
  });
}
