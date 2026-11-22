import { randomUUID } from "crypto";
import type { HistoryFilters } from "@/lib/history-contract";
import { csvDocument } from "@/lib/history-contract";
import { HISTORY_PREDICATE, historyParams } from "./history-filters";
import type { QueryResultRow } from "pg";

import { canAccessSubject, ForbiddenError } from "./access";
import { canReadSensitive, canEditBoard } from "@/lib/permissions";
import type { AuthTokenPayload } from "./auth";
import { query, transaction } from "./db";
import { phraseKey, withAudioState, deviceMediaConfig } from "./media";
import { MEDIA_VOICE, uploadedImageId } from "@/lib/media-contract";
import type { PoolClient } from "pg";
import { getBoardSelection, assertUsableSelection } from "./board-selection";
import type { DeviceEventInput, PictogramInput } from "./validation";
import {
  DEVICE_MAX_ITEMS_PER_CATEGORY,
  getCatalogAsset,
} from "@/lib/pictogramCatalog";

export class StcsConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StcsConflictError";
  }
}

export class StcsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StcsNotFoundError";
  }
}

export interface StudentProfile {
  id: string;
  childUserId: string;
  displayName: string;
  age: number;
  supportLevel: string;
  mainContext: string;
}

export interface DeviceInfo {
  id: string;
  code: string;
  name: string;
  status: string;
  batteryLevel: number;
  powerSource?: "usb" | "battery" | "unknown";
  wifiSsid: string | null;
  firmwareVersion: string;
  lastSyncAt: string | null;
}

export interface PictogramConfig {
  audioStatus?: import("@/lib/media-contract").AudioStatus;
  audioError?: string | null;
  audioKey?: string;
  audioUrl?: string;
  imageSha256?: string;
  imageBytes?: number;
  imageUrl?: string;
  audioSha256?: string;
  audioBytes?: number;
  id: string;
  label: string;
  message: string;
  category: string;
  colorTone: string;
  iconName: string;
  imagePath: string | null;
  position: number;
}

