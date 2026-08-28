import { randomUUID } from "crypto";
import type { QueryResultRow } from "pg";

import { canAccessSubject } from "./access";
import type { AuthTokenPayload } from "./auth";
import { query } from "./db";

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
  wifiSsid: string | null;
  firmwareVersion: string;
  lastSyncAt: string | null;
}

export interface PictogramConfig {
  id: string;
  label: string;
  message: string;
  category: string;
  colorTone: string;
  iconName: string;
  position: number;
}

export interface DeviceEvent {
  id: string;
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
  device_code: string;
  name: string;
  status: string;
  battery_level: number;
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
  position: number;
}

interface EventRow extends QueryResultRow {
  id: string;
  event_type: string;
  action_label: string;
  context: string;
  actor_name: string;
  emotion: string | null;
  intensity: number | null;
  occurred_at: Date;
  payload: Record<string, unknown>;
}

const MATEO_PROFILE_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const MATEO_CHILD_ID = "44444444-4444-4444-4444-444444444444";
const DEVICE_ID = "dddddddd-dddd-dddd-dddd-dddddddddddd";

let schemaReady = false;

const mapProfile = (row: ProfileRow): StudentProfile => ({
  id: row.id,
  childUserId: row.child_user_id,
  displayName: row.display_name,
  age: row.age,
  supportLevel: row.support_level,
  mainContext: row.main_context
});

const mapDevice = (row: DeviceRow): DeviceInfo => ({
  id: row.id,
  code: row.device_code,
  name: row.name,
  status: row.status,
  batteryLevel: row.battery_level,
  wifiSsid: row.wifi_ssid,
  firmwareVersion: row.firmware_version,
  lastSyncAt: row.last_sync_at ? row.last_sync_at.toISOString() : null
});

const mapPictogram = (row: PictogramRow): PictogramConfig => ({
  id: row.id,
  label: row.label,
  message: row.message,
  category: row.category,
  colorTone: row.color_tone,
  iconName: row.icon_name,
  position: row.position
});

const mapEvent = (row: EventRow): DeviceEvent => ({
  id: row.id,
  eventType: row.event_type,
  actionLabel: row.action_label,
  context: row.context,
  actorName: row.actor_name,
  emotion: row.emotion,
  intensity: row.intensity,
  occurredAt: row.occurred_at.toISOString(),
  payload: row.payload ?? {}
});

