BEGIN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_private_test BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS is_private_test BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS power_source TEXT NOT NULL DEFAULT 'unknown';
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='users_private_test_scope') THEN
  ALTER TABLE public.users ADD CONSTRAINT users_private_test_scope CHECK (NOT is_private_test OR (NOT is_demo AND role IN ('therapist','teacher','guardian','child')));
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='profiles_private_test_scope') THEN
  ALTER TABLE public.student_profiles ADD CONSTRAINT profiles_private_test_scope CHECK (NOT (is_private_test AND is_demo));
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='devices_power_source') THEN
  ALTER TABLE public.devices ADD CONSTRAINT devices_power_source CHECK(power_source IN ('unknown','usb','battery'));
 END IF;
END $$;
-- Three distinct scopes: real, public demo and private hardware tests.
-- A private test can never be used as an activation bypass into real records.
CREATE OR REPLACE FUNCTION public.enforce_demo_scope() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE actor_scope TEXT; subject_scope TEXT;
BEGIN
 IF TG_TABLE_NAME='user_access' THEN
  SELECT is_demo::text||':'||is_private_test::text INTO actor_scope FROM public.users WHERE id=NEW.actor_user_id;
  SELECT is_demo::text||':'||is_private_test::text INTO subject_scope FROM public.users WHERE id=NEW.subject_user_id;
 ELSE
  actor_scope:=NEW.is_demo::text||':'||NEW.is_private_test::text;
  SELECT is_demo::text||':'||is_private_test::text INTO subject_scope FROM public.users WHERE id=NEW.child_user_id;
 END IF;
 IF actor_scope IS DISTINCT FROM subject_scope THEN
  RAISE EXCEPTION 'Las cuentas y perfiles deben pertenecer al mismo entorno de datos.' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_demo_scope() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE TRIGGER user_access_demo_scope BEFORE INSERT OR UPDATE ON public.user_access
FOR EACH ROW EXECUTE FUNCTION public.enforce_demo_scope();
CREATE OR REPLACE TRIGGER student_profile_demo_scope BEFORE INSERT OR UPDATE OF child_user_id,is_demo,is_private_test ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_demo_scope();
CREATE OR REPLACE FUNCTION public.keep_user_demo_scope() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN
 IF NEW.is_demo IS DISTINCT FROM OLD.is_demo OR NEW.is_private_test IS DISTINCT FROM OLD.is_private_test THEN
  RAISE EXCEPTION 'El entorno de una cuenta es inmutable.' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.keep_user_demo_scope() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE TRIGGER users_keep_demo_scope BEFORE UPDATE OF is_demo,is_private_test ON public.users
FOR EACH ROW EXECUTE FUNCTION public.keep_user_demo_scope();
COMMIT;
