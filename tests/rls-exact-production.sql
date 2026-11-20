\set ON_ERROR_STOP on
-- Disposable PostgreSQL 17 database ONLY. Never point this at Supabase.
DO $guard$ BEGIN
 IF current_setting('server_version_num')::int / 10000 <> 17 THEN
  RAISE EXCEPTION 'Disposable test requires PostgreSQL 17';
 END IF;
 IF current_database() <> 'neptlium_disposable_rls' THEN
  RAISE EXCEPTION 'Refusing to run outside disposable database';
 END IF;
 IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
            WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m')) THEN
  RAISE EXCEPTION 'Refusing to run on nonempty public schema';
 END IF;
END $guard$;
BEGIN;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger LANGUAGE plpgsql SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE cmd record; tbl name;
BEGIN
 FOR cmd IN
  SELECT * FROM pg_event_trigger_ddl_commands()
  WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
    AND object_type IN ('table','partitioned table')
 LOOP
  IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public')
     AND cmd.schema_name NOT IN ('pg_catalog','information_schema')
     AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
   BEGIN
    SELECT c.relname INTO tbl FROM pg_catalog.pg_class c WHERE c.oid = cmd.objid;
    EXECUTE format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
    RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
   EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
   END;
  ELSE
   RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
  END IF;
 END LOOP;
END;
$function$;
CREATE EVENT TRIGGER ensure_rls ON ddl_command_end EXECUTE FUNCTION public.rls_auto_enable();
DO $$ BEGIN
 IF NOT has_function_privilege('anon','public.rls_auto_enable()','EXECUTE') THEN RAISE EXCEPTION 'Expected baseline PUBLIC grant absent'; END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
 IF has_function_privilege('anon','public.rls_auto_enable()','EXECUTE') OR has_function_privilege('authenticated','public.rls_auto_enable()','EXECUTE') THEN RAISE EXCEPTION 'Client EXECUTE grant remains'; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname='ensure_rls' AND evtenabled='O' AND evtfoid='public.rls_auto_enable()'::regprocedure) THEN RAISE EXCEPTION 'Trigger not bound/enabled'; END IF;
END $$;
CREATE TABLE public.gate_rls_probe(id bigint);
DO $$ BEGIN
 IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.gate_rls_probe'::regclass) THEN RAISE EXCEPTION 'Event trigger did not enable RLS'; END IF;
END $$;
SELECT 'PASS: clients denied, trigger enabled, new table protected' AS result;
ROLLBACK;