export interface DeviceEvent {
  id: string;
  pictogramId: string | null;
  eventType: string;
  actionLabel: string;
  context: string;
  actorName: string;
  emotion: string | null;
  intensity: number | null;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface StcsOverview {
  user: {
    id: string;
    name: string;
    role: string;
  };
  profile: StudentProfile;
  device: DeviceInfo;
  pictograms: PictogramConfig[];
  metrics: {
    interactionsToday: number;
    emotionsToday: number;
    deviceStatus: string;
  };
  weeklyUse: Array<{ day: string; interactions: number }>;
  categoryUse: Array<{ name: string; value: number }>;
  emotionProgress: Array<{ day: string; positive: number; difficult: number }>;
  recentActivity: DeviceEvent[];
}

export interface DeviceBoardConfig {
  device: DeviceInfo;
  profile: StudentProfile;
  pictograms: PictogramConfig[];
}

interface ProfileRow extends QueryResultRow {
  id: string;
  child_user_id: string;
  display_name: string;
  age: number;
  support_level: string;
  main_context: string;
}

interface DeviceRow extends QueryResultRow {
  id: string;
  student_profile_id: string;
  device_code: string;
  name: string;
  status: string;
  battery_level: number;
  power_source: "usb" | "battery" | "unknown";
  wifi_ssid: string | null;
  firmware_version: string;
  last_sync_at: Date | null;
}

interface PictogramRow extends QueryResultRow {
  id: string;
  label: string;
  message: string;
  category: string;
  color_tone: string;
  icon_name: string;
  image_path: string | null;
  position: number;
}

interface EventRow extends QueryResultRow {
  id: string;
  pictogram_id: string | null;
  event_type: string;
  action_label: string;
  context: string;
  actor_name: string;
  emotion: string | null;
  intensity: number | null;
  occurred_at: Date;
  payload: Record<string, unknown>;
}

const mapProfile = (row: ProfileRow): StudentProfile => ({
  id: row.id,
  childUserId: row.child_user_id,
  displayName: row.display_name,
  age: row.age,
  supportLevel: row.support_level,
  mainContext: row.main_context,
});

const mapDevice = (row: DeviceRow): DeviceInfo => ({
  id: row.id,
  code: row.device_code,
  name: row.name,
  status: row.status,
  batteryLevel: row.battery_level,
  powerSource: row.power_source,
  wifiSsid: row.wifi_ssid,
  firmwareVersion: row.firmware_version,
  lastSyncAt: row.last_sync_at ? row.last_sync_at.toISOString() : null,
});

const mapPictogram = (row: PictogramRow): PictogramConfig => ({
  id: row.id,
  label: row.label,
  message: row.message,
  category: row.category,
  colorTone: row.color_tone,
  iconName: row.icon_name,
  imagePath: row.image_path,
  position: row.position,
});

const mapEvent = (row: EventRow): DeviceEvent => ({
  id: row.id,
  pictogramId: row.pictogram_id,
  eventType: row.event_type,
  actionLabel: row.action_label,
  context: row.context,
  actorName: row.actor_name,
  emotion: row.emotion,
  intensity: row.intensity,
  occurredAt: row.occurred_at.toISOString(),
  payload: row.payload ?? {},
});

const getDeviceByCode = async (deviceCode: string): Promise<DeviceRow> => {
  const result = await query<DeviceRow>(
    "SELECT * FROM devices WHERE device_code = $1 LIMIT 1",
    [deviceCode],
  );

  if (!result.rowCount) {
    throw new Error("No existe un dispositivo asociado a ese codigo.");
  }

  return result.rows[0];
};

const getProfileById = async (profileId: string): Promise<StudentProfile> => {
  const result = await query<ProfileRow>(
    "SELECT * FROM student_profiles WHERE id = $1 LIMIT 1",
    [profileId],
  );

  if (!result.rowCount) {
    throw new Error("No existe un perfil asociado al dispositivo.");
  }

  return mapProfile(result.rows[0]);
};

const getAccessibleProfile = async (
  authUser: AuthTokenPayload,
): Promise<StudentProfile> => {
  if (authUser.role === "admin" || authUser.role === "child")
    throw new ForbiddenError();
  const result = await query<ProfileRow>(
    `SELECT sp.* FROM student_profiles sp
     JOIN user_access ua ON ua.subject_user_id = sp.child_user_id
     WHERE ua.actor_user_id = $1 AND ua.relationship = $2 AND ua.approved_at IS NOT NULL
       AND sp.is_demo=$4 AND sp.is_private_test=$5 AND ($3::uuid IS NULL OR sp.id = $3)
     ORDER BY ua.created_at, sp.id LIMIT 1`,
    [
      authUser.sub,
      authUser.role,
      authUser.profileId ?? null,
      Boolean(authUser.isDemo),
      Boolean(authUser.isPrivateTest),
    ],
  );
  if (!result.rowCount) {
    throw new ForbiddenError("No existe un perfil asignado para este usuario.");
  }

  return mapProfile(result.rows[0]);
};

export const getStcsOverview = async (
  authUser: AuthTokenPayload,
): Promise<StcsOverview> => {
  if (!canReadSensitive(authUser.role)) throw new ForbiddenError();
  const profile = await getAccessibleProfile(authUser);

  const access = await canAccessSubject(authUser, profile.childUserId);

  if (!access.allowed) {
    throw new Error("El usuario no tiene permiso para ver este perfil.");
  }

  const [
    deviceResult,
    pictogramsResult,
    eventsResult,
    metricsResult,
    weeklyResult,
    categoryResult,
    emotionResult,
  ] = await Promise.all([
    query<DeviceRow>(
      "SELECT * FROM devices WHERE student_profile_id = $1 ORDER BY created_at LIMIT 1",
      [profile.id],
    ),
    query<PictogramRow>(
      `SELECT *
         FROM pictograms
         WHERE student_profile_id = $1 AND is_active = TRUE
         ORDER BY position ASC, label ASC`,
      [profile.id],
    ),
    query<EventRow>(
      `SELECT *
         FROM device_events
         WHERE student_profile_id = $1
           AND (payload->>'source' = 'esp32-device' OR (${authUser.isDemo ? "TRUE" : "FALSE"} AND payload->>'source' = 'demo-fixture'))
         ORDER BY occurred_at DESC
         LIMIT 10`,
      [profile.id],
    ),
    query<{ interactions_today: number; emotions_today: number }>(
      `SELECT
           COUNT(*) FILTER (
             WHERE event_type = 'pictogram_selected'
               AND (occurred_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::date = (NOW() AT TIME ZONE 'America/Santiago')::date
               AND (payload->>'source' = 'esp32-device' OR (${authUser.isDemo ? "TRUE" : "FALSE"} AND payload->>'source' = 'demo-fixture'))
           )::int AS interactions_today,
           COUNT(*) FILTER (
             WHERE (event_type = 'emotion_recorded' OR (event_type='pictogram_selected' AND emotion IS NOT NULL))
               AND (occurred_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::date = (NOW() AT TIME ZONE 'America/Santiago')::date
               AND (payload->>'source' = 'esp32-device' OR (${authUser.isDemo ? "TRUE" : "FALSE"} AND payload->>'source' = 'demo-fixture'))
           )::int AS emotions_today
         FROM device_events
         WHERE student_profile_id = $1`,
      [profile.id],
    ),
    query<{ day: string; interactions: number }>(
      `SELECT
           TO_CHAR(days.day, 'Dy') AS day,
           COUNT(de.id)::int AS interactions
         FROM generate_series((NOW() AT TIME ZONE 'America/Santiago')::date - INTERVAL '6 days', (NOW() AT TIME ZONE 'America/Santiago')::date, INTERVAL '1 day') AS days(day)
         LEFT JOIN device_events de
           ON de.student_profile_id = $1
          AND de.event_type = 'pictogram_selected'
          AND (de.payload->>'source' = 'esp32-device' OR (${authUser.isDemo ? "TRUE" : "FALSE"} AND de.payload->>'source' = 'demo-fixture'))
          AND (de.occurred_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::date = days.day::date
         GROUP BY days.day
         ORDER BY days.day`,
      [profile.id],
    ),
    query<{ name: string; value: number }>(
      `SELECT COALESCE(payload->>'category', 'Sistema') AS name, COUNT(*)::int AS value
         FROM device_events
         WHERE student_profile_id = $1
           AND event_type = 'pictogram_selected'
           AND (payload->>'source' = 'esp32-device' OR (${authUser.isDemo ? "TRUE" : "FALSE"} AND payload->>'source' = 'demo-fixture'))
         GROUP BY COALESCE(payload->>'category', 'Sistema')
         ORDER BY value DESC`,
      [profile.id],
    ),
    query<{ day: string; positive: number; difficult: number }>(
      `SELECT
           TO_CHAR(days.day, 'DD') AS day,
           COUNT(de.id) FILTER (WHERE de.emotion IN ('feliz', 'tranquilo'))::int AS positive,
           COUNT(de.id) FILTER (WHERE de.emotion IN ('frustrado', 'ansioso', 'triste', 'enojado', 'miedo', 'cansado'))::int AS difficult
         FROM generate_series((NOW() AT TIME ZONE 'America/Santiago')::date - INTERVAL '29 days', (NOW() AT TIME ZONE 'America/Santiago')::date, INTERVAL '5 days') AS days(day)
         LEFT JOIN device_events de
           ON de.student_profile_id = $1
          AND (de.event_type = 'emotion_recorded' OR (de.event_type='pictogram_selected' AND de.emotion IS NOT NULL))
          AND (de.payload->>'source' = 'esp32-device' OR (${authUser.isDemo ? "TRUE" : "FALSE"} AND de.payload->>'source' = 'demo-fixture'))
          AND (de.occurred_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::date BETWEEN days.day::date AND (days.day::date + 4)
         GROUP BY days.day
         ORDER BY days.day`,
      [profile.id],
    ),
  ]);

  const device = deviceResult.rows[0];

  if (!device) {
    throw new Error("El perfil no tiene un dispositivo asociado.");
  }

  return {
    user: {
      id: authUser.sub,
      name: authUser.fullName,
      role: authUser.role,
    },
    profile,
    device: mapDevice(device),
    pictograms: await withAudioState(pictogramsResult.rows.map(mapPictogram)),
    metrics: {
      interactionsToday: metricsResult.rows[0]?.interactions_today ?? 0,
      emotionsToday: metricsResult.rows[0]?.emotions_today ?? 0,
      deviceStatus: device.status,
    },
    weeklyUse: weeklyResult.rows,
    categoryUse: categoryResult.rows,
    emotionProgress: emotionResult.rows,
    recentActivity: eventsResult.rows.map(mapEvent),
  };
};

export const getDeviceBoardConfig = async (
  deviceCode: string,
): Promise<DeviceBoardConfig> => {
  const device = await getDeviceByCode(deviceCode);
  const profile = await getProfileById(device.student_profile_id);
  const selection = await getBoardSelection(device.student_profile_id);
  const pictogramsResult = await query<PictogramRow>(
    `SELECT id, label, message, category, color_tone, icon_name, image_path, position
     FROM (
       SELECT p.*,
              ROW_NUMBER() OVER (PARTITION BY category ORDER BY position ASC, label ASC) AS category_position
       FROM pictograms p
       WHERE student_profile_id = $1 AND is_active = TRUE
         AND ($3::text[] IS NULL OR (category = ANY($3) AND id = ANY($4::uuid[])))
     ) configured
     WHERE category_position <= $2
     ORDER BY position ASC, label ASC`,
    [
      device.student_profile_id,
      DEVICE_MAX_ITEMS_PER_CATEGORY,
      selection?.categories ?? null,
      selection?.pictogramIds ?? null,
    ],
  );

  return {
    device: mapDevice(device),
    profile,
    pictograms: await deviceMediaConfig(
      deviceCode,
      await withAudioState(pictogramsResult.rows.map(mapPictogram)),
    ),
  };
};

async function preparePictogramMedia(
  client: PoolClient,
  profileId: string,
  input: PictogramInput,
) {
  const id = uploadedImageId(input.imagePath ?? "");
  if (id) {
    const image = await client.query(
      "SELECT 1 FROM pictogram_images WHERE id=$1 AND student_profile_id=$2",
      [id, profileId],
    );
    if (!image.rowCount)
      throw new ForbiddenError(
        "La imagen no pertenece al perfil seleccionado.",
      );
  }
  const key = phraseKey(input.message);
  await client.query(
    "INSERT INTO phrase_audio(cache_key,phrase,voice) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
    [key, input.message.normalize("NFC").trim(), MEDIA_VOICE],
  );
  return key;
}

export const createPictogram = async (
  authUser: AuthTokenPayload,
  input: PictogramInput,
): Promise<PictogramConfig> => {
  if (!canEditBoard(authUser.role)) throw new ForbiddenError();
  const profile = await getAccessibleProfile(authUser);
  const access = await canAccessSubject(authUser, profile.childUserId);

  if (!access.allowed) {
    throw new Error(
      "El usuario no tiene permiso para configurar este tablero.",
    );
  }

  return transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      profile.id,
    ]);
    const categoryCount = await client.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
     FROM pictograms
     WHERE student_profile_id = $1 AND category = $2 AND is_active = TRUE`,
      [profile.id, input.category],
    );

    if ((categoryCount.rows[0]?.count ?? 0) >= DEVICE_MAX_ITEMS_PER_CATEGORY) {
      throw new StcsConflictError(
        `La pantalla admite un maximo de ${DEVICE_MAX_ITEMS_PER_CATEGORY} pictogramas por categoria.`,
      );
    }

    const positionResult = await client.query<{ next_position: number }>(
      `SELECT slot AS next_position FROM generate_series(1,$2::int) slot
       WHERE NOT EXISTS(SELECT 1 FROM pictograms p WHERE p.student_profile_id=$1 AND p.is_active=TRUE AND p.position=slot)
       ORDER BY slot LIMIT 1`,
      [profile.id, DEVICE_MAX_ITEMS_PER_CATEGORY * 4],
    );

    const audioKey = await preparePictogramMedia(client, profile.id, input);
    try {
      const result = await client.query<PictogramRow>(
        `INSERT INTO pictograms (
         id, student_profile_id, label, message, category, color_tone,
         icon_name, image_path, position, is_active, audio_key
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10)
       RETURNING *`,
        [
          randomUUID(),
          profile.id,
          input.label,
          input.message,
          input.category,
          input.colorTone,
          input.iconName,
          input.imagePath ?? null,
          input.position ?? positionResult.rows[0]?.next_position ?? 1,
          audioKey,
        ],
      );

      return mapPictogram(result.rows[0]);
    } catch (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new StcsConflictError(
          "Ya existe un pictograma activo con ese nombre y categoria.",
        );
      }

      throw error;
    }
  });
};

export const updatePictogram = async (
  authUser: AuthTokenPayload,
  pictogramId: string,
  input: PictogramInput,
): Promise<PictogramConfig> => {
  if (!canEditBoard(authUser.role)) throw new ForbiddenError();
  const profile = await getAccessibleProfile(authUser);
  const access = await canAccessSubject(authUser, profile.childUserId);

  if (!access.allowed) {
    throw new Error(
      "El usuario no tiene permiso para configurar este tablero.",
    );
  }

  return transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      profile.id,
    ]);
    const categoryCount = await client.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
     FROM pictograms
     WHERE student_profile_id = $1
       AND category = $2
       AND id <> $3
       AND is_active = TRUE`,
      [profile.id, input.category, pictogramId],
    );

    if ((categoryCount.rows[0]?.count ?? 0) >= DEVICE_MAX_ITEMS_PER_CATEGORY) {
      throw new StcsConflictError(
        `La pantalla admite un maximo de ${DEVICE_MAX_ITEMS_PER_CATEGORY} pictogramas por categoria.`,
      );
    }

    const audioKey = await preparePictogramMedia(client, profile.id, input);
    try {
      const result = await client.query<PictogramRow>(
        `UPDATE pictograms
       SET label = $3,
           message = $4,
           category = $5,
           color_tone = $6,
           icon_name = $7,
           image_path = $8,
           position = COALESCE($9, position),
           audio_key = $10,
           updated_at = NOW()
       WHERE id = $1 AND student_profile_id = $2 AND is_active = TRUE
       RETURNING *`,
        [
          pictogramId,
          profile.id,
          input.label,
          input.message,
          input.category,
          input.colorTone,
          input.iconName,
          input.imagePath ?? null,
          input.position ?? null,
          audioKey,
        ],
      );

      if (!result.rowCount) {
        throw new StcsNotFoundError("No se encontro el pictograma solicitado.");
      }

      await assertUsableSelection(client, profile.id);
      return mapPictogram(result.rows[0]);
    } catch (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new StcsConflictError(
          "Ya existe un pictograma activo con ese nombre y categoria.",
        );
      }

      throw error;
    }
  });
};

