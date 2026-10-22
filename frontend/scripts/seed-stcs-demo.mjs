import { readFileSync } from "fs";
import { resolve } from "path";
import process from "process";

import pkg from "pg";

const { Pool } = pkg;

const ROOT_DIR = resolve(process.cwd(), "..");
const ENV_FILES = [resolve(ROOT_DIR, ".env"), resolve(process.cwd(), ".env.local"), resolve(process.cwd(), ".env")];

const loadEnvFiles = () => {
  for (const filePath of ENV_FILES) {
    try {
      const content = readFileSync(filePath, "utf8");

      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);

        if (!match || process.env[match[1]]) {
          continue;
        }

        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      // El archivo es opcional; Vercel y CI entregan variables por entorno.
    }
  }
};

loadEnvFiles();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no esta configurada. Revisa .env o las variables del entorno.");
}

const getDatabaseUrl = () => {
  const databaseUrl = new URL(process.env.DATABASE_URL);

  databaseUrl.searchParams.delete("sslmode");

  return databaseUrl.toString();
};

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
});

const USER_IDS = {
  guardian: "11111111-1111-1111-1111-111111111111",
  therapist: "22222222-2222-2222-2222-222222222222",
  admin: "33333333-3333-3333-3333-333333333333",
  child: "44444444-4444-4444-4444-444444444444",
  teacher: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
};

const MATEO_PROFILE_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const DEVICE_ID = "dddddddd-dddd-dddd-dddd-dddddddddddd";
const PASSWORD_HASH = "$2a$10$iZ4eoeGIOqgVg0q.jAFbFuvSURJiyu4SwyQQKuYFWSzTdBS70PSUK";

const users = [
  [USER_IDS.guardian, "Cuidadora Laura", "cuidadora@stcs.local", "guardian"],
  [USER_IDS.therapist, "Especialista Marco", "terapeuta@stcs.local", "therapist"],
  [USER_IDS.admin, "Administrador STCS", "admin@stcs.local", "admin"],
  [USER_IDS.child, "Mateo Rojas", "mateo@stcs.local", "child"],
  [USER_IDS.teacher, "Docente Ana", "docente@stcs.local", "teacher"]
];

const pictograms = [
  ["caa00000-0000-4000-8000-000000000001", "Agua", "Quiero agua", "Necesidades", "sky", "Droplets", "/pictograms/water.png", 1],
  ["caa00000-0000-4000-8000-000000000002", "Comida", "Quiero comida", "Necesidades", "amber", "Utensils", "/pictograms/food.png", 2],
  ["caa00000-0000-4000-8000-000000000003", "Bano", "Necesito ir al bano", "Necesidades", "cyan", "Bath", "/pictograms/bathroom-need.png", 3],
  ["caa00000-0000-4000-8000-000000000004", "Ayuda", "Necesito ayuda", "Necesidades", "rose", "HelpCircle", "/pictograms/help.png", 4],
  ["caa00000-0000-4000-8000-000000000005", "Feliz", "Estoy feliz", "Emociones", "yellow", "Smile", "/pictograms/happy.png", 5],
  ["caa00000-0000-4000-8000-000000000006", "Triste", "Estoy triste", "Emociones", "blue", "Frown", "/pictograms/sad.png", 6],
  ["caa00000-0000-4000-8000-000000000007", "Enojado", "Estoy enojado", "Emociones", "rose", "AlertTriangle", "/pictograms/angry.png", 7],
  ["caa00000-0000-4000-8000-000000000008", "Cansado", "Estoy cansado", "Emociones", "violet", "Clock", "/pictograms/tired.png", 8],
  ["caa00000-0000-4000-8000-000000000009", "Jugar", "Quiero jugar", "Acciones", "emerald", "Gamepad2", "/pictograms/play.png", 9],
  ["caa00000-0000-4000-8000-000000000010", "Comer", "Quiero comer", "Acciones", "orange", "Utensils", "/pictograms/eat.png", 10],
  ["caa00000-0000-4000-8000-000000000011", "Dormir", "Quiero dormir", "Acciones", "indigo", "Moon", "/pictograms/sleep.png", 11],
  ["caa00000-0000-4000-8000-000000000012", "Ir", "Quiero ir", "Acciones", "cyan", "ArrowRight", "/pictograms/go.png", 12],
  ["caa00000-0000-4000-8000-000000000013", "Casa", "Quiero ir a casa", "Lugares", "orange", "Home", "/pictograms/home.png", 13],
  ["caa00000-0000-4000-8000-000000000014", "Escuela", "Quiero ir a la escuela", "Lugares", "blue", "School", "/pictograms/school.png", 14],
  ["caa00000-0000-4000-8000-000000000015", "Bano", "Quiero ir al bano", "Lugares", "emerald", "Bath", "/pictograms/bathroom-place.png", 15],
  ["caa00000-0000-4000-8000-000000000016", "Parque", "Quiero ir al parque", "Lugares", "sage", "MapPin", "/pictograms/park.png", 16],
  ["caa00000-0000-4000-8000-000000000017", "Dolor", "Me duele", "Necesidades", "rose", "AlertTriangle", "/pictograms/pain.png", 17],
  ["caa00000-0000-4000-8000-000000000018", "Miedo", "Tengo miedo", "Emociones", "violet", "Frown", "/pictograms/fear.png", 18],
  ["caa00000-0000-4000-8000-000000000019", "Hablar", "Quiero hablar", "Acciones", "sky", "MessageCircle", "/pictograms/talk.png", 19],
  ["caa00000-0000-4000-8000-000000000020", "Hospital", "Quiero ir al hospital", "Lugares", "blue", "MapPin", "/pictograms/hospital.png", 20]
];

