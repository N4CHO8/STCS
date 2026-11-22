-- Server-only operational metadata; never expose identities, messages or credentials.
CREATE TABLE IF NOT EXISTS public.app_operation_audit (
  id UUID PRIMARY KEY,
  actor_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_operation_audit_profile_date
  ON public.app_operation_audit(student_profile_id, created_at DESC);
ALTER TABLE public.app_operation_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_operation_audit FROM PUBLIC, anon, authenticated;
