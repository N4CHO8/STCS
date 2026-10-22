INSERT INTO pictograms (
  id, student_profile_id, label, message, category, color_tone,
  icon_name, image_path, position, is_active
)
SELECT catalog.id::uuid,
       devices.student_profile_id,
       catalog.label,
       catalog.message,
       catalog.category,
       catalog.color_tone,
       catalog.icon_name,
       catalog.image_path,
       catalog.position,
       TRUE
FROM devices
CROSS JOIN (
  VALUES
    ('caa00000-0000-4000-8000-000000000017', 'Dolor', 'Me duele', 'Necesidades', 'rose', 'AlertTriangle', '/pictograms/pain.png', 17),
    ('caa00000-0000-4000-8000-000000000018', 'Miedo', 'Tengo miedo', 'Emociones', 'violet', 'Frown', '/pictograms/fear.png', 18),
    ('caa00000-0000-4000-8000-000000000019', 'Hablar', 'Quiero hablar', 'Acciones', 'sky', 'MessageCircle', '/pictograms/talk.png', 19),
    ('caa00000-0000-4000-8000-000000000020', 'Hospital', 'Quiero ir al hospital', 'Lugares', 'blue', 'MapPin', '/pictograms/hospital.png', 20)
) AS catalog(id, label, message, category, color_tone, icon_name, image_path, position)
WHERE devices.device_code = 'STCS-ESP32-001'
ON CONFLICT (id) DO UPDATE SET
  student_profile_id = EXCLUDED.student_profile_id,
  label = EXCLUDED.label,
  message = EXCLUDED.message,
  category = EXCLUDED.category,
  color_tone = EXCLUDED.color_tone,
  icon_name = EXCLUDED.icon_name,
  image_path = EXCLUDED.image_path,
  position = EXCLUDED.position,
  is_active = TRUE,
  updated_at = NOW();
