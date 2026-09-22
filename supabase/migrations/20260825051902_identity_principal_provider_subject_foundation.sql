-- Provider-independent Neptlium identity foundation.
--
-- This migration deliberately keeps Supabase Auth active. It preserves every existing
-- profile UUID as the canonical Neptlium principal and records the current Supabase
-- Auth subject without changing any financial owner, actor, ledger, funding, transfer,
-- settlement, or reconciliation reference.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'identity foundation requires public.profiles';
  end if;
  if to_regclass('auth.users') is null then
    raise exception 'identity foundation requires auth.users during the transition';
  end if;
  if to_regclass('public.identity_principals') is not null
     or to_regclass('public.identity_provider_subjects') is not null
     or to_regclass('public.identity_events') is not null then
    raise exception 'identity foundation objects already exist; review compatibility explicitly';
  end if;
  if exists (
    select 1
    from public.profiles p
    left join auth.users u on u.id = p.id
    where u.id is null
  ) then
    raise exception 'identity foundation cannot backfill a profile without a matching Supabase Auth subject';
  end if;
end
$$;

create table public.identity_principals (
  id uuid primary key,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  suspended_at timestamptz,
  retired_at timestamptz,
  constraint identity_principals_status_check
    check (status in ('ACTIVE', 'SUSPENDED', 'RETIRED')),
  constraint identity_principals_lifecycle_check
    check (
      (status = 'ACTIVE' and suspended_at is null and retired_at is null)
      or (status = 'SUSPENDED' and suspended_at is not null and retired_at is null)
      or (status = 'RETIRED' and retired_at is not null)
    )
);

comment on table public.identity_principals is
  'Stable Neptlium identity boundary. Principal UUIDs remain independent of authentication providers.';
comment on column public.identity_principals.id is
  'Canonical internal UUID retained by profiles and financial ownership during identity-provider migration.';

create table public.identity_provider_subjects (
  id uuid primary key default gen_random_uuid(),
  principal_id uuid not null references public.identity_principals(id) on delete restrict,
  provider text not null,
  provider_subject text not null,
  status text not null default 'ACTIVE',
  linked_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint identity_provider_subjects_provider_check
    check (provider in ('SUPABASE_AUTH', 'CLERK')),
  constraint identity_provider_subjects_subject_check
    check (provider_subject = btrim(provider_subject) and length(provider_subject) between 1 and 255),
  constraint identity_provider_subjects_status_check
    check (status in ('ACTIVE', 'REVOKED')),
  constraint identity_provider_subjects_lifecycle_check
    check (
      (status = 'ACTIVE' and revoked_at is null)
      or (status = 'REVOKED' and revoked_at is not null)
    ),
  constraint identity_provider_subjects_provider_subject_unique
    unique (provider, provider_subject)
);

create unique index identity_provider_subjects_active_principal_provider_unique
  on public.identity_provider_subjects (principal_id, provider)
  where status = 'ACTIVE';

create index identity_provider_subjects_principal_idx
  on public.identity_provider_subjects (principal_id, linked_at desc);

comment on table public.identity_provider_subjects is
  'Auditable mapping from an external authentication subject to one stable Neptlium principal.';
comment on column public.identity_provider_subjects.provider_subject is
  'Provider-issued immutable subject. Email and other mutable profile attributes are never identity keys.';

create table public.identity_events (
  id uuid primary key default gen_random_uuid(),
  principal_id uuid not null references public.identity_principals(id) on delete restrict,
  provider_subject_id uuid references public.identity_provider_subjects(id) on delete restrict,
  actor_principal_id uuid references public.identity_principals(id) on delete restrict,
  operation text not null,
  request_id text,
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint identity_events_operation_check
    check (operation in ('principal.created', 'provider_subject.linked', 'provider_subject.revoked', 'principal.suspended', 'principal.retired')),
  constraint identity_events_idempotency_key_check
    check (idempotency_key = btrim(idempotency_key) and length(idempotency_key) between 1 and 255),
  constraint identity_events_idempotency_unique unique (idempotency_key),
  constraint identity_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index identity_events_principal_created_idx
  on public.identity_events (principal_id, created_at desc);

create index identity_events_provider_subject_created_idx
  on public.identity_events (provider_subject_id, created_at desc)
  where provider_subject_id is not null;

create index identity_events_actor_created_idx
  on public.identity_events (actor_principal_id, created_at desc)
  where actor_principal_id is not null;

comment on table public.identity_events is
  'Append-only lifecycle evidence for Neptlium principals and authentication subject mappings.';

create function public.reject_identity_event_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'identity events are append-only';
end
$$;

create trigger identity_events_reject_update
before update on public.identity_events
for each row execute function public.reject_identity_event_mutation();

create trigger identity_events_reject_delete
before delete on public.identity_events
for each row execute function public.reject_identity_event_mutation();

insert into public.identity_principals (id, status, created_at)
select p.id, 'ACTIVE', coalesce(p.created_at, now())
from public.profiles p
order by p.id;

insert into public.identity_provider_subjects (
  principal_id,
  provider,
  provider_subject,
  status,
  linked_at
)
select p.id, 'SUPABASE_AUTH', u.id::text, 'ACTIVE', coalesce(p.created_at, now())
from public.profiles p
join auth.users u on u.id = p.id
order by p.id;

insert into public.identity_events (
  principal_id,
  operation,
  idempotency_key,
  metadata,
  created_at
)
select
  p.id,
  'principal.created',
  'migration:20260820190000:principal:' || p.id::text,
  jsonb_build_object('source', 'profiles_backfill'),
  now()
from public.identity_principals p
order by p.id;

insert into public.identity_events (
  principal_id,
  provider_subject_id,
  operation,
  idempotency_key,
  metadata,
  created_at
)
select
  s.principal_id,
  s.id,
  'provider_subject.linked',
  'migration:20260820190000:subject:' || s.id::text,
  jsonb_build_object('provider', s.provider, 'source', 'supabase_auth_backfill'),
  now()
from public.identity_provider_subjects s
order by s.id;

alter table public.identity_principals enable row level security;
alter table public.identity_provider_subjects enable row level security;
alter table public.identity_events enable row level security;

revoke all on table public.identity_principals from public, anon, authenticated;
revoke all on table public.identity_provider_subjects from public, anon, authenticated;
revoke all on table public.identity_events from public, anon, authenticated;

revoke all on function public.reject_identity_event_mutation() from public, anon, authenticated, service_role;

grant select on table public.identity_principals to service_role;
grant select on table public.identity_provider_subjects to service_role;
grant select on table public.identity_events to service_role;

do $$
begin
  if (select count(*) from public.identity_principals)
     <> (select count(*) from public.profiles) then
    raise exception 'identity principal backfill count mismatch';
  end if;
  if (select count(*) from public.identity_provider_subjects where provider = 'SUPABASE_AUTH')
     <> (select count(*) from public.profiles) then
    raise exception 'Supabase Auth subject backfill count mismatch';
  end if;
  if exists (
    select 1
    from public.profiles p
    left join public.identity_principals principal on principal.id = p.id
    left join public.identity_provider_subjects subject
      on subject.principal_id = p.id
     and subject.provider = 'SUPABASE_AUTH'
     and subject.provider_subject = p.id::text
     and subject.status = 'ACTIVE'
    where principal.id is null or subject.id is null
  ) then
    raise exception 'identity foundation backfill invariant failed';
  end if;
end
$$;
