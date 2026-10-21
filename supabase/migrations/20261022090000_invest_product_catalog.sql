-- Neptlium Invest product catalog (docs/platform/INVEST_CATALOG.md).
--
-- Versioned catalog of managed-plan concepts and research collections with
-- terms, sectors, instruments, eligibility, disclosures and return figures.
-- Publication is a governed state machine written through security-definer
-- commands that record an append-only audit event in the same transaction.
--
-- Safety properties enforced here, not only in application code:
--   * Availability is CONCEPT, RESEARCH_ONLY or INVESTABLE. Publishing an
--     INVESTABLE version is disabled until a reviewed migration enables it
--     together with partner, eligibility and execution controls.
--   * Return figures are typed (historical, current yield, hypothetical,
--     approved target). Hypothetical scenarios can never be customer-visible;
--     nothing customer-visible exists without approval.
--   * Content of a version is immutable once it leaves DRAFT.
--   * Browser roles have no access; the API reads through service-role RPCs.
-- No instruments, prices, performance, return figures or holdings are seeded.

-- ---------------------------------------------------------------------------
-- Schema
-- ---------------------------------------------------------------------------

create table public.invest_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 64),
  family text not null check (family in ('MANAGED_PLAN', 'THEMATIC_COLLECTION')),
  created_at timestamptz not null default now()
);

create table public.invest_product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.invest_products(id) on delete restrict,
  version integer not null check (version > 0),
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED', 'WITHDRAWN')),
  availability text not null check (availability in ('CONCEPT', 'RESEARCH_ONLY', 'INVESTABLE')),
  name text not null check (length(name) between 1 and 80),
  tagline text not null check (length(tagline) between 1 and 160),
  summary text not null check (length(summary) between 1 and 600),
  body text not null check (length(body) between 1 and 8000),
  objective text check (objective is null or length(objective) between 1 and 300),
  risk_level smallint check (risk_level between 1 and 7),
  sort_rank integer not null default 100,
  authored_by text not null check (length(authored_by) between 1 and 128),
  submitted_by text,
  approved_by text,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  retired_at timestamptz,
  unique (product_id, version)
);

create unique index invest_product_versions_one_published
  on public.invest_product_versions (product_id) where status = 'PUBLISHED';

