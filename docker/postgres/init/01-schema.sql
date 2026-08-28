CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'guardian',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emotions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion VARCHAR(50) NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  note TEXT,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  observed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_access (
  actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (actor_user_id, subject_user_id)
);

CREATE INDEX IF NOT EXISTS idx_emotions_user_id ON emotions(user_id);
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_subject_user_id ON user_access(subject_user_id);

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
CREATE INDEX IF NOT EXISTS idx_devices_student_profile_id ON devices(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_pictograms_student_profile_id ON pictograms(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_device_events_profile_date ON device_events(student_profile_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_events_device_id ON device_events(device_id);

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Usuario Demo',
  'demo@stcs.local',
  '$2a$10$iZ4eoeGIOqgVg0q.jAFbFuvSURJiyu4SwyQQKuYFWSzTdBS70PSUK',
  'guardian'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Terapeuta Demo',
  'terapeuta@stcs.local',
  '$2a$10$iZ4eoeGIOqgVg0q.jAFbFuvSURJiyu4SwyQQKuYFWSzTdBS70PSUK',
  'therapist'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Administrador Demo',
  'admin@stcs.local',
  '$2a$10$iZ4eoeGIOqgVg0q.jAFbFuvSURJiyu4SwyQQKuYFWSzTdBS70PSUK',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Docente Ana',
  'docente@stcs.local',
  '$2a$10$iZ4eoeGIOqgVg0q.jAFbFuvSURJiyu4SwyQQKuYFWSzTdBS70PSUK',
  'teacher'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Mateo Rojas',
  'mateo@stcs.local',
  '$2a$10$iZ4eoeGIOqgVg0q.jAFbFuvSURJiyu4SwyQQKuYFWSzTdBS70PSUK',
  'child'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Lucas Vargas',
  'lucas@stcs.local',
  '$2a$10$iZ4eoeGIOqgVg0q.jAFbFuvSURJiyu4SwyQQKuYFWSzTdBS70PSUK',
  'child'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_access (actor_user_id, subject_user_id, relationship)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'guardian'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'therapist'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    'teacher'
  )
ON CONFLICT (actor_user_id, subject_user_id) DO NOTHING;

INSERT INTO student_profiles (id, child_user_id, display_name, age, support_level, main_context)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '44444444-4444-4444-4444-444444444444',
    'Mateo Rojas',
    8,
    'Apoyo comunicacional medio',
    'Casa y colegio'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '55555555-5555-5555-5555-555555555555',
    'Lucas Vargas',
    7,
    'Apoyo comunicacional inicial',
    'Colegio'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO devices (id, student_profile_id, device_code, name, status, battery_level, wifi_ssid, firmware_version, last_sync_at)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'STCS-ESP32-001',
  'Comunicador Mateo',
  'connected',
  82,
  'Casa_2.4G',
  'v0.1.0',
  NOW() - INTERVAL '18 minutes'
)
ON CONFLICT (device_code) DO UPDATE SET
  status = EXCLUDED.status,
  battery_level = EXCLUDED.battery_level,
  wifi_ssid = EXCLUDED.wifi_ssid,
  firmware_version = EXCLUDED.firmware_version,
  last_sync_at = EXCLUDED.last_sync_at,
  updated_at = NOW();

INSERT INTO pictograms (id, student_profile_id, label, message, category, color_tone, icon_name, position)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Agua', 'quiero agua', 'Necesidades', 'sky', 'Droplets', 1),
  ('e0000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Comer', 'quiero comer', 'Necesidades', 'amber', 'Utensils', 2),
  ('e0000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bano', 'quiero ir al bano', 'Necesidades', 'cyan', 'Bath', 3),
  ('e0000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ayuda', 'necesito ayuda', 'Apoyo', 'rose', 'HelpCircle', 4),
  ('e0000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Feliz', 'estoy feliz', 'Emociones', 'yellow', 'Smile', 5),
  ('e0000000-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Triste', 'estoy triste', 'Emociones', 'blue', 'Frown', 6),
  ('e0000000-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Casa', 'quiero ir a casa', 'Lugares', 'emerald', 'Home', 7),
  ('e0000000-0000-0000-0000-000000000008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Colegio', 'quiero ir al colegio', 'Lugares', 'indigo', 'School', 8),
  ('e0000000-0000-0000-0000-000000000009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pausa', 'necesito una pausa', 'Acciones', 'violet', 'Clock', 9),
  ('e0000000-0000-0000-0000-000000000010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Salir', 'quiero salir', 'Acciones', 'orange', 'MapPin', 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO device_events (id, device_id, student_profile_id, event_type, action_label, context, actor_name, emotion, intensity, payload, occurred_at)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pictogram_selected', 'Selecciono: Agua', 'Casa', 'Dispositivo ESP32', NULL, NULL, '{"category":"Necesidades","pictogramId":"e0000000-0000-0000-0000-000000000001"}', NOW() - INTERVAL '30 minutes'),
  ('f0000000-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'emotion_recorded', 'Emocion: Ansioso', 'Colegio', 'Docente Ana', 'ansioso', 3, '{"category":"Emociones"}', NOW() - INTERVAL '2 hours'),
  ('f0000000-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sync_completed', 'Sincronizacion completada', 'Dispositivo', 'Sistema', NULL, NULL, '{"category":"Sistema"}', NOW() - INTERVAL '4 hours'),
  ('f0000000-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pictogram_selected', 'Selecciono: Comer', 'Casa', 'Dispositivo ESP32', NULL, NULL, '{"category":"Necesidades","pictogramId":"e0000000-0000-0000-0000-000000000002"}', NOW() - INTERVAL '1 day'),
  ('f0000000-0000-0000-0000-000000000005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'emotion_recorded', 'Emocion: Tranquilo', 'Casa', 'Cuidadora Laura', 'tranquilo', 4, '{"category":"Emociones"}', NOW() - INTERVAL '1 day'),
  ('f0000000-0000-0000-0000-000000000006', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pictogram_selected', 'Selecciono: Ayuda', 'Colegio', 'Dispositivo ESP32', NULL, NULL, '{"category":"Apoyo","pictogramId":"e0000000-0000-0000-0000-000000000004"}', NOW() - INTERVAL '2 days'),
  ('f0000000-0000-0000-0000-000000000007', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pictogram_selected', 'Selecciono: Colegio', 'Casa', 'Dispositivo ESP32', NULL, NULL, '{"category":"Lugares","pictogramId":"e0000000-0000-0000-0000-000000000008"}', NOW() - INTERVAL '3 days'),
  ('f0000000-0000-0000-0000-000000000008', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'emotion_recorded', 'Emocion: Feliz', 'Terapia', 'Especialista Marco', 'feliz', 5, '{"category":"Emociones"}', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO emotions (id, user_id, emotion, intensity, note, recorded_at)
VALUES
  (
    '66666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    'tranquilo',
    4,
    'Registro visible para el apoderado y terapeuta asignados.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '55555555-5555-5555-5555-555555555555',
    'frustrado',
    3,
    'Registro de otro nino usado para demostrar bloqueo por permisos.',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO records (id, user_id, category, title, description, observed_at)
VALUES
  (
    '88888888-8888-8888-8888-888888888888',
    '44444444-4444-4444-4444-444444444444',
    'comunicacion',
    'Uso espontaneo de pictograma',
    'Solicito agua usando apoyo visual sin ayuda directa.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    '55555555-5555-5555-5555-555555555555',
    'conducta',
    'Registro reservado de otro usuario',
    'Dato de control que debe quedar bloqueado para el apoderado demo.',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;