export const deletePictogram = async (
  authUser: AuthTokenPayload,
  pictogramId: string,
): Promise<void> => {
  if (!canEditBoard(authUser.role)) throw new ForbiddenError();
  const profile = await getAccessibleProfile(authUser);
  const access = await canAccessSubject(authUser, profile.childUserId);

  if (!access.allowed) {
    throw new Error(
      "El usuario no tiene permiso para configurar este tablero.",
    );
  }

  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      profile.id,
    ]);
    const result = await client.query(
      `UPDATE pictograms
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1 AND student_profile_id = $2 AND is_active = TRUE`,
      [pictogramId, profile.id],
    );

    if (!result.rowCount) {
      throw new StcsNotFoundError("No se encontro el pictograma solicitado.");
    }
    await assertUsableSelection(client, profile.id);
  });
};

export const getDeviceEventHistory = async (
  authUser: AuthTokenPayload,
  filters: HistoryFilters & { offset?: number } = {},
): Promise<{
  events: DeviceEvent[];
  total: number;
  offset: number;
  hasMore: boolean;
  contexts: string[];
  eventTypes: string[];
  devices: { id: string; label: string }[];
}> => {
  if (!canReadSensitive(authUser.role)) throw new ForbiddenError();
  const profile = await getAccessibleProfile(authUser);
  const params = historyParams(profile.id, Boolean(authUser.isDemo), filters);
  const offset = filters.offset ?? 0;
  // One snapshot keeps count, page and facets coherent while the ESP uploads events.
  return transaction(async (client) => {
    await client.query(
      "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
    );
    const result = await client.query<EventRow>(
      `SELECT e.* FROM device_events e WHERE ${HISTORY_PREDICATE} ORDER BY e.occurred_at DESC,e.created_at DESC,e.id DESC LIMIT 100 OFFSET $8`,
      [...params, offset],
    );
    const count = await client.query(
      `SELECT COUNT(*)::int AS total FROM device_events e WHERE ${HISTORY_PREDICATE}`,
      params,
    );
    const facets = await client.query(
      `SELECT DISTINCT e.context,e.event_type FROM device_events e WHERE e.student_profile_id=$1 AND (e.payload->>'source'='esp32-device' OR ($2::boolean AND e.payload->>'source'='demo-fixture'))`,
      params.slice(0, 2),
    );
    const devices = await client.query(
      `SELECT DISTINCT e.device_id AS id FROM device_events e WHERE e.student_profile_id=$1 ORDER BY e.device_id`,
      [profile.id],
    );
    const total = count.rows[0].total;
    return {
      events: result.rows.map(mapEvent),
      total,
      offset,
      hasMore: offset + result.rows.length < total,
      contexts: [
        ...new Set(facets.rows.map((r) => r.context as string)),
      ].sort(),
      eventTypes: [
        ...new Set(facets.rows.map((r) => r.event_type as string)),
      ].sort(),
      devices: devices.rows.map((r, i) => ({
        id: r.id,
        label: `Dispositivo ${i + 1}`,
      })),
    };
  });
};

