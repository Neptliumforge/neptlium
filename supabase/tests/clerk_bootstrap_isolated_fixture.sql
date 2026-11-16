-- Disposable test-only schema; NOT a replacement for full baseline migration replay.
create role service_role nologin;
create role anon nologin;
create role authenticated nologin;
create table public.identity_principals(id uuid primary key, status text not null default 'ACTIVE');
create table public.identity_provider_subjects(
 id uuid primary key default gen_random_uuid(),
 principal_id uuid not null references public.identity_principals(id),
 provider text not null, provider_subject text not null,
 status text not null default 'ACTIVE',
 unique(provider,provider_subject));
create table public.profiles(id uuid primary key references public.identity_principals(id),
 user_id uuid not null, email text not null);
create table public.user_roles(user_id uuid not null,role text not null,unique(user_id,role));
create table public.identity_events(
 id uuid primary key default gen_random_uuid(),
 principal_id uuid not null references public.identity_principals(id),
 provider_subject_id uuid references public.identity_provider_subjects(id),
 operation text not null,request_id text,idempotency_key text unique not null,
 metadata jsonb not null default '{}'::jsonb);
