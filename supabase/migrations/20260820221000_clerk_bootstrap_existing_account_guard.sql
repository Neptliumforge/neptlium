-- Prevent Clerk bootstrap from creating a second principal for an existing Neptlium account.
--
-- A verified Clerk email that already belongs to an active Neptlium profile must
-- complete the dual-session linking flow. Only a genuinely new verified email may
-- create a new principal.

create or replace function public.bootstrap_clerk_identity_principal(
  p_clerk_subject text,
  p_verified_email text,
  p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_principal_id uuid;
  v_subject_id uuid;
  v_existing_email_principal uuid;
  v_existing_email_count integer;
  v_email text := lower(btrim(p_verified_email));
begin
  if p_clerk_subject is null
     or p_clerk_subject <> btrim(p_clerk_subject)
     or length(p_clerk_subject) not between 1 and 255 then
    raise exception 'invalid Clerk subject';
  end if;
  if v_email is null
     or length(v_email) not between 3 and 320
     or position('@' in v_email) < 2 then
    raise exception 'a verified primary email is required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('clerk-bootstrap:' || p_clerk_subject, 0));

  select s.principal_id, s.id
  into v_principal_id, v_subject_id
  from public.identity_provider_subjects s
  join public.identity_principals p on p.id = s.principal_id
  where s.provider = 'CLERK'
    and s.provider_subject = p_clerk_subject
    and s.status = 'ACTIVE'
    and p.status = 'ACTIVE';

  if v_principal_id is not null then
    return jsonb_build_object(
      'status', 'existing',
      'profile_id', v_principal_id,
      'provider_subject_id', v_subject_id
    );
  end if;

  select count(*)::integer, min(profile.id::text)::uuid
  into v_existing_email_count, v_existing_email_principal
  from public.profiles profile
  join public.identity_principals principal on principal.id = profile.id
  where lower(btrim(profile.email)) = v_email
    and principal.status = 'ACTIVE';

  if v_existing_email_count > 1 then
    raise exception 'verified email resolves to multiple active principals';
  end if;

  if v_existing_email_count = 1 then
    if exists (
      select 1
      from public.identity_provider_subjects subject
      where subject.principal_id = v_existing_email_principal
        and subject.provider = 'CLERK'
        and subject.status = 'ACTIVE'
        and subject.provider_subject <> p_clerk_subject
    ) then
      raise exception 'verified email is already linked to another Clerk identity';
    end if;

    return jsonb_build_object(
      'status', 'link_required',
      'profile_id', v_existing_email_principal
    );
  end if;

  v_principal_id := gen_random_uuid();
  insert into public.identity_principals (id) values (v_principal_id);

  insert into public.identity_provider_subjects (
    principal_id, provider, provider_subject
  ) values (
    v_principal_id, 'CLERK', p_clerk_subject
  ) returning id into v_subject_id;

  insert into public.profiles (id, user_id, email)
  values (v_principal_id, v_principal_id, v_email);

  insert into public.user_roles (user_id, role)
  values (v_principal_id, 'user')
  on conflict do nothing;

  insert into public.identity_events (
    principal_id, operation, request_id, idempotency_key, metadata
  ) values (
    v_principal_id,
    'principal.created',
    nullif(btrim(p_request_id), ''),
    'clerk-bootstrap:principal:' || p_clerk_subject,
    jsonb_build_object('source', 'clerk_authenticated_bootstrap')
  );

  insert into public.identity_events (
    principal_id, provider_subject_id, operation, request_id,
    idempotency_key, metadata
  ) values (
    v_principal_id,
    v_subject_id,
    'provider_subject.linked',
    nullif(btrim(p_request_id), ''),
    'clerk-bootstrap:subject:' || p_clerk_subject,
    jsonb_build_object('provider', 'CLERK', 'source', 'clerk_authenticated_bootstrap')
  );

  return jsonb_build_object(
    'status', 'created',
    'profile_id', v_principal_id,
    'provider_subject_id', v_subject_id
  );
end
$$;

revoke all on function public.bootstrap_clerk_identity_principal(text, text, text)
from public, anon, authenticated;
grant execute on function public.bootstrap_clerk_identity_principal(text, text, text)
to service_role;
