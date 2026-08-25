-- Service-only dual-session identity linking for the Clerk transition.
--
-- apps/api verifies both the legacy Supabase session and the Clerk session before
-- calling this command with service-role authority. This avoids exposing a direct
-- authenticated RPC that could bind an arbitrary Clerk subject after cutover.

do $$
begin
  if to_regclass('public.identity_principals') is null
     or to_regclass('public.identity_provider_subjects') is null
     or to_regclass('public.identity_events') is null then
    raise exception 'identity linking service requires the provider-independent identity foundation';
  end if;
end
$$;

create or replace function public.link_clerk_identity_subject_service(
  p_supabase_subject text,
  p_clerk_subject text,
  p_idempotency_key text,
  p_request_id text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_principal_id uuid;
  v_existing public.identity_provider_subjects%rowtype;
  v_event public.identity_events%rowtype;
begin
  if p_supabase_subject is null
     or p_supabase_subject <> btrim(p_supabase_subject)
     or length(p_supabase_subject) < 1
     or length(p_supabase_subject) > 255 then
    raise exception 'invalid Supabase subject';
  end if;
  if p_clerk_subject is null
     or p_clerk_subject <> btrim(p_clerk_subject)
     or length(p_clerk_subject) < 6
     or length(p_clerk_subject) > 255 then
    raise exception 'invalid Clerk subject';
  end if;
  if p_idempotency_key is null
     or length(p_idempotency_key) < 8
     or length(p_idempotency_key) > 128 then
    raise exception 'invalid idempotency key';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('identity:service-link:' || p_supabase_subject, 0));

  select principal_id into strict v_principal_id
  from public.identity_provider_subjects
  where provider = 'SUPABASE_AUTH'
    and provider_subject = p_supabase_subject
    and status = 'ACTIVE';

  if not exists (
    select 1 from public.identity_principals
    where id = v_principal_id and status = 'ACTIVE'
  ) then
    raise exception 'Supabase subject principal is inactive';
  end if;

  select * into v_event
  from public.identity_events
  where operation = 'provider_subject.linked'
    and idempotency_key = p_idempotency_key
    and principal_id = v_principal_id;
  if found then
    if v_event.metadata->>'provider' <> 'CLERK'
       or v_event.metadata->>'provider_subject' <> p_clerk_subject then
      raise exception 'idempotency conflict';
    end if;
    return jsonb_build_object(
      'principal_id', v_principal_id,
      'provider', 'CLERK',
      'linked', true,
      'replayed', true
    );
  end if;

  if exists (
    select 1
    from public.identity_provider_subjects
    where principal_id = v_principal_id
      and provider = 'CLERK'
      and status = 'ACTIVE'
      and provider_subject <> p_clerk_subject
  ) then
    raise exception 'principal already has a different active Clerk subject';
  end if;

  select * into v_existing
  from public.identity_provider_subjects
  where provider = 'CLERK' and provider_subject = p_clerk_subject;
  if found and (v_existing.principal_id <> v_principal_id or v_existing.status <> 'ACTIVE') then
    raise exception 'Clerk subject is unavailable';
  end if;

  insert into public.identity_provider_subjects(principal_id, provider, provider_subject)
  values (v_principal_id, 'CLERK', p_clerk_subject)
  on conflict (provider, provider_subject) do nothing;

  insert into public.identity_events(
    principal_id,
    provider_subject_id,
    actor_principal_id,
    operation,
    idempotency_key,
    request_id,
    metadata
  )
  select
    v_principal_id,
    s.id,
    v_principal_id,
    'provider_subject.linked',
    p_idempotency_key,
    nullif(btrim(p_request_id), ''),
    jsonb_build_object(
      'provider', 'CLERK',
      'provider_subject', p_clerk_subject,
      'source', 'api_dual_session_link'
    )
  from public.identity_provider_subjects s
  where s.provider = 'CLERK'
    and s.provider_subject = p_clerk_subject;

  return jsonb_build_object(
    'principal_id', v_principal_id,
    'provider', 'CLERK',
    'linked', true,
    'replayed', false
  );
end
$$;

revoke all on function public.link_clerk_identity_subject_service(text, text, text, text)
from public, anon, authenticated;
grant execute on function public.link_clerk_identity_subject_service(text, text, text, text)
to service_role;
