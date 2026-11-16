-- Gate 07: replace email-based auto-linking with an atomic, fail-closed
-- Clerk bootstrap. REVIEW ONLY until isolated restore and migration tests pass.
-- Caller must independently verify Clerk JWT and obtain a verified primary
-- email from a trusted Clerk server API. Never accept browser-provided email.
-- Existing accounts with matching email MUST complete separate ownership proof.
-- This function does not create wallets, balances, or financial capabilities.

create or replace function public.bootstrap_clerk_identity_principal(
  p_clerk_subject text,
  p_verified_email text,
  p_request_id text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_principal_id uuid;
  v_subject_id uuid;
  v_email text := lower(btrim(p_verified_email));
  v_existing_count integer;
  v_existing_subject public.identity_provider_subjects%rowtype;
  v_principal_status text;
begin
  if p_clerk_subject is null or p_clerk_subject !~ '^user_[A-Za-z0-9]{8,128}$' then
    raise exception 'invalid Clerk subject';
  end if;
  if v_email is null or length(v_email) not between 3 and 320
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' then
    raise exception 'invalid verified email';
  end if;
  if p_request_id is null or p_request_id !~ '^[A-Za-z0-9:_-]{16,128}$' then
    raise exception 'invalid provisioning request id';
  end if;

  -- Stable lock ordering. A concurrent bootstrap for the same subject or
  -- normalized email cannot pass the collision check simultaneously.
  perform pg_advisory_xact_lock(hashtextextended('clerk-bootstrap:' || p_clerk_subject, 0));
  perform pg_advisory_xact_lock(hashtextextended('clerk-email:' || v_email, 0));

  select * into v_existing_subject from public.identity_provider_subjects
  where provider = 'CLERK' and provider_subject = p_clerk_subject;
  if found then
    select status into v_principal_status from public.identity_principals
    where id = v_existing_subject.principal_id;
    if v_existing_subject.status <> 'ACTIVE' or v_principal_status is distinct from 'ACTIVE' then
      raise exception 'Clerk identity is inactive or revoked';
    end if;
    if not exists (select 1 from public.profiles where id = v_existing_subject.principal_id) then
      raise exception 'Clerk principal profile missing';
    end if;
    return jsonb_build_object('status','existing','profile_id',v_existing_subject.principal_id,
                              'provider_subject_id',v_existing_subject.id);
  end if;

  -- Email collision is NEVER identity proof. No principal ID is disclosed.
  select count(*)::integer into v_existing_count
  from public.profiles p
  where lower(btrim(p.email)) = v_email;
  if v_existing_count > 0 then
    return jsonb_build_object('status','link_required');
  end if;

  v_principal_id := gen_random_uuid();
  insert into public.identity_principals(id) values(v_principal_id);
  insert into public.identity_provider_subjects(principal_id,provider,provider_subject)
  values(v_principal_id,'CLERK',p_clerk_subject) returning id into v_subject_id;
  insert into public.profiles(id,user_id,email)
  values(v_principal_id,v_principal_id,v_email);
  insert into public.user_roles(user_id,role)
  values(v_principal_id,'user') on conflict do nothing;

  insert into public.identity_events(principal_id,operation,request_id,idempotency_key,metadata)
  values(v_principal_id,'principal.created',p_request_id,
         'clerk-bootstrap:principal:' || p_clerk_subject,
         jsonb_build_object('source','clerk_verified_preview_bootstrap'));
  insert into public.identity_events(principal_id,provider_subject_id,operation,request_id,idempotency_key,metadata)
  values(v_principal_id,v_subject_id,'provider_subject.linked',p_request_id,
         'clerk-bootstrap:subject:' || p_clerk_subject,
         jsonb_build_object('provider','CLERK','source','clerk_verified_preview_bootstrap'));
  return jsonb_build_object('status','created','profile_id',v_principal_id,
                            'provider_subject_id',v_subject_id);
end
$$;

revoke all on function public.bootstrap_clerk_identity_principal(text,text,text)
  from public, anon, authenticated;
grant execute on function public.bootstrap_clerk_identity_principal(text,text,text)
  to service_role;