export async function exportDeviceEventHistory(
  authUser: AuthTokenPayload,
  filters: HistoryFilters,
) {
  if (!canReadSensitive(authUser.role)) throw new ForbiddenError();
  const profile = await getAccessibleProfile(authUser);
  return transaction(async (client) => {
    // Bound memory, hold a consistent snapshot, and only succeed if the audit persists.
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    const grant = await client.query(
      `SELECT 1 FROM user_access WHERE actor_user_id=$1 AND subject_user_id=$2
       AND relationship=$3 AND approved_at IS NOT NULL FOR SHARE`,
      [authUser.sub, profile.childUserId, authUser.role],
    );
    if (!grant.rowCount) throw new ForbiddenError();
    const result = await client.query(
      `SELECT e.id,e.device_id,e.event_type,e.action_label,e.context,e.occurred_at
      FROM device_events e WHERE ${HISTORY_PREDICATE} ORDER BY e.occurred_at DESC,e.created_at DESC,e.id DESC LIMIT 10001`,
      historyParams(profile.id, Boolean(authUser.isDemo), filters),
    );
    if (result.rows.length > 10000)
      throw new StcsConflictError(
        "El resultado supera 10.000 eventos. Acota las fechas o los filtros antes de exportar.",
      );
    const aliases = await client.query(
      "SELECT DISTINCT device_id FROM device_events WHERE student_profile_id=$1 ORDER BY device_id",
      [profile.id],
    );
    const deviceIds = aliases.rows.map((r) => r.device_id as string);
    const profileNumber = (
      await client.query(
        "SELECT public_number FROM student_profiles WHERE id=$1",
        [profile.id],
      )
    ).rows[0].public_number;
    const rows = result.rows.map((r) => [
      `Usuario ${profileNumber}`,
      `Dispositivo ${deviceIds.indexOf(r.device_id) + 1}`,
      r.occurred_at.toISOString(),
      r.event_type,
      r.action_label,
      r.context,
    ]);
    const csv = csvDocument([
      [
        "Perfil (alias)",
        "Dispositivo (alias)",
        "Fecha UTC",
        "Tipo",
        "Acción",
        "Contexto",
      ],
      ...rows,
    ]);
    if (Buffer.byteLength(csv, "utf8") > 3 * 1024 * 1024)
      throw new StcsConflictError(
        "El archivo supera 3 MiB. Acota las fechas o los filtros antes de exportar.",
      );
    const id = randomUUID();
    await client.query(
      `INSERT INTO app_operation_audit(id,actor_user_id,student_profile_id,operation,metadata) VALUES($1,$2,$3,'history_export',$4::jsonb)`,
      [
        id,
        authUser.sub,
        profile.id,
        JSON.stringify({
          rows: rows.length,
          filters,
          timezone: "UTC",
          maximumRows: 10000,
        }),
      ],
    );
    return {
      id,
      csv,
      count: rows.length,
    };
  });
}

