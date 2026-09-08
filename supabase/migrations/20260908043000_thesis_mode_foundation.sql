-- Thesis Mode Phase 1 persistence foundation. Forward-only. NOT applied by this change.
-- apps/api remains the authority for mutation and evaluation. This migration creates no public/browser write capability.

create table if not exists public.theses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  description text check (description is null or char_length(description) <= 1000),
  strategy text not null check (strategy in ('GROWTH_EQUITY','VENTURE','PRIVATE_EQUITY','PUBLIC_EQUITY','CREDIT','MULTI_STRATEGY','CUSTOM')),
  sectors text[] not null default '{}',
  geographies text[] not null default '{}',
  status text not null check (status in ('DRAFT','ACTIVE','ARCHIVED')) default 'DRAFT',
  is_default boolean not null default false,
  version integer not null check (version > 0) default 1,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint theses_id_owner_unique unique (id, owner_id)
);

create unique index if not exists theses_one_default_per_owner_idx
  on public.theses(owner_id)
  where is_default = true and status <> 'ARCHIVED';

create index if not exists theses_owner_updated_idx
  on public.theses(owner_id, updated_at desc);

create table if not exists public.thesis_criteria (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  metric_key text not null check (metric_key ~ '^[a-z][a-z0-9_]*$'),
  kind text not null check (kind in ('QUANTITATIVE','QUALITATIVE')),
  operator text not null check (operator in ('GT','GTE','LT','LTE','BETWEEN','EQ','CONTAINS','IS_TRUE','IS_FALSE')),
  numeric_value double precision,
  numeric_min double precision,
  numeric_max double precision,
  text_value text,
  weight_bps integer not null check (weight_bps between 0 and 10000),
  importance text not null check (importance in ('REQUIRED','PREFERRED','INFORMATIONAL')),
  rationale text check (rationale is null or char_length(rationale) <= 1000),
  position integer not null check (position between 0 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint thesis_criteria_thesis_owner_fk foreign key (thesis_id, owner_id)
    references public.theses(id, owner_id) on delete restrict,
  unique(thesis_id, metric_key, position),
  check (numeric_min is null or numeric_max is null or numeric_min <= numeric_max),
  check (
    (operator in ('GT','GTE','LT','LTE') and numeric_value is not null and numeric_min is null and numeric_max is null and text_value is null)
    or (operator = 'BETWEEN' and numeric_value is null and numeric_min is not null and numeric_max is not null and text_value is null)
    or (operator = 'CONTAINS' and numeric_value is null and numeric_min is null and numeric_max is null and text_value is not null and char_length(trim(text_value)) > 0)
    or (operator = 'EQ' and numeric_min is null and numeric_max is null and ((numeric_value is not null and text_value is null) or (numeric_value is null and text_value is not null and char_length(trim(text_value)) > 0)))
    or (operator in ('IS_TRUE','IS_FALSE') and numeric_value is null and numeric_min is null and numeric_max is null and text_value is null)
  )
);

create index if not exists thesis_criteria_thesis_position_idx
  on public.thesis_criteria(thesis_id, position, id);
create index if not exists thesis_criteria_owner_metric_idx
  on public.thesis_criteria(owner_id, metric_key);

create table if not exists public.thesis_evidence (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  subject_type text not null check (char_length(subject_type) between 1 and 80),
  subject_key text not null check (char_length(subject_key) between 1 and 240),
  metric_key text check (metric_key is null or metric_key ~ '^[a-z][a-z0-9_]*$'),
  claim text not null check (char_length(claim) between 1 and 2000),
  observed_value jsonb,
  source_type text not null check (source_type in ('FILINGS','EARNINGS','COMPANY','MARKET_DATA','RESEARCH','NEWS','REGULATORY','INTERNAL')),
  source_uri text check (source_uri is null or char_length(source_uri) <= 2000),
  source_date date,
  reporting_period_start date,
  reporting_period_end date,
  confidence_bps integer not null check (confidence_bps between 0 and 10000),
  reported boolean not null default false,
  derived boolean not null default false,
  captured_by uuid not null references auth.users(id) on delete restrict,
  captured_at timestamptz not null default now(),
  check (not (reported and derived)),
  check (reporting_period_start is null or reporting_period_end is null or reporting_period_start <= reporting_period_end)
);

create index if not exists thesis_evidence_subject_idx
  on public.thesis_evidence(owner_id, subject_type, subject_key, captured_at desc);
create index if not exists thesis_evidence_metric_idx
  on public.thesis_evidence(owner_id, metric_key, captured_at desc)
  where metric_key is not null;

alter table public.theses enable row level security;
alter table public.thesis_criteria enable row level security;
alter table public.thesis_evidence enable row level security;

-- Deliberately no authenticated/browser policies in Phase 1.
-- Direct access fails closed; reviewed apps/api service-role operations are added in later phases.