const events = [];

const run = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const [id, fullName, email, role] of users) {
      await client.query(
        `INSERT INTO users (id, full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           updated_at = NOW()`,
        [id, fullName, email, PASSWORD_HASH, role]
      );
    }

    await client.query(
      `INSERT INTO user_access (actor_user_id, subject_user_id, relationship)
       VALUES
         ($1, $4, 'guardian'),
         ($2, $4, 'therapist'),
         ($3, $4, 'teacher')
       ON CONFLICT (actor_user_id, subject_user_id) DO UPDATE SET
         relationship = EXCLUDED.relationship`,
      [USER_IDS.guardian, USER_IDS.therapist, USER_IDS.teacher, USER_IDS.child]
    );

    await client.query(
      `INSERT INTO student_profiles (id, child_user_id, display_name, age, support_level, main_context)
       VALUES ($1, $2, 'Mateo Rojas', 8, 'Apoyo comunicacional medio', 'Casa y colegio')
       ON CONFLICT (id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         age = EXCLUDED.age,
         support_level = EXCLUDED.support_level,
         main_context = EXCLUDED.main_context,
         updated_at = NOW()`,
      [MATEO_PROFILE_ID, USER_IDS.child]
    );

    await client.query(
      `INSERT INTO devices (id, student_profile_id, device_code, name, status, battery_level, wifi_ssid, firmware_version, last_sync_at)
       VALUES ($1, $2, 'STCS-ESP32-001', 'Comunicador Mateo', 'pending', 0, NULL, 'v0.4.0-pages', NULL)
       ON CONFLICT (device_code) DO UPDATE SET
         student_profile_id = EXCLUDED.student_profile_id,
         name = EXCLUDED.name,
         status = EXCLUDED.status,
         battery_level = EXCLUDED.battery_level,
         wifi_ssid = EXCLUDED.wifi_ssid,
         firmware_version = EXCLUDED.firmware_version,
         last_sync_at = EXCLUDED.last_sync_at,
         updated_at = NOW()`,
      [DEVICE_ID, MATEO_PROFILE_ID]
    );

    for (const pictogram of pictograms) {
      await client.query(
        `INSERT INTO pictograms (id, student_profile_id, label, message, category, color_tone, icon_name, image_path, position, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
         ON CONFLICT (id) DO UPDATE SET
           label = EXCLUDED.label,
           message = EXCLUDED.message,
           category = EXCLUDED.category,
           color_tone = EXCLUDED.color_tone,
           icon_name = EXCLUDED.icon_name,
           image_path = EXCLUDED.image_path,
           position = EXCLUDED.position,
           is_active = TRUE,
           updated_at = NOW()`,
        [pictogram[0], MATEO_PROFILE_ID, ...pictogram.slice(1)]
      );
    }

    for (const [id, eventType, actionLabel, context, category, emotion, intensity, message, pictogramId, age] of events) {
      await client.query(
        `INSERT INTO device_events (
           id, device_id, student_profile_id, event_type, action_label, context,
           actor_name, emotion, intensity, payload, occurred_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'Dispositivo ESP32', $7, $8, $9::jsonb, NOW() - $10::interval)
         ON CONFLICT (id) DO UPDATE SET
           event_type = EXCLUDED.event_type,
           action_label = EXCLUDED.action_label,
           context = EXCLUDED.context,
           emotion = EXCLUDED.emotion,
           intensity = EXCLUDED.intensity,
           payload = EXCLUDED.payload,
           occurred_at = EXCLUDED.occurred_at`,
        [
          id,
          DEVICE_ID,
          MATEO_PROFILE_ID,
          eventType,
          actionLabel,
          context,
          emotion,
          intensity,
          JSON.stringify({ category, message, pictogramId, source: "esp32-device" }),
          age
        ]
      );
    }

    await client.query("COMMIT");
    console.log("Seed STCS completado: usuarios, perfil, dispositivo, pictogramas y eventos creados.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((error) => {
  console.error("No fue posible ejecutar el seed STCS.");
  console.error(error);
  process.exit(1);
});
