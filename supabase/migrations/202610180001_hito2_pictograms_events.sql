ALTER TABLE pictograms
  ADD COLUMN IF NOT EXISTS image_path VARCHAR(255);

ALTER TABLE device_events
  ADD COLUMN IF NOT EXISTS pictogram_id UUID REFERENCES pictograms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS external_event_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_device_events_pictogram_id
  ON device_events(pictogram_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pictograms_profile_label_category
  ON pictograms(student_profile_id, LOWER(label), LOWER(category))
  WHERE is_active = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_device_events_external_id
  ON device_events(device_id, external_event_id)
  WHERE external_event_id IS NOT NULL;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pictograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_events ENABLE ROW LEVEL SECURITY;
