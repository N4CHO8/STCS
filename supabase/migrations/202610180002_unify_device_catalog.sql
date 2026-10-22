BEGIN;

-- Preserve historical rows for event traceability, but expose only the catalog
-- that is actually embedded in the physical ESP32.
UPDATE pictograms
SET is_active = FALSE, updated_at = NOW()
WHERE student_profile_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  AND id::text NOT LIKE 'caa00000-0000-4000-8000-%';

INSERT INTO pictograms (
  id, student_profile_id, label, message, category, color_tone,
  icon_name, image_path, position, is_active
)
VALUES
  ('caa00000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Agua', 'Quiero agua', 'Necesidades', 'sky', 'Droplets', '/pictograms/water.png', 1, TRUE),
  ('caa00000-0000-4000-8000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Comida', 'Quiero comida', 'Necesidades', 'amber', 'Utensils', '/pictograms/food.png', 2, TRUE),
  ('caa00000-0000-4000-8000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bano', 'Necesito ir al bano', 'Necesidades', 'cyan', 'Bath', '/pictograms/bathroom-need.png', 3, TRUE),
  ('caa00000-0000-4000-8000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ayuda', 'Necesito ayuda', 'Necesidades', 'rose', 'HelpCircle', '/pictograms/help.png', 4, TRUE),
  ('caa00000-0000-4000-8000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Feliz', 'Estoy feliz', 'Emociones', 'yellow', 'Smile', '/pictograms/happy.png', 5, TRUE),
  ('caa00000-0000-4000-8000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Triste', 'Estoy triste', 'Emociones', 'blue', 'Frown', '/pictograms/sad.png', 6, TRUE),
  ('caa00000-0000-4000-8000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Enojado', 'Estoy enojado', 'Emociones', 'rose', 'AlertTriangle', '/pictograms/angry.png', 7, TRUE),
  ('caa00000-0000-4000-8000-000000000008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cansado', 'Estoy cansado', 'Emociones', 'violet', 'Clock', '/pictograms/tired.png', 8, TRUE),
  ('caa00000-0000-4000-8000-000000000009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Jugar', 'Quiero jugar', 'Acciones', 'emerald', 'Gamepad2', '/pictograms/play.png', 9, TRUE),
  ('caa00000-0000-4000-8000-000000000010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Comer', 'Quiero comer', 'Acciones', 'orange', 'Utensils', '/pictograms/eat.png', 10, TRUE),
  ('caa00000-0000-4000-8000-000000000011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dormir', 'Quiero dormir', 'Acciones', 'indigo', 'Moon', '/pictograms/sleep.png', 11, TRUE),
  ('caa00000-0000-4000-8000-000000000012', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ir', 'Quiero ir', 'Acciones', 'cyan', 'ArrowRight', '/pictograms/go.png', 12, TRUE),
  ('caa00000-0000-4000-8000-000000000013', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Casa', 'Quiero ir a casa', 'Lugares', 'orange', 'Home', '/pictograms/home.png', 13, TRUE),
  ('caa00000-0000-4000-8000-000000000014', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Escuela', 'Quiero ir a la escuela', 'Lugares', 'blue', 'School', '/pictograms/school.png', 14, TRUE),
  ('caa00000-0000-4000-8000-000000000015', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bano', 'Quiero ir al bano', 'Lugares', 'emerald', 'Bath', '/pictograms/bathroom-place.png', 15, TRUE),
  ('caa00000-0000-4000-8000-000000000016', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Parque', 'Quiero ir al parque', 'Lugares', 'sage', 'MapPin', '/pictograms/park.png', 16, TRUE)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  message = EXCLUDED.message,
  category = EXCLUDED.category,
  color_tone = EXCLUDED.color_tone,
  icon_name = EXCLUDED.icon_name,
  image_path = EXCLUDED.image_path,
  position = EXCLUDED.position,
  is_active = TRUE,
  updated_at = NOW();

COMMIT;