export const createDeviceEventFromDevice = async (
  deviceCode: string,
  input: DeviceEventInput,
): Promise<{ event: DeviceEvent; created: boolean }> => {
  const device = await getDeviceByCode(deviceCode);
  const pictogramResult = input.pictogramId
    ? await query<PictogramRow>(
        `SELECT * FROM pictograms
         WHERE id = $1 AND student_profile_id = $2
         LIMIT 1`,
        [input.pictogramId, device.student_profile_id],
      )
    : input.pictogramLabel
      ? await query<PictogramRow>(
          `SELECT * FROM pictograms
           WHERE student_profile_id = $1
             AND LOWER(label) = LOWER($2)
             AND ($3::text IS NULL OR LOWER(category) = LOWER($3))
             AND is_active = TRUE
           ORDER BY position
           LIMIT 1`,
          [
            device.student_profile_id,
            input.pictogramLabel,
            input.category ?? null,
          ],
        )
      : null;
  const pictogram = pictogramResult?.rows[0];

  if ((input.pictogramId || input.pictogramLabel) && !pictogram) {
    throw new StcsNotFoundError(
      "El pictograma no existe o no pertenece al perfil asociado al dispositivo.",
    );
  }

  const emotionalSelection =
    input.eventType === "pictogram_selected" &&
    pictogram?.category === "Emociones";
  const normalizedEmotion =
    input.emotion ??
    (emotionalSelection
      ? (
          getCatalogAsset(pictogram?.image_path ?? "")?.label ??
          pictogram?.label
        )
          ?.toLocaleLowerCase("es")
          .trim()
      : undefined);
  const eventType = input.eventType;
  const actionLabel =
    input.actionLabel ??
    (pictogram ? `Selecciono: ${pictogram.label}` : "Evento del dispositivo");
  const payload = {
    category: input.category ?? pictogram?.category ?? "Sistema",
    message: input.message ?? pictogram?.message ?? null,
    pictogramId: pictogram?.id ?? null,
    source: "esp32-device",
  };

  const result = await query<EventRow>(
    `INSERT INTO device_events (
       id, device_id, student_profile_id, pictogram_id, external_event_id,
       event_type, action_label, context, actor_name, emotion, intensity,
       payload, occurred_at
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, 'Dispositivo ESP32', $9, $10,
       $11::jsonb, (COALESCE($12::timestamptz, NOW()) AT TIME ZONE 'UTC')
     )
     ON CONFLICT (device_id, external_event_id)
       WHERE external_event_id IS NOT NULL
       DO NOTHING
     RETURNING *`,
    [
      randomUUID(),
      device.id,
      device.student_profile_id,
      pictogram?.id ?? null,
      input.externalEventId ?? null,
      eventType,
      actionLabel,
      input.context,
      normalizedEmotion ?? null,
      input.intensity ?? null,
      JSON.stringify(payload),
      input.occurredAt ?? null,
    ],
  );

  const created = Boolean(result.rowCount);
  const eventResult = created
    ? result
    : await query<EventRow>(
        `SELECT * FROM device_events
         WHERE device_id = $1 AND external_event_id = $2
         LIMIT 1`,
        [device.id, input.externalEventId],
      );

  if (!eventResult.rowCount) {
    throw new Error("No fue posible recuperar el evento registrado.");
  }

  await query(
    `UPDATE devices
     SET
       status = 'connected',
       battery_level = COALESCE($2, battery_level),
       wifi_ssid = COALESCE($3, wifi_ssid),
       firmware_version = COALESCE($4, firmware_version),
       last_sync_at = NOW(),
       updated_at = NOW()
     WHERE id = $1`,
    [
      device.id,
      input.batteryLevel ?? null,
      input.wifiSsid ?? null,
      input.firmwareVersion ?? null,
    ],
  );

  return { event: mapEvent(eventResult.rows[0]), created };
};