create table public.invest_product_terms (
  version_id uuid primary key references public.invest_product_versions(id) on delete restrict,
  terms_status text not null check (terms_status in ('PROPOSED', 'APPROVED')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  minimum_minor bigint check (minimum_minor >= 0),
  maximum_minor bigint check (maximum_minor >= 0),
  fee_note text check (fee_note is null or length(fee_note) <= 600),
  liquidity_note text check (liquidity_note is null or length(liquidity_note) <= 600),
  check (minimum_minor is null or maximum_minor is null or minimum_minor <= maximum_minor)
);

create table public.invest_research_sectors (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null unique check (length(name) between 1 and 80),
  description text not null check (length(description) between 1 and 300),
  sort_rank integer not null default 100
);

create table public.invest_version_sectors (
  version_id uuid not null references public.invest_product_versions(id) on delete restrict,
  sector_slug text not null references public.invest_research_sectors(slug) on delete restrict,
  primary key (version_id, sector_slug)
);

create table public.invest_instruments (
  id uuid primary key default gen_random_uuid(),
  symbol text not null check (length(symbol) between 1 and 24),
  name text not null check (length(name) between 1 and 160),
  instrument_type text not null check (instrument_type in ('EQUITY', 'ETF', 'FUND', 'BOND', 'CASH_EQUIVALENT')),
  exchange_mic text check (exchange_mic is null or exchange_mic ~ '^[A-Z0-9]{4}$'),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  isin text unique check (isin is null or isin ~ '^[A-Z]{2}[A-Z0-9]{9}[0-9]$'),
  created_at timestamptz not null default now(),
  unique (symbol, exchange_mic)
);

create table public.invest_version_instruments (
  version_id uuid not null references public.invest_product_versions(id) on delete restrict,
  instrument_id uuid not null references public.invest_instruments(id) on delete restrict,
  role text not null check (role in ('RESEARCH_REFERENCE', 'CONSTITUENT')),
  target_weight_bps integer check (target_weight_bps between 0 and 10000),
  primary key (version_id, instrument_id),
  check (role = 'CONSTITUENT' or target_weight_bps is null)
);

create table public.invest_eligibility (
  version_id uuid not null references public.invest_product_versions(id) on delete restrict,
  jurisdiction text not null check (jurisdiction in ('US', 'NG', 'LU', 'GB', 'AE', 'SG')),
  status text not null check (status in ('NOT_SUPPORTED', 'UNDER_REVIEW', 'PERMITTED')),
  investor_classes text[] not null default '{}',
  basis text check (basis is null or length(basis) between 1 and 600),
  primary key (version_id, jurisdiction),
  check (status <> 'PERMITTED' or (basis is not null and cardinality(investor_classes) > 0))
);

create table public.invest_disclosures (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.invest_product_versions(id) on delete restrict,
  jurisdiction text check (jurisdiction is null or jurisdiction in ('US', 'NG', 'LU', 'GB', 'AE', 'SG')),
  kind text not null check (kind in ('CONCEPT_STATUS', 'RESEARCH_ONLY', 'NOT_AN_OFFER', 'RISK', 'FEES', 'PROPOSED_TERMS')),
  title text not null check (length(title) between 1 and 120),
  body text not null check (length(body) between 1 and 2000),
  sort_rank integer not null default 100
);

create table public.invest_return_figures (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.invest_product_versions(id) on delete restrict,
  kind text not null check (kind in ('HISTORICAL_PERFORMANCE', 'CURRENT_YIELD', 'HYPOTHETICAL_SCENARIO', 'APPROVED_TARGET')),
  value_bps integer not null check (value_bps between -100000 and 100000),
  period text check (period is null or period in ('1M', '3M', '6M', '1Y', '3Y_ANNUALIZED', '5Y_ANNUALIZED', 'SINCE_INCEPTION_ANNUALIZED', 'TRAILING_12M', 'ANNUAL')),
  as_of date,
  basis text not null check (length(basis) between 1 and 600),
  source text check (source is null or length(source) <= 300),
  methodology_ref text check (methodology_ref is null or length(methodology_ref) <= 300),
  approval_status text not null default 'UNAPPROVED' check (approval_status in ('UNAPPROVED', 'APPROVED')),
  customer_visible boolean not null default false,
  check (kind <> 'HYPOTHETICAL_SCENARIO' or customer_visible = false),
  check (not customer_visible or approval_status = 'APPROVED'),
  check (kind <> 'HISTORICAL_PERFORMANCE' or (period is not null and as_of is not null and source is not null)),
  check (kind <> 'CURRENT_YIELD' or (as_of is not null and source is not null)),
  check (kind <> 'APPROVED_TARGET' or (methodology_ref is not null and period is not null))
);

create table public.invest_catalog_audit_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.invest_products(id) on delete restrict,
  version_id uuid references public.invest_product_versions(id) on delete restrict,
  actor text not null check (length(actor) between 1 and 128),
  action text not null check (action in ('SEEDED', 'DRAFT_CREATED', 'TRANSITIONED')),
  from_status text,
  to_status text,
  rationale text check (rationale is null or length(rationale) <= 1000),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Integrity guards
-- ---------------------------------------------------------------------------

create or replace function public.invest_guard_version_content()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if old.status <> 'DRAFT' and (
       new.product_id is distinct from old.product_id
    or new.version is distinct from old.version
    or new.availability is distinct from old.availability
    or new.name is distinct from old.name
    or new.tagline is distinct from old.tagline
    or new.summary is distinct from old.summary
    or new.body is distinct from old.body
    or new.objective is distinct from old.objective
    or new.risk_level is distinct from old.risk_level
    or new.sort_rank is distinct from old.sort_rank
    or new.authored_by is distinct from old.authored_by
  ) then
    raise exception 'invest catalog version content is immutable once submitted';
  end if;
  return new;
end;
$$;

create trigger invest_product_versions_content_guard
before update on public.invest_product_versions
for each row execute function public.invest_guard_version_content();

create or replace function public.invest_guard_version_children()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_status text;
begin
  select status into v_status from public.invest_product_versions
  where id = coalesce(new.version_id, old.version_id);
  if v_status is distinct from 'DRAFT' then
    raise exception 'invest catalog version details are immutable once submitted';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger invest_product_terms_guard before insert or update or delete on public.invest_product_terms
for each row execute function public.invest_guard_version_children();
create trigger invest_version_sectors_guard before insert or update or delete on public.invest_version_sectors
for each row execute function public.invest_guard_version_children();
create trigger invest_version_instruments_guard before insert or update or delete on public.invest_version_instruments
for each row execute function public.invest_guard_version_children();
create trigger invest_eligibility_guard before insert or update or delete on public.invest_eligibility
for each row execute function public.invest_guard_version_children();
create trigger invest_disclosures_guard before insert or update or delete on public.invest_disclosures
for each row execute function public.invest_guard_version_children();
create trigger invest_return_figures_guard before insert or update or delete on public.invest_return_figures
for each row execute function public.invest_guard_version_children();

create or replace function public.invest_guard_audit_append_only()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception 'invest catalog audit events are append-only';
end;
$$;

create trigger invest_catalog_audit_events_append_only
before update or delete on public.invest_catalog_audit_events
for each row execute function public.invest_guard_audit_append_only();

-- ---------------------------------------------------------------------------
-- Access: no browser access; service role reads; writes only via commands.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'invest_products', 'invest_product_versions', 'invest_product_terms', 'invest_research_sectors',
    'invest_version_sectors', 'invest_instruments', 'invest_version_instruments', 'invest_eligibility',
    'invest_disclosures', 'invest_return_figures', 'invest_catalog_audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all privileges on table public.%I from public, anon, authenticated', t);
    execute format('revoke insert, update, delete, truncate, references, trigger on table public.%I from service_role', t);
    execute format('grant select on table public.%I to service_role', t);
  end loop;
