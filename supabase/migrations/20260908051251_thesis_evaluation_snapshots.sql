-- Thesis Mode Phase 3: durable evaluation snapshots.
-- Browser access remains closed; apps/api service-role authority only.

create table if not exists public.thesis_evaluations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  thesis_id uuid not null,
  thesis_version integer not null check (thesis_version > 0),
  subject_type text not null check (char_length(subject_type) between 1 and 80),
  subject_key text not null check (char_length(subject_key) between 1 and 240),
  decision text not null check (decision in ('QUALIFIED','REJECTED','INSUFFICIENT_EVIDENCE')),
  score_bps integer not null check (score_bps between 0 and 10000),
  coverage_bps integer not null check (coverage_bps between 0 and 10000),
  confidence_bps integer not null check (confidence_bps between 0 and 10000),
  summary jsonb not null,
  evaluated_by uuid not null references auth.users(id) on delete restrict,
  evaluated_at timestamptz not null default now(),
  constraint thesis_evaluations_thesis_owner_fk foreign key (thesis_id, owner_id)
    references public.theses(id, owner_id) on delete restrict
);

create index if not exists thesis_evaluations_subject_history_idx
  on public.thesis_evaluations(owner_id, thesis_id, subject_type, subject_key, evaluated_at desc);

alter table public.thesis_evaluations enable row level security;

-- No authenticated/browser policies. Direct access fails closed.