export const ensureStcsSchema = async () => {
  if (schemaReady) {
    return;
  }

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'guardian',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_access (
      actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      relationship VARCHAR(30) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (actor_user_id, subject_user_id)
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id UUID PRIMARY KEY,
      child_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      display_name VARCHAR(120) NOT NULL,
      age INTEGER NOT NULL CHECK (age BETWEEN 1 AND 18),
      support_level VARCHAR(120) NOT NULL,
      main_context VARCHAR(80) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS devices (
      id UUID PRIMARY KEY,
      student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      device_code VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(120) NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'offline',
      battery_level INTEGER NOT NULL DEFAULT 0 CHECK (battery_level BETWEEN 0 AND 100),
      wifi_ssid VARCHAR(120),
      firmware_version VARCHAR(40) NOT NULL DEFAULT 'v0.1.0',
      last_sync_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pictograms (
      id UUID PRIMARY KEY,
      student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      label VARCHAR(80) NOT NULL,
      message TEXT NOT NULL,
      category VARCHAR(60) NOT NULL,
      color_tone VARCHAR(40) NOT NULL,
      icon_name VARCHAR(60) NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS device_events (
      id UUID PRIMARY KEY,
      device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      event_type VARCHAR(60) NOT NULL,
      action_label VARCHAR(150) NOT NULL,
      context VARCHAR(80) NOT NULL,
      actor_name VARCHAR(120) NOT NULL DEFAULT 'Dispositivo ESP32',
      emotion VARCHAR(60),
      intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_student_profiles_child_user_id ON student_profiles(child_user_id);
    CREATE INDEX IF NOT EXISTS idx_user_access_subject_user_id ON user_access(subject_user_id);
    CREATE INDEX IF NOT EXISTS idx_devices_student_profile_id ON devices(student_profile_id);
    CREATE INDEX IF NOT EXISTS idx_pictograms_student_profile_id ON pictograms(student_profile_id);
    CREATE INDEX IF NOT EXISTS idx_device_events_profile_date ON device_events(student_profile_id, occurred_at DESC);
    CREATE INDEX IF NOT EXISTS idx_device_events_device_id ON device_events(device_id);
  `);

  await seedStcsDemoData();
  schemaReady = true;
};

const seedStcsDemoData = async () => {
  const demoUsers = [
    ["11111111-1111-1111-1111-111111111111", "Cuidadora Laura", "demo@stcs.local", "guardian"],
    ["22222222-2222-2222-2222-222222222222", "Especialista Marco", "terapeuta@stcs.local", "therapist"],
    ["33333333-3333-3333-3333-333333333333", "Administrador Demo", "admin@stcs.local", "admin"],
    ["44444444-4444-4444-4444-444444444444", "Mateo Rojas", "mateo@stcs.local", "child"],
    ["55555555-5555-5555-5555-555555555555", "Lucas Vargas", "lucas@stcs.local", "child"],
    ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "Docente Ana", "docente@stcs.local", "teacher"]
  ];
  const demoPasswordHash =
    "$2a$10$iZ4eoeGIOqgVg0q.jAFbFuvSURJiyu4SwyQQKuYFWSzTdBS70PSUK";

  for (const [id, fullName, email, role] of demoUsers) {
    await query(
      `INSERT INTO users (id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         updated_at = NOW()`,
      [id, fullName, email, demoPasswordHash, role]
    );
  }

  await query(
    `INSERT INTO user_access (actor_user_id, subject_user_id, relationship)
     VALUES
       ('11111111-1111-1111-1111-111111111111', $1, 'guardian'),
       ('22222222-2222-2222-2222-222222222222', $1, 'therapist'),
       ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', $1, 'teacher')
     ON CONFLICT (actor_user_id, subject_user_id) DO NOTHING`,
    [MATEO_CHILD_ID]
  );

  await query(
    `INSERT INTO student_profiles (id, child_user_id, display_name, age, support_level, main_context)
     VALUES ($1, $2, 'Mateo Rojas', 8, 'Apoyo comunicacional medio', 'Casa y colegio')
     ON CONFLICT (id) DO NOTHING`,
    [MATEO_PROFILE_ID, MATEO_CHILD_ID]
  );

  await query(
    `INSERT INTO devices (id, student_profile_id, device_code, name, status, battery_level, wifi_ssid, firmware_version, last_sync_at)
     VALUES ($1, $2, 'STCS-ESP32-001', 'Comunicador Mateo', 'connected', 82, 'Casa_2.4G', 'v0.1.0', NOW() - INTERVAL '18 minutes')
     ON CONFLICT (device_code) DO UPDATE SET
       status = EXCLUDED.status,
       battery_level = EXCLUDED.battery_level,
       wifi_ssid = EXCLUDED.wifi_ssid,
       firmware_version = EXCLUDED.firmware_version,
       updated_at = NOW()`,
    [DEVICE_ID, MATEO_PROFILE_ID]
  );

  const pictograms = [
    ["e0000000-0000-0000-0000-000000000001", "Agua", "quiero agua", "Necesidades", "sky", "Droplets", 1],
    ["e0000000-0000-0000-0000-000000000002", "Comer", "quiero comer", "Necesidades", "amber", "Utensils", 2],
    ["e0000000-0000-0000-0000-000000000003", "Bano", "quiero ir al bano", "Necesidades", "cyan", "Bath", 3],
    ["e0000000-0000-0000-0000-000000000004", "Ayuda", "necesito ayuda", "Apoyo", "rose", "HelpCircle", 4],
    ["e0000000-0000-0000-0000-000000000005", "Feliz", "estoy feliz", "Emociones", "yellow", "Smile", 5],
    ["e0000000-0000-0000-0000-000000000006", "Triste", "estoy triste", "Emociones", "blue", "Frown", 6],
    ["e0000000-0000-0000-0000-000000000007", "Casa", "quiero ir a casa", "Lugares", "emerald", "Home", 7],
    ["e0000000-0000-0000-0000-000000000008", "Colegio", "quiero ir al colegio", "Lugares", "indigo", "School", 8],
    ["e0000000-0000-0000-0000-000000000009", "Pausa", "necesito una pausa", "Acciones", "violet", "Clock", 9],
    ["e0000000-0000-0000-0000-000000000010", "Salir", "quiero salir", "Acciones", "orange", "MapPin", 10]
  ];

  for (const pictogram of pictograms) {
    await query(
      `INSERT INTO pictograms (id, student_profile_id, label, message, category, color_tone, icon_name, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [pictogram[0], MATEO_PROFILE_ID, ...pictogram.slice(1)]
    );
  }

  const existingEvents = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM device_events WHERE student_profile_id = $1",
    [MATEO_PROFILE_ID]
  );

  if (Number(existingEvents.rows[0].count) > 0) {
    return;
  }

  const events = [
    ["pictogram_selected", "Selecciono: Agua", "Casa", "Dispositivo ESP32", null, null, { category: "Necesidades", pictogramId: "e0000000-0000-0000-0000-000000000001" }, "30 minutes"],
    ["emotion_recorded", "Emocion: Ansioso", "Colegio", "Docente Ana", "ansioso", 3, { category: "Emociones" }, "2 hours"],
    ["sync_completed", "Sincronizacion completada", "Dispositivo", "Sistema", null, null, { category: "Sistema" }, "4 hours"],
    ["pictogram_selected", "Selecciono: Comer", "Casa", "Dispositivo ESP32", null, null, { category: "Necesidades", pictogramId: "e0000000-0000-0000-0000-000000000002" }, "1 day"],
    ["emotion_recorded", "Emocion: Tranquilo", "Casa", "Cuidadora Laura", "tranquilo", 4, { category: "Emociones" }, "1 day"],
    ["pictogram_selected", "Selecciono: Ayuda", "Colegio", "Dispositivo ESP32", null, null, { category: "Apoyo", pictogramId: "e0000000-0000-0000-0000-000000000004" }, "2 days"],
    ["pictogram_selected", "Selecciono: Colegio", "Casa", "Dispositivo ESP32", null, null, { category: "Lugares", pictogramId: "e0000000-0000-0000-0000-000000000008" }, "3 days"],
    ["emotion_recorded", "Emocion: Feliz", "Terapia", "Especialista Marco", "feliz", 5, { category: "Emociones" }, "4 days"]
  ];

  for (const event of events) {
    await query(
      `INSERT INTO device_events (
         id, device_id, student_profile_id, event_type, action_label, context,
         actor_name, emotion, intensity, payload, occurred_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW() - ($11::interval))`,
      [
        randomUUID(),
        DEVICE_ID,
        MATEO_PROFILE_ID,
        event[0],
        event[1],
        event[2],
        event[3],
        event[4],
        event[5],
        JSON.stringify(event[6]),
        event[7]
      ]
    );
  }
};

const getAccessibleProfile = async (
  authUser: AuthTokenPayload
): Promise<StudentProfile> => {
  const result =
    authUser.role === "admin"
      ? await query<ProfileRow>(
          "SELECT * FROM student_profiles ORDER BY display_name LIMIT 1"
        )
      : authUser.role === "child"
        ? await query<ProfileRow>(
            "SELECT * FROM student_profiles WHERE child_user_id = $1 LIMIT 1",
            [authUser.sub]
          )
        : await query<ProfileRow>(
            `SELECT sp.*
             FROM student_profiles sp
             INNER JOIN user_access ua ON ua.subject_user_id = sp.child_user_id
             WHERE ua.actor_user_id = $1
             ORDER BY sp.display_name
             LIMIT 1`,
            [authUser.sub]
          );

  if (!result.rowCount) {
    throw new Error("No existe un perfil asignado para este usuario.");
  }

  return mapProfile(result.rows[0]);
};

export const getStcsOverview = async (
  authUser: AuthTokenPayload
): Promise<StcsOverview> => {
  await ensureStcsSchema();

  const profile = await getAccessibleProfile(authUser);

  const access = await canAccessSubject(authUser, profile.childUserId);

  if (!access.allowed) {
    throw new Error("El usuario no tiene permiso para ver este perfil.");
  }

  const [deviceResult, pictogramsResult, eventsResult, metricsResult, weeklyResult, categoryResult, emotionResult] =
    await Promise.all([
      query<DeviceRow>(
        "SELECT * FROM devices WHERE student_profile_id = $1 ORDER BY created_at LIMIT 1",
        [profile.id]
      ),
      query<PictogramRow>(
        `SELECT *
         FROM pictograms
         WHERE student_profile_id = $1 AND is_active = TRUE
         ORDER BY position ASC, label ASC`,
        [profile.id]
      ),
      query<EventRow>(
        `SELECT *
         FROM device_events
         WHERE student_profile_id = $1
         ORDER BY occurred_at DESC
         LIMIT 10`,
        [profile.id]
      ),
      query<{ interactions_today: number; emotions_today: number }>(
        `SELECT
           COUNT(*) FILTER (
             WHERE event_type = 'pictogram_selected'
               AND occurred_at::date = CURRENT_DATE
           )::int AS interactions_today,
           COUNT(*) FILTER (
             WHERE event_type = 'emotion_recorded'
               AND occurred_at::date = CURRENT_DATE
           )::int AS emotions_today
         FROM device_events
         WHERE student_profile_id = $1`,
        [profile.id]
      ),
      query<{ day: string; interactions: number }>(
        `SELECT
           TO_CHAR(days.day, 'Dy') AS day,
           COUNT(de.id)::int AS interactions
         FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS days(day)
         LEFT JOIN device_events de
           ON de.student_profile_id = $1
          AND de.event_type = 'pictogram_selected'
          AND de.occurred_at::date = days.day::date
         GROUP BY days.day
         ORDER BY days.day`,
        [profile.id]
      ),
      query<{ name: string; value: number }>(
        `SELECT COALESCE(payload->>'category', 'Sistema') AS name, COUNT(*)::int AS value
         FROM device_events
         WHERE student_profile_id = $1 AND event_type = 'pictogram_selected'
         GROUP BY COALESCE(payload->>'category', 'Sistema')
         ORDER BY value DESC`,
        [profile.id]
      ),
      query<{ day: string; positive: number; difficult: number }>(
        `SELECT
           TO_CHAR(days.day, 'DD') AS day,
           COUNT(de.id) FILTER (WHERE de.emotion IN ('feliz', 'tranquilo'))::int AS positive,
           COUNT(de.id) FILTER (WHERE de.emotion IN ('frustrado', 'ansioso', 'triste'))::int AS difficult
         FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '5 days') AS days(day)
         LEFT JOIN device_events de
           ON de.student_profile_id = $1
          AND de.event_type = 'emotion_recorded'
          AND de.occurred_at::date BETWEEN days.day::date AND (days.day::date + 4)
         GROUP BY days.day
         ORDER BY days.day`,
        [profile.id]
      )
    ]);

  const device = deviceResult.rows[0];

  if (!device) {
    throw new Error("El perfil no tiene un dispositivo asociado.");
  }

  return {
    user: {
      id: authUser.sub,
      name: authUser.fullName,
      role: authUser.role
    },
    profile,
    device: mapDevice(device),
    pictograms: pictogramsResult.rows.map(mapPictogram),
    metrics: {
      interactionsToday: metricsResult.rows[0]?.interactions_today ?? 0,
      emotionsToday: metricsResult.rows[0]?.emotions_today ?? 0,
      deviceStatus: device.status
    },
    weeklyUse: weeklyResult.rows,
    categoryUse: categoryResult.rows,
    emotionProgress: emotionResult.rows,
    recentActivity: eventsResult.rows.map(mapEvent)
  };
};

export const createDeviceEvent = async (
  authUser: AuthTokenPayload,
  input: {
    eventType: string;
    actionLabel: string;
    context?: string;
    pictogramId?: string;
    category?: string;
    emotion?: string;
    intensity?: number;
  }
): Promise<DeviceEvent> => {
  await ensureStcsSchema();

  const profile = await getAccessibleProfile(authUser);
  const access = await canAccessSubject(authUser, profile.childUserId);

  if (!access.allowed) {
    throw new Error("El usuario no tiene permiso para registrar eventos.");
  }

  const deviceResult = await query<DeviceRow>(
    "SELECT * FROM devices WHERE student_profile_id = $1 ORDER BY created_at LIMIT 1",
    [profile.id]
  );

  const device = deviceResult.rows[0];

  if (!device) {
    throw new Error("No existe dispositivo asociado al perfil.");
  }

  const eventType = input.eventType || "pictogram_selected";
  const actionLabel = input.actionLabel || "Evento del dispositivo";
  const payload = {
    pictogramId: input.pictogramId ?? null,
    category: input.category ?? "Sistema",
    source: "web-simulation"
  };

  const result = await query<EventRow>(
    `INSERT INTO device_events (
       id, device_id, student_profile_id, event_type, action_label, context,
       actor_name, emotion, intensity, payload, occurred_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
     RETURNING *`,
    [
      randomUUID(),
      device.id,
      profile.id,
      eventType,
      actionLabel,
      input.context ?? "Simulacion",
      eventType === "sync_completed" ? "Sistema" : "Dispositivo ESP32",
      input.emotion ?? null,
      input.intensity ?? null,
      JSON.stringify(payload)
    ]
  );

  if (eventType === "sync_completed") {
    await query(
      `UPDATE devices
       SET status = 'connected', last_sync_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [device.id]
    );
  }

  return mapEvent(result.rows[0]);
};