end
$$;

revoke all on function public.invest_guard_version_content() from public, anon, authenticated;
revoke all on function public.invest_guard_version_children() from public, anon, authenticated;
revoke all on function public.invest_guard_audit_append_only() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Read models
-- ---------------------------------------------------------------------------

create or replace function public.invest_version_document(p_version_id uuid, p_include_internal boolean)
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select jsonb_build_object(
    'product_id', p.id,
    'slug', p.slug,
    'family', p.family,
    'version_id', v.id,
    'version', v.version,
    'status', v.status,
    'availability', v.availability,
    'name', v.name,
    'tagline', v.tagline,
    'summary', v.summary,
    'body', v.body,
    'objective', v.objective,
    'risk_level', v.risk_level,
    'sort_rank', v.sort_rank,
    'published_at', v.published_at,
    'terms', (
      select jsonb_build_object(
        'terms_status', t.terms_status, 'currency', t.currency,
        'minimum_minor', t.minimum_minor::text, 'maximum_minor', t.maximum_minor::text,
        'fee_note', t.fee_note, 'liquidity_note', t.liquidity_note)
      from public.invest_product_terms t where t.version_id = v.id
    ),
    'sectors', coalesce((
      select jsonb_agg(jsonb_build_object('slug', s.slug, 'name', s.name) order by s.sort_rank, s.name)
      from public.invest_version_sectors vs join public.invest_research_sectors s on s.slug = vs.sector_slug
      where vs.version_id = v.id
    ), '[]'::jsonb),
    'instruments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'symbol', i.symbol, 'name', i.name, 'instrument_type', i.instrument_type,
        'exchange_mic', i.exchange_mic, 'currency', i.currency, 'role', vi.role,
        'target_weight_bps', vi.target_weight_bps) order by i.symbol)
      from public.invest_version_instruments vi join public.invest_instruments i on i.id = vi.instrument_id
      where vi.version_id = v.id
    ), '[]'::jsonb),
    'eligibility', coalesce((
      select jsonb_agg(jsonb_build_object(
        'jurisdiction', e.jurisdiction, 'status', e.status, 'investor_classes', to_jsonb(e.investor_classes))
        order by e.jurisdiction)
      from public.invest_eligibility e where e.version_id = v.id
    ), '[]'::jsonb),
    'disclosures', coalesce((
      select jsonb_agg(jsonb_build_object(
        'kind', d.kind, 'jurisdiction', d.jurisdiction, 'title', d.title, 'body', d.body)
        order by d.sort_rank, d.title)
      from public.invest_disclosures d where d.version_id = v.id
    ), '[]'::jsonb),
    'return_figures', coalesce((
      select jsonb_agg(jsonb_build_object(
        'kind', r.kind, 'value_bps', r.value_bps, 'period', r.period, 'as_of', r.as_of,
        'basis', r.basis, 'source', r.source, 'methodology_ref', r.methodology_ref,
        'approval_status', r.approval_status, 'customer_visible', r.customer_visible)
        order by r.kind, r.period)
      from public.invest_return_figures r
      where r.version_id = v.id
        and (p_include_internal or (r.customer_visible and r.approval_status = 'APPROVED'))
    ), '[]'::jsonb)
  )
  from public.invest_product_versions v
  join public.invest_products p on p.id = v.product_id
  where v.id = p_version_id
