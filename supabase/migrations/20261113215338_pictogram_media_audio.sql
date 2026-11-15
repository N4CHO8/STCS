-- Additive only: existing catalog paths and records remain valid.
CREATE TABLE IF NOT EXISTS public.pictogram_images (
  id UUID PRIMARY KEY,
  student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id),
  png_key TEXT NOT NULL,
  rgb_key TEXT NOT NULL,
  rgb_sha256 TEXT NOT NULL CHECK (length(rgb_sha256)=64),
  png_bytes INTEGER NOT NULL CHECK (png_bytes BETWEEN 1 AND 2097152),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pictogram_images_profile_idx ON public.pictogram_images(student_profile_id);
CREATE TABLE IF NOT EXISTS public.phrase_audio (
  cache_key TEXT PRIMARY KEY CHECK (length(cache_key)=64),
  phrase TEXT NOT NULL,
  voice TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','ready','error')),
  object_key TEXT,
  sha256 TEXT,
  byte_size INTEGER CHECK(byte_size BETWEEN 44 AND 320044),
  lease UUID,
  lease_until TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pictograms ADD COLUMN IF NOT EXISTS audio_key TEXT REFERENCES public.phrase_audio(cache_key);
ALTER TABLE public.pictogram_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrase_audio ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pictogram_images,public.phrase_audio FROM PUBLIC,anon,authenticated;
COMMENT ON TABLE public.phrase_audio IS 'Phrase+voice keyed preparation queue. No client reads; server authorizes through assigned pictograms.';
