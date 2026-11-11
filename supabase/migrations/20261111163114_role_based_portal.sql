BEGIN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS public_number BIGINT GENERATED ALWAYS AS IDENTITY;
CREATE UNIQUE INDEX IF NOT EXISTS student_public_number ON public.student_profiles(public_number);
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS sensitive_notes TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS one_child_per_guardian ON public.user_access(actor_user_id) WHERE relationship='guardian';

CREATE TABLE IF NOT EXISTS public.specialist_reports (
  id UUID PRIMARY KEY,
  student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id),
  author_user_id UUID NOT NULL REFERENCES public.users(id),
  diagnosis TEXT NOT NULL,
  teacher_guidance TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reports_profile_date ON public.specialist_reports(student_profile_id,created_at DESC);
CREATE TABLE IF NOT EXISTS public.app_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  app_title VARCHAR(80) NOT NULL DEFAULT 'STCS',
  support_email VARCHAR(120) NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO public.app_settings(id) VALUES(TRUE) ON CONFLICT DO NOTHING;
ALTER TABLE public.specialist_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.emotions, public.records FROM anon, authenticated;
REVOKE ALL ON public.specialist_reports, public.app_settings FROM anon, authenticated;
COMMIT;
