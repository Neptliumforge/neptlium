-- Pass 3: authenticated, provider-independent identity linking.
-- Supabase Auth remains active while an existing user proves both sessions.

do $$
begin
  if to_regclass('public.identity_principals') is null
     or to_regclass('public.identity_provider_subjects') is null
     or to_regclass('public.identity_events') is null then
    raise exception 'identity principal foundation must be applied first';
  end if;
end $$;

alter table public.identity_events drop constraint identity_events_operation_check;
alter table public.identity_events add constraint identity_events_operation_check
  check (operation in (
    'principal.created', 'provider_subject.linked', 'provider_subject.revoked',
    'provider_subject.lifecycle_synced', 'principal.suspended', 'principal.retired'
  ));

create or replace function public.link_clerk_identity_subject(
  p_clerk_subject text,
  p_idempotency_key text,
  p_request_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_supabase_subject text;
  v_principal_id uuid;
  v_existing public.identity_provider_subjects%rowtype;
  v_event public.identity_events%rowtype;
begin
  if auth.uid() is null then raise exception 'authenticated Supabase session required'; end if;
  if p_clerk_subject is null or p_clerk_subject <> btrim(p_clerk_subject)
     or length(p_clerk_subject) < 6 or length(p_clerk_subject) > 255 then
    raise exception 'invalid Clerk subject';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) < 8 or length(p_idempotency_key) > 128 then
    raise exception 'invalid idempotency key';
  end if;
  v_supabase_subject := auth.uid()::text;
  perform pg_advisory_xact_lock(hashtextextended('identity:link:' || v_supabase_subject, 0));

  select principal_id into strict v_principal_id
  from public.identity_provider_subjects
  where provider = 'SUPABASE_AUTH' and provider_subject = v_supabase_subject and status = 'ACTIVE';

  select * into v_event from public.identity_events
  where operation = 'provider_subject.linked'
    and idempotency_key = p_idempotency_key
    and principal_id = v_principal_id;
  if found then
    if v_event.metadata->>'provider' <> 'CLERK'
       or v_event.metadata->>'provider_subject' <> p_clerk_subject then
      raise exception 'idempotency conflict';
    end if;
    return jsonb_build_object('principal_id', v_principal_id, 'provider', 'CLERK', 'linked', true, 'replayed', true);
  end if;

  select * into v_existing from public.identity_provider_subjects
  where provider = 'CLERK' and provider_subject = p_clerk_subject;
  if found and (v_existing.principal_id <> v_principal_id or v_existing.status <> 'ACTIVE') then
    raise exception 'Clerk subject is unavailable';
  end if;

  insert into public.identity_provider_subjects(principal_id, provider, provider_subject)
  values (v_principal_id, 'CLERK', p_clerk_subject)
  on conflict (provider, provider_subject) do nothing;

  insert into public.identity_events(
    principal_id, provider_subject_id, actor_principal_id,
    operation, idempotency_key, request_id, metadata
  )
  select v_principal_id, s.id, v_principal_id,
    'provider_subject.linked', p_idempotency_key, p_request_id,
    jsonb_build_object('provider', 'CLERK', 'provider_subject', p_clerk_subject)
  from public.identity_provider_subjects s
  where s.provider = 'CLERK' and s.provider_subject = p_clerk_subject;

  return jsonb_build_object('principal_id', v_principal_id, 'provider', 'CLERK', 'linked', true, 'replayed', false);
end $$;

create or replace function public.sync_clerk_identity_lifecycle(
  p_clerk_subject text,
  p_event_id text,
  p_event_type text,
  p_event_digest text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_subject public.identity_provider_subjects%rowtype;
  v_event public.identity_events%rowtype;
begin
  if p_event_type not in ('user.created','user.updated','user.deleted') then
    raise exception 'unsupported Clerk lifecycle event';
  end if;
  if p_event_id is null or length(p_event_id) > 255
     or p_event_digest !~ '^[0-9a-f]{64}$' then raise exception 'invalid Clerk lifecycle evidence'; end if;
  perform pg_advisory_xact_lock(hashtextextended('identity:clerk-event:' || p_event_id, 0));

  select * into v_event from public.identity_events
  where operation = 'provider_subject.lifecycle_synced' and idempotency_key = p_event_id;
  if found then
    if v_event.metadata->>'event_digest' <> p_event_digest then raise exception 'webhook replay conflict'; end if;
    return jsonb_build_object('accepted', true, 'replayed', true);
  end if;

  select * into v_subject from public.identity_provider_subjects
  where provider = 'CLERK' and provider_subject = p_clerk_subject for update;
  if not found then
    return jsonb_build_object('accepted', true, 'mapped', false, 'replayed', false);
  end if;

  if p_event_type = 'user.deleted' then
    update public.identity_provider_subjects
    set status = 'REVOKED', revoked_at = coalesce(revoked_at, now())
    where id = v_subject.id and status = 'ACTIVE';
  end if;

  insert into public.identity_events(
    principal_id, provider_subject_id, operation,
    idempotency_key, request_id, metadata
  ) values (
    v_subject.principal_id, v_subject.id, 'provider_subject.lifecycle_synced',
    p_event_id, p_event_id,
    jsonb_build_object('provider', 'CLERK', 'event_type', p_event_type, 'event_digest', p_event_digest)
  );
  return jsonb_build_object('accepted', true, 'mapped', true, 'replayed', false);
end $$;

revoke all on function public.link_clerk_identity_subject(text,text,text) from public, anon, service_role;
grant execute on function public.link_clerk_identity_subject(text,text,text) to authenticated;

revoke all on function public.sync_clerk_identity_lifecycle(text,text,text,text) from public, anon, authenticated;
grant execute on function public.sync_clerk_identity_lifecycle(text,text,text,text) to service_role;
