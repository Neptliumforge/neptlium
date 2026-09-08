-- Thesis Mode Phase 6: immutable Revealed Thesis computation snapshots.
-- Browser access remains closed; apps/api service-role authority only.

create table if not exists public.thesis_revealed_observations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.identity_principals(id) on delete restrict,
  thesis_id uuid not null,
  thesis_version integer not null check (thesis_version > 0),
  computation_id uuid not null,
  metric_key text not null check (char_length(metric_key) between 1 and 120),
  observation_type text not null check (observation_type in ('PREFERRED_RANGE','AVOIDED_RANGE','MINIMUM_THRESHOLD','MAXIMUM_THRESHOLD','POSITIVE_ASSOCIATION','NEGATIVE_ASSOCIATION','EVIDENCE_QUALITY_PREFERENCE')),
  confidence_bps integer not null check (confidence_bps between 0 and 10000),
  strength_bps integer not null check (strength_bps between 0 and 10000),
  observation jsonb not null,
  computed_at timestamptz not null default now(),
  constraint thesis_revealed_observations_thesis_owner_fk foreign key (thesis_id, owner_id)
    references public.theses(id, owner_id) on delete restrict
);

create index if not exists thesis_revealed_observations_latest_idx
  on public.thesis_revealed_observations(owner_id, thesis_id, thesis_version, computed_at desc);
create index if not exists thesis_revealed_observations_computation_idx
  on public.thesis_revealed_observations(computation_id, metric_key);

alter table public.thesis_revealed_observations enable row level security;

-- Intentionally no authenticated/browser policies. Service-role API access only.
