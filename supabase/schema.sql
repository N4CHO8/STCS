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

CREATE INDEX IF NOT EXISTS idx_user_access_subject_user_id ON user_access(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_child_user_id ON student_profiles(child_user_id);
CREATE INDEX IF NOT EXISTS idx_devices_student_profile_id ON devices(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_pictograms_student_profile_id ON pictograms(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_device_events_profile_date ON device_events(student_profile_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_events_device_id ON device_events(device_id);