$$;

create or replace function public.invest_published_catalog()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(jsonb_agg(public.invest_version_document(v.id, false) order by v.sort_rank, v.name), '[]'::jsonb)
  from public.invest_product_versions v
  where v.status = 'PUBLISHED'
$$;

create or replace function public.invest_research_sector_list()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('slug', slug, 'name', name, 'description', description)
    order by sort_rank, name), '[]'::jsonb)
  from public.invest_research_sectors
$$;

create or replace function public.invest_catalog_admin()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(jsonb_agg(public.invest_version_document(v.id, true)
    || jsonb_build_object(
      'authored_by', v.authored_by, 'submitted_by', v.submitted_by, 'approved_by', v.approved_by,
      'created_at', v.created_at, 'submitted_at', v.submitted_at, 'approved_at', v.approved_at,
      'retired_at', v.retired_at)
    order by p.slug, v.version), '[]'::jsonb)
  from public.invest_product_versions v
  join public.invest_products p on p.id = v.product_id
$$;

-- ---------------------------------------------------------------------------
-- Governed commands
-- ---------------------------------------------------------------------------

create or replace function public.invest_create_draft_version(
  p_slug text,
  p_family text,
  p_actor text,
  p_content jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_product public.invest_products%rowtype;
  v_version_id uuid;
  v_version integer;
  v_sector text;
  v_disclosure jsonb;
  v_jurisdiction text;
begin
  if p_actor is null or length(p_actor) not between 1 and 128 then
    raise exception 'invalid catalog actor';
  end if;
  if jsonb_typeof(p_content) is distinct from 'object' then
    raise exception 'invalid catalog content';
  end if;

  select * into v_product from public.invest_products where slug = p_slug for update;
  if not found then
    insert into public.invest_products (slug, family) values (p_slug, p_family) returning * into v_product;
  elsif v_product.family <> p_family then
    raise exception 'catalog product family cannot change';
  end if;

  select coalesce(max(version), 0) + 1 into v_version
  from public.invest_product_versions where product_id = v_product.id;

  insert into public.invest_product_versions (
    product_id, version, availability, name, tagline, summary, body, objective, risk_level, sort_rank, authored_by
  ) values (
    v_product.id, v_version, p_content ->> 'availability', p_content ->> 'name', p_content ->> 'tagline',
    p_content ->> 'summary', p_content ->> 'body', p_content ->> 'objective',
    (p_content ->> 'risk_level')::smallint, coalesce((p_content ->> 'sort_rank')::integer, 100), p_actor
  ) returning id into v_version_id;

  if p_content ? 'terms' and jsonb_typeof(p_content -> 'terms') = 'object' then
    insert into public.invest_product_terms (
      version_id, terms_status, currency, minimum_minor, maximum_minor, fee_note, liquidity_note
    ) values (
      v_version_id, 'PROPOSED', p_content -> 'terms' ->> 'currency',
      (p_content -> 'terms' ->> 'minimum_minor')::bigint, (p_content -> 'terms' ->> 'maximum_minor')::bigint,
      p_content -> 'terms' ->> 'fee_note', p_content -> 'terms' ->> 'liquidity_note'
    );
  end if;

  for v_sector in select jsonb_array_elements_text(coalesce(p_content -> 'sectors', '[]'::jsonb)) loop
    insert into public.invest_version_sectors (version_id, sector_slug) values (v_version_id, v_sector);
  end loop;

  for v_disclosure in select jsonb_array_elements(coalesce(p_content -> 'disclosures', '[]'::jsonb)) loop
    insert into public.invest_disclosures (version_id, jurisdiction, kind, title, body, sort_rank)
    values (
      v_version_id, v_disclosure ->> 'jurisdiction', v_disclosure ->> 'kind', v_disclosure ->> 'title',
      v_disclosure ->> 'body', coalesce((v_disclosure ->> 'sort_rank')::integer, 100)
    );
  end loop;

  -- Eligibility starts closed everywhere; opening a jurisdiction is a separate reviewed change.
  foreach v_jurisdiction in array array['US', 'NG', 'LU', 'GB', 'AE', 'SG'] loop
    insert into public.invest_eligibility (version_id, jurisdiction, status) values (v_version_id, v_jurisdiction, 'NOT_SUPPORTED');
  end loop;

  insert into public.invest_catalog_audit_events (product_id, version_id, actor, action, to_status)
  values (v_product.id, v_version_id, p_actor, 'DRAFT_CREATED', 'DRAFT');

  return jsonb_build_object('product_id', v_product.id, 'version_id', v_version_id, 'version', v_version, 'status', 'DRAFT');
end;
$$;

create or replace function public.invest_transition_version(
  p_version_id uuid,
  p_actor text,
  p_to_status text,
  p_rationale text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v public.invest_product_versions%rowtype;
  v_previous uuid;
begin
  if p_actor is null or length(p_actor) not between 1 and 128 then
    raise exception 'invalid catalog actor';
  end if;

  select * into v from public.invest_product_versions where id = p_version_id for update;
  if not found then
    raise exception 'catalog version not found';
  end if;

  if v.status = p_to_status then
    return jsonb_build_object('version_id', v.id, 'status', v.status, 'replayed', true);
  end if;

  if not (
       (v.status = 'DRAFT' and p_to_status in ('IN_REVIEW', 'WITHDRAWN'))
    or (v.status = 'IN_REVIEW' and p_to_status in ('DRAFT', 'APPROVED', 'WITHDRAWN'))
    or (v.status = 'APPROVED' and p_to_status in ('PUBLISHED', 'WITHDRAWN'))
    or (v.status = 'PUBLISHED' and p_to_status = 'WITHDRAWN')
  ) then
    raise exception 'catalog transition % -> % is not permitted', v.status, p_to_status;
  end if;

  if p_to_status in ('DRAFT', 'APPROVED', 'PUBLISHED', 'WITHDRAWN')
     and (p_rationale is null or length(trim(p_rationale)) < 10) then
    raise exception 'catalog transition requires a rationale of at least 10 characters';
  end if;

  if p_to_status = 'APPROVED' and (p_actor = v.authored_by or p_actor = v.submitted_by) then
    raise exception 'catalog approval requires a reviewer other than the author and submitter';
  end if;

  if p_to_status = 'PUBLISHED' then
    if v.availability = 'INVESTABLE' then
      raise exception 'publishing investable products is disabled';
    end if;
    if v.availability = 'CONCEPT' and not exists (
      select 1 from public.invest_disclosures where version_id = v.id and kind = 'CONCEPT_STATUS'
    ) then
      raise exception 'concept publication requires a concept status disclosure';
    end if;
    if v.availability = 'RESEARCH_ONLY' and not exists (
      select 1 from public.invest_disclosures where version_id = v.id and kind = 'RESEARCH_ONLY'
    ) then
      raise exception 'research publication requires a research-only disclosure';
    end if;
    if not exists (select 1 from public.invest_disclosures where version_id = v.id and kind = 'NOT_AN_OFFER') then
      raise exception 'publication requires a not-an-offer disclosure';
    end if;
    if exists (
      select 1 from public.invest_product_terms where version_id = v.id and terms_status = 'PROPOSED'
    ) and not exists (
      select 1 from public.invest_disclosures where version_id = v.id and kind = 'PROPOSED_TERMS'
    ) then
      raise exception 'publishing proposed terms requires a proposed terms disclosure';
    end if;

    select id into v_previous from public.invest_product_versions
    where product_id = v.product_id and status = 'PUBLISHED' for update;
    if v_previous is not null then
      update public.invest_product_versions set status = 'SUPERSEDED', retired_at = now() where id = v_previous;
      insert into public.invest_catalog_audit_events (product_id, version_id, actor, action, from_status, to_status, rationale)
      values (v.product_id, v_previous, p_actor, 'TRANSITIONED', 'PUBLISHED', 'SUPERSEDED', 'Superseded by version ' || v.version);
    end if;
  end if;

  update public.invest_product_versions set
    status = p_to_status,
    submitted_by = case when p_to_status = 'IN_REVIEW' then p_actor when p_to_status = 'DRAFT' then null else submitted_by end,
    submitted_at = case when p_to_status = 'IN_REVIEW' then now() when p_to_status = 'DRAFT' then null else submitted_at end,
    approved_by = case when p_to_status = 'APPROVED' then p_actor else approved_by end,
    approved_at = case when p_to_status = 'APPROVED' then now() else approved_at end,
    published_at = case when p_to_status = 'PUBLISHED' then now() else published_at end,
    retired_at = case when p_to_status = 'WITHDRAWN' then now() else retired_at end
  where id = v.id;

  insert into public.invest_catalog_audit_events (product_id, version_id, actor, action, from_status, to_status, rationale)
  values (v.product_id, v.id, p_actor, 'TRANSITIONED', v.status, p_to_status, nullif(trim(p_rationale), ''));

  return jsonb_build_object('version_id', v.id, 'status', p_to_status, 'replayed', false);
end;
$$;

do $$
declare
  f text;
begin
  foreach f in array array[
    'invest_version_document(uuid, boolean)', 'invest_published_catalog()', 'invest_research_sector_list()',
    'invest_catalog_admin()', 'invest_create_draft_version(text, text, text, jsonb)',
    'invest_transition_version(uuid, text, text, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end
$$;

grant execute on function public.invest_published_catalog() to service_role;
grant execute on function public.invest_research_sector_list() to service_role;
grant execute on function public.invest_catalog_admin() to service_role;
grant execute on function public.invest_create_draft_version(text, text, text, jsonb) to service_role;
grant execute on function public.invest_transition_version(uuid, text, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- Seed: research sectors and concept / research-only catalog content.
-- Versions are seeded IN_REVIEW, authored and submitted by the migration.
-- Nothing is customer-visible until an administrator approves and publishes
-- each version through invest_transition_version.
-- ---------------------------------------------------------------------------

insert into public.invest_research_sectors (slug, name, description, sort_rank) values
  ('artificial-intelligence', 'Artificial intelligence', 'Models, tooling and the companies applying machine learning at scale.', 10),
  ('semiconductors', 'Semiconductors', 'Chip design, fabrication, equipment and the supply chain behind compute.', 20),
  ('cloud-computing', 'Cloud computing', 'Hyperscale platforms, infrastructure services and the economics of shared compute.', 30),
  ('software', 'Software', 'Application and platform software sold to businesses and consumers.', 40),
  ('cybersecurity', 'Cybersecurity', 'Identity, network, endpoint and data protection.', 50),
  ('digital-infrastructure', 'Digital infrastructure', 'Data centres, networks, fibre and the physical layer of the internet.', 60),
  ('energy-power', 'Energy and power', 'Generation, grids, storage and the power demand of compute.', 70),
  ('financial-technology', 'Financial technology', 'Payments, lending, market infrastructure and financial software.', 80),
  ('industrial-automation', 'Industrial automation', 'Robotics, control systems and automated manufacturing.', 90),
  ('healthcare-technology', 'Healthcare technology', 'Medical devices, diagnostics and health data platforms.', 100);

do $$
declare
  item jsonb;
  d jsonb;
  s text;
  j text;
  v_product uuid;
  v_version uuid;
  concept_disclosures constant jsonb := jsonb_build_array(
    jsonb_build_object('kind', 'CONCEPT_STATUS', 'title', 'Concept — not available to invest', 'sort_rank', 10,
      'body', 'This plan is a concept under development. It cannot be invested in. No allocation, instruments, operator, fees, minimums, maximums or eligibility have been approved, and the concept may change or be withdrawn.'),
    jsonb_build_object('kind', 'NOT_AN_OFFER', 'title', 'Not an offer or advice', 'sort_rank', 20,
      'body', 'Nothing here is an offer, solicitation or recommendation to buy or sell any investment, and nothing here is investment, legal or tax advice.'),
    jsonb_build_object('kind', 'RISK', 'title', 'Investment risk', 'sort_rank', 30,
      'body', 'If investing becomes available, the value of investments can fall as well as rise and you may get back less than you invest. No return is promised or implied.'));
  research_disclosures constant jsonb := jsonb_build_array(
    jsonb_build_object('kind', 'RESEARCH_ONLY', 'title', 'Research only', 'sort_rank', 10,
      'body', 'This collection is research context. It is not an investment product, fund or portfolio, and it cannot be bought.'),
    jsonb_build_object('kind', 'NOT_AN_OFFER', 'title', 'Not an offer or advice', 'sort_rank', 20,
      'body', 'Nothing here is an offer, solicitation or recommendation to buy or sell any investment, and nothing here is investment, legal or tax advice.'));
  catalog constant jsonb := jsonb_build_array(
    jsonb_build_object('slug', 'reserve', 'family', 'MANAGED_PLAN', 'availability', 'CONCEPT', 'sort_rank', 10,
      'name', 'Neptlium Reserve',
      'tagline', 'A stability-first plan concept for capital you may need sooner.',
      'summary', 'Neptlium Reserve is a concept for a managed plan that would prioritise capital stability and liquidity. It is not available to invest in.',
      'body', 'Reserve is being designed for capital that should stay steady and accessible. As a concept, it has no approved allocation, instruments, operator, fees or eligibility. Proposed minimum and maximum amounts are shown for planning only and are not final. Any future plan would be offered only with a regulated partner, in permitted jurisdictions, with full disclosures.',
      'objective', 'Prioritise stability and liquidity over growth.',
      'terms', jsonb_build_object('currency', 'USD', 'minimum_minor', 30000, 'maximum_minor', 1000000,
        'fee_note', 'Fees have not been set.', 'liquidity_note', 'Liquidity terms have not been set.'),
      'extra_disclosures', jsonb_build_array(jsonb_build_object('kind', 'PROPOSED_TERMS', 'title', 'Proposed amounts are not final', 'sort_rank', 15,
        'body', 'The proposed minimum of $300 and maximum of $10,000 are planning assumptions. They are not approved terms and may change before any launch.')),
      'sectors', '[]'::jsonb),
    jsonb_build_object('slug', 'income', 'family', 'MANAGED_PLAN', 'availability', 'CONCEPT', 'sort_rank', 20,
      'name', 'Neptlium Income',
      'tagline', 'An income-oriented plan concept.',
      'summary', 'Neptlium Income is a concept for a managed plan that would seek income alongside moderate risk. It is not available to invest in.',
      'body', 'Income is being designed for investors who prioritise regular income. As a concept, it has no approved allocation, instruments, operator, fees, terms or eligibility, and no yield or distribution is promised or implied.',
      'objective', 'Seek income with moderate risk.',
      'sectors', '[]'::jsonb),
    jsonb_build_object('slug', 'balanced', 'family', 'MANAGED_PLAN', 'availability', 'CONCEPT', 'sort_rank', 30,
      'name', 'Neptlium Balanced',
      'tagline', 'A plan concept that balances growth potential and stability.',
      'summary', 'Neptlium Balanced is a concept for a managed plan that would balance growth potential with stability. It is not available to invest in.',
      'body', 'Balanced is being designed for long-term investors who want growth potential with measured volatility. As a concept, it has no approved allocation, instruments, operator, fees, terms or eligibility.',
      'objective', 'Balance growth potential with stability.',
      'sectors', '[]'::jsonb),
    jsonb_build_object('slug', 'growth', 'family', 'MANAGED_PLAN', 'availability', 'CONCEPT', 'sort_rank', 40,
      'name', 'Neptlium Growth',
      'tagline', 'A long-term growth plan concept.',
      'summary', 'Neptlium Growth is a concept for a managed plan that would pursue long-term growth and accept higher volatility. It is not available to invest in.',
      'body', 'Growth is being designed for long-horizon investors prepared for larger swings in value. As a concept, it has no approved allocation, instruments, operator, fees, terms or eligibility.',
      'objective', 'Pursue long-term growth, accepting higher volatility.',
      'sectors', '[]'::jsonb),
    jsonb_build_object('slug', 'ai-compute', 'family', 'THEMATIC_COLLECTION', 'availability', 'RESEARCH_ONLY', 'sort_rank', 110,
      'name', 'AI & Compute',
      'tagline', 'Research on the companies building artificial-intelligence and compute capacity.',
      'summary', 'A research collection on artificial intelligence, the chips that power it and the cloud capacity it runs on.',
      'body', 'AI & Compute follows how artificial-intelligence demand moves through models, accelerators, semiconductor supply and cloud capacity. It is research context to help you understand the theme. It does not hold or recommend any investment.',
      'sectors', '["artificial-intelligence", "semiconductors", "cloud-computing"]'::jsonb),
    jsonb_build_object('slug', 'cloud-software', 'family', 'THEMATIC_COLLECTION', 'availability', 'RESEARCH_ONLY', 'sort_rank', 120,
      'name', 'Cloud & Software',
      'tagline', 'Research on cloud platforms, business software and the security around them.',
      'summary', 'A research collection on cloud platforms, application software and cybersecurity.',
      'body', 'Cloud & Software looks at how businesses buy computing and software, how platforms compete and why security spending follows. It is research context, not an investment product.',
      'sectors', '["cloud-computing", "software", "cybersecurity"]'::jsonb),
    jsonb_build_object('slug', 'digital-infrastructure', 'family', 'THEMATIC_COLLECTION', 'availability', 'RESEARCH_ONLY', 'sort_rank', 130,
      'name', 'Digital Infrastructure',
      'tagline', 'Research on data centres, networks and the physical layer of the internet.',
      'summary', 'A research collection on data centres, connectivity and the hardware and power behind them.',
      'body', 'Digital Infrastructure examines the physical assets that digital services depend on: data centres, fibre and wireless networks, chips and the power to run them. It is research context, not an investment product.',
      'sectors', '["digital-infrastructure", "semiconductors", "energy-power"]'::jsonb),
    jsonb_build_object('slug', 'energy-power', 'family', 'THEMATIC_COLLECTION', 'availability', 'RESEARCH_ONLY', 'sort_rank', 140,
      'name', 'Energy & Power',
      'tagline', 'Research on generation, grids, storage and the power demand of compute.',
      'summary', 'A research collection on energy generation, grid infrastructure, storage and industrial electrification.',
      'body', 'Energy & Power studies how electricity is generated, moved and stored, and how compute and automation are changing demand. It is research context, not an investment product.',
      'sectors', '["energy-power", "industrial-automation"]'::jsonb),
    jsonb_build_object('slug', 'global-innovation', 'family', 'THEMATIC_COLLECTION', 'availability', 'RESEARCH_ONLY', 'sort_rank', 150,
      'name', 'Global Innovation',
      'tagline', 'Research on innovation across financial technology, healthcare and automation.',
      'summary', 'A research collection spanning financial technology, healthcare technology, industrial automation and applied AI.',
      'body', 'Global Innovation brings together research on technology changing established industries worldwide, from payments and lending to diagnostics and factory automation. It is research context, not an investment product.',
      'sectors', '["financial-technology", "healthcare-technology", "industrial-automation", "artificial-intelligence"]'::jsonb)
  );
begin
  for item in select jsonb_array_elements(catalog) loop
    insert into public.invest_products (slug, family) values (item ->> 'slug', item ->> 'family') returning id into v_product;
    insert into public.invest_product_versions (
      product_id, version, availability, name, tagline, summary, body, objective, sort_rank, authored_by
    ) values (
      v_product, 1, item ->> 'availability', item ->> 'name', item ->> 'tagline', item ->> 'summary',
      item ->> 'body', item ->> 'objective', (item ->> 'sort_rank')::integer, 'system:migration'
    ) returning id into v_version;

    if item ? 'terms' then
      insert into public.invest_product_terms (version_id, terms_status, currency, minimum_minor, maximum_minor, fee_note, liquidity_note)
      values (v_version, 'PROPOSED', item -> 'terms' ->> 'currency', (item -> 'terms' ->> 'minimum_minor')::bigint,
        (item -> 'terms' ->> 'maximum_minor')::bigint, item -> 'terms' ->> 'fee_note', item -> 'terms' ->> 'liquidity_note');
    end if;

    for s in select jsonb_array_elements_text(item -> 'sectors') loop
      insert into public.invest_version_sectors (version_id, sector_slug) values (v_version, s);
    end loop;

    for d in select jsonb_array_elements(
      (case when item ->> 'availability' = 'CONCEPT' then concept_disclosures else research_disclosures end)
      || coalesce(item -> 'extra_disclosures', '[]'::jsonb)
    ) loop
      insert into public.invest_disclosures (version_id, kind, title, body, sort_rank)
      values (v_version, d ->> 'kind', d ->> 'title', d ->> 'body', (d ->> 'sort_rank')::integer);
    end loop;

    foreach j in array array['US', 'NG', 'LU', 'GB', 'AE', 'SG'] loop
      insert into public.invest_eligibility (version_id, jurisdiction, status) values (v_version, j, 'NOT_SUPPORTED');
    end loop;

    update public.invest_product_versions
    set status = 'IN_REVIEW', submitted_by = 'system:migration', submitted_at = now()
    where id = v_version;

    insert into public.invest_catalog_audit_events (product_id, version_id, actor, action, to_status, rationale)
    values (v_product, v_version, 'system:migration', 'SEEDED', 'IN_REVIEW', 'Seeded by migration 20261022090000 for owner review.');
  end loop;
end
$$;
