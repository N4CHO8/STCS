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
  )
ON CONFLICT (actor_user_id, subject_user_id) DO NOTHING;

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
