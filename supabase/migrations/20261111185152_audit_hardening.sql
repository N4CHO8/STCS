BEGIN;
CREATE TABLE IF NOT EXISTS public.app_sessions (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS app_sessions_user ON public.app_sessions(user_id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credential_verified_at TIMESTAMPTZ;
-- Existing assignments remain trusted. Every new clinical assignment is explicitly pending.
ALTER TABLE public.user_access ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_access ALTER COLUMN approved_at DROP DEFAULT;
ALTER TABLE public.user_access ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS api_key_hash TEXT;
ALTER TABLE public.specialist_reports ADD COLUMN IF NOT EXISTS request_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS report_request_once ON public.specialist_reports(author_user_id,request_id) WHERE request_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS public.app_rate_limits (
  key TEXT PRIMARY KEY, hits INTEGER NOT NULL, window_start TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_sessions, public.app_rate_limits FROM anon, authenticated;
COMMIT;
