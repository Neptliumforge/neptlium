-- Thesis Mode Phase 5: append-only institutional decision history.
-- Browser access remains closed; apps/api service-role authority only.

create table if not exists public.thesis_decisions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  thesis_id uuid not null,
  thesis_version integer not null check (thesis_version > 0),
  subject_type text not null check (char_length(subject_type) between 1 and 80),
  subject_key text not null check (char_length(subject_key) between 1 and 240),
  status text not null check (status in ('WATCH','INTERESTED','PASS','INVESTED','EXITED')),
  rationale text check (rationale is null or char_length(rationale) <= 2000),
  evaluation_id uuid references public.thesis_evaluations(id) on delete restrict,
  decided_by uuid not null references auth.users(id) on delete restrict,
  decided_at timestamptz not null default now(),
  constraint thesis_decisions_thesis_owner_fk foreign key (thesis_id, owner_id)
    references public.theses(id, owner_id) on delete restrict
);

create index if not exists thesis_decisions_subject_history_idx
  on public.thesis_decisions(owner_id, thesis_id, subject_type, subject_key, decided_at desc);
create index if not exists thesis_decisions_thesis_recent_idx
  on public.thesis_decisions(owner_id, thesis_id, decided_at desc);

alter table public.thesis_decisions enable row level security;

-- No authenticated/browser policies. Direct access fails closed.
