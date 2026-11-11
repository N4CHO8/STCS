BEGIN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.users'::regclass AND conname='demo_accounts_cannot_admin') THEN
  ALTER TABLE public.users ADD CONSTRAINT demo_accounts_cannot_admin CHECK (NOT is_demo OR role IN ('therapist','teacher','guardian','child'));
 END IF;
END $$;

-- Defense in depth for the privileged application connection: a demo assignment
-- cannot be linked to a real child, even if a future API forgets to check it.
CREATE OR REPLACE FUNCTION public.enforce_demo_scope() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE actor_demo BOOLEAN; subject_demo BOOLEAN;
BEGIN
  IF TG_TABLE_NAME='user_access' THEN
    SELECT is_demo INTO actor_demo FROM public.users WHERE id=NEW.actor_user_id;
    SELECT is_demo INTO subject_demo FROM public.users WHERE id=NEW.subject_user_id;
  ELSE
    actor_demo:=NEW.is_demo;
    SELECT is_demo INTO subject_demo FROM public.users WHERE id=NEW.child_user_id;
  END IF;
  IF actor_demo IS DISTINCT FROM subject_demo THEN
    RAISE EXCEPTION 'No se pueden mezclar cuentas o perfiles demo y reales.' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_demo_scope() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE TRIGGER user_access_demo_scope BEFORE INSERT OR UPDATE ON public.user_access
FOR EACH ROW EXECUTE FUNCTION public.enforce_demo_scope();
CREATE OR REPLACE TRIGGER student_profile_demo_scope BEFORE INSERT OR UPDATE OF child_user_id,is_demo ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_demo_scope();

-- A demo identity must never become a real identity by toggling a flag.
CREATE OR REPLACE FUNCTION public.keep_user_demo_scope() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN
  IF NEW.is_demo IS DISTINCT FROM OLD.is_demo THEN
    RAISE EXCEPTION 'El tipo demo de una cuenta es inmutable.' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.keep_user_demo_scope() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE TRIGGER users_keep_demo_scope BEFORE UPDATE OF is_demo ON public.users
FOR EACH ROW EXECUTE FUNCTION public.keep_user_demo_scope();
COMMIT;
