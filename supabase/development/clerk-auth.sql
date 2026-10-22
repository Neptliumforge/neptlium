-- DEVELOPMENT ONLY. Outside migrations: never applied by the migration runner.
-- Run only in a disposable local database after setting neptlium.development_clerk=true.
begin;
do $$ begin
  if current_setting('neptlium.development_clerk', true) is distinct from 'true' then
    raise exception 'Explicit disposable development database acknowledgement required';
  end if;
end $$;

-- Database uniqueness covers concurrent writes outside the Clerk command too.
-- Existing duplicate contact addresses fail setup for review; nothing is auto-linked.
create unique index development_clerk_profile_email_unique
  on public.profiles(lower(btrim(email))) where email is not null;

create or replace function public.bootstrap_development_clerk_identity(p_subject text, p_email text, p_request_id text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_id uuid; v_status text; v_principal_status text;
  v_email text := lower(btrim(p_email));
begin
  if p_subject is null or p_subject !~ '^user_[A-Za-z0-9]+$' or length(p_subject) > 128 or
     v_email is null or length(v_email) not between 3 and 320 or position('@' in v_email) < 2 then
    raise exception 'invalid verified identity' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('development-clerk:' || p_subject, 0));
  perform pg_advisory_xact_lock(hashtextextended('development-email:' || v_email, 0));
  select s.principal_id, s.status, p.status into v_id, v_status, v_principal_status
    from public.identity_provider_subjects s join public.identity_principals p on p.id=s.principal_id
    where s.provider='CLERK' and s.provider_subject=p_subject;
  if found then
    if v_status <> 'ACTIVE' or v_principal_status <> 'ACTIVE' then
      raise exception 'inactive identity cannot be reactivated' using errcode='23505';
    end if;
    return jsonb_build_object('profile_id',v_id);
  end if;
  -- No email-based linking, including suspended and retired accounts.
  if exists(select 1 from public.profiles where lower(btrim(email))=v_email) then
    raise exception 'reviewed identity linking required' using errcode='23505';
  end if;
  v_id := gen_random_uuid();
  insert into public.identity_principals(id,status) values(v_id,'ACTIVE');
  insert into public.identity_provider_subjects(principal_id,provider,provider_subject,status)
    values(v_id,'CLERK',p_subject,'ACTIVE');
  insert into public.profiles(id,user_id,email) values(v_id,v_id,v_email);
  insert into public.user_roles(user_id,role) values(v_id,'user');
  insert into public.identity_events(principal_id,operation,request_id,idempotency_key,metadata)
    values(v_id,'principal.created',p_request_id,'development-clerk:'||p_subject,jsonb_build_object('source','development_clerk'));
  return jsonb_build_object('profile_id',v_id);
end $$;
revoke all on function public.bootstrap_development_clerk_identity(text,text,text) from public,anon,authenticated;
grant execute on function public.bootstrap_development_clerk_identity(text,text,text) to service_role;

create table public.development_clerk_onboarding_events(
  principal_id uuid primary key references public.identity_principals(id) on delete restrict,
  terms_accepted_at timestamptz not null default now()
);
alter table public.development_clerk_onboarding_events enable row level security;
revoke all on public.development_clerk_onboarding_events from public,anon,authenticated,service_role;
grant select on public.development_clerk_onboarding_events to service_role;
create trigger development_clerk_onboarding_no_update before update or delete on public.development_clerk_onboarding_events
  for each row execute function public.reject_identity_event_mutation();

create or replace function public.complete_development_clerk_onboarding(p_principal uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_profile public.profiles%rowtype; v_first text; v_last text; v_country text;
begin
  select * into v_profile from public.profiles where id=p_principal for update;
  if not found or not exists(select 1 from public.identity_principals where id=p_principal and status='ACTIVE') then
    raise exception 'inactive principal' using errcode='23505';
  end if;
  if v_profile.compliance_status in ('suspended','revoked') then raise exception 'account restricted' using errcode='23505'; end if;
  -- Idempotent: onboarding never rewrites account standing or an already completed profile.
  if v_profile.provisioned_at is not null then return jsonb_build_object('profile_id',p_principal); end if;
  v_first:=btrim(p_payload->>'firstName');v_last:=btrim(p_payload->>'lastName');v_country:=btrim(p_payload->>'country');
  if jsonb_typeof(p_payload) <> 'object' or
     jsonb_typeof(p_payload->'firstName') is distinct from 'string' or
     jsonb_typeof(p_payload->'lastName') is distinct from 'string' or
     jsonb_typeof(p_payload->'country') is distinct from 'string' or
     p_payload->'acceptedTerms' is distinct from 'true'::jsonb or
     p_payload->>'investorType' is distinct from 'individual' or
     coalesce(length(v_first),0) not between 1 and 100 or coalesce(length(v_last),0) not between 1 and 100 or
     coalesce(length(v_country),0) not between 1 and 100 or
     coalesce(p_payload->>'organizationName','') <> '' or coalesce(p_payload->>'website','') <> '' or coalesce(p_payload->>'companyRole','') <> '' then
    raise exception 'invalid personal onboarding' using errcode='22023';
  end if;
  update public.profiles set first_name=v_first,last_name=v_last,full_name=v_first||' '||v_last,
    country=v_country,investor_type='individual',compliance_acknowledged_at=now(),provisioned_at=now()
    where id=p_principal;
  delete from public.onboarding_drafts where user_id=p_principal;
  insert into public.development_clerk_onboarding_events(principal_id) values(p_principal);
  return jsonb_build_object('profile_id',p_principal);
end $$;
revoke all on function public.complete_development_clerk_onboarding(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.complete_development_clerk_onboarding(uuid,jsonb) to service_role;
-- Browser roles cannot mutate profile authority, regardless of historical policies.
revoke insert,update,delete,truncate,references,trigger on public.profiles from anon,authenticated;
commit;
