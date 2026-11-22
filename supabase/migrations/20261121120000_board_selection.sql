-- Additive, opt-in selection per child. Existing catalogs and boards are preserved.
-- Server-only column on a table whose Data API access is already revoked/RLS enabled.
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS board_selection jsonb DEFAULT NULL;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS usage_started_on date DEFAULT NULL;

-- Teacher-authored communication notes, separated from clinical reports.
CREATE TABLE IF NOT EXISTS public.communication_observations (
  id uuid PRIMARY KEY,
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_id uuid NOT NULL,
  observation text NOT NULL CHECK (char_length(observation) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(author_user_id, request_id)
);
CREATE INDEX IF NOT EXISTS communication_observations_profile_date_idx
  ON public.communication_observations(student_profile_id, created_at DESC);
ALTER TABLE public.communication_observations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.communication_observations FROM PUBLIC, anon, authenticated;
