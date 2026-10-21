-- Database-level test for the Neptlium Invest catalog
-- (docs/platform/INVEST_CATALOG.md). Disposable database only:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/test/invest-catalog/run.sql

\set ON_ERROR_STOP on

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end
$$;
grant usage on schema public to anon, authenticated, service_role;
-- Production default privileges in schema public (verified read-only).
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

\ir ../../migrations/20261022090000_invest_product_catalog.sql

create function pg_temp.expect(label text, actual text, expected text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL %: expected %, got %', label, expected, actual;
  end if;
  raise notice 'PASS %', label;
end;
$$;

-- Runs a statement and returns 'ok' or the error class/message prefix; always rolled back.
create function pg_temp.attempt(p_role text, p_sql text)
returns text language plpgsql as $$
begin
  begin
    perform set_config('role', p_role, true);
    execute p_sql;
    raise exception using errcode = 'P0001', message = 'attempt:ok';
  exception
    when insufficient_privilege then return 'denied';
    when raise_exception then
      if sqlerrm = 'attempt:ok' then return 'ok'; end if;
      return 'error:' || sqlerrm;
    when check_violation then return 'check_violation';
  end;
end;
$$;

create function pg_temp.version_of(p_slug text, p_version integer default 1) returns uuid language sql as $$
  select v.id from public.invest_product_versions v join public.invest_products p on p.id = v.product_id
  where p.slug = p_slug and v.version = p_version
$$;

-- Seed
select pg_temp.expect('seed: nine products in two families',
  (select string_agg(family || ':' || n, ',' order by family) from (select family, count(*) n from public.invest_products group by 1) x),
  'MANAGED_PLAN:4,THEMATIC_COLLECTION:5');
select pg_temp.expect('seed: every version is awaiting review, none published',
  (select string_agg(status || ':' || n, ',') from (select status, count(*) n from public.invest_product_versions group by 1) x),
  'IN_REVIEW:9');
select pg_temp.expect('seed: plans are concepts, collections research-only',
  (select string_agg(distinct p.family || '=' || v.availability, ',') from public.invest_product_versions v join public.invest_products p on p.id = v.product_id),
  'MANAGED_PLAN=CONCEPT,THEMATIC_COLLECTION=RESEARCH_ONLY');
select pg_temp.expect('seed: required research sectors exist',
  (select count(*)::text from public.invest_research_sectors where slug in
    ('cybersecurity', 'semiconductors', 'financial-technology', 'industrial-automation', 'healthcare-technology')),
  '5');
select pg_temp.expect('seed: eligibility closed in all six jurisdictions',
  (select count(*) || ':' || bool_and(status = 'NOT_SUPPORTED') from public.invest_eligibility),
  '54:true');
select pg_temp.expect('seed: reserve has proposed (not approved) USD 300 - 10,000 terms',
  (select terms_status || ':' || currency || ':' || minimum_minor || ':' || maximum_minor
     from public.invest_product_terms where version_id = pg_temp.version_of('reserve')),
  'PROPOSED:USD:30000:1000000');
select pg_temp.expect('seed: no instruments, prices, return figures or holdings',
  (select (select count(*) from public.invest_instruments) + (select count(*) from public.invest_return_figures)
     + (select count(*) from public.invest_version_instruments))::text,
  '0');
select pg_temp.expect('seed: published catalog is empty until approved and published',
  public.invest_published_catalog()::text, '[]');
select pg_temp.expect('seed: one audit event per seeded version',
  (select count(*)::text from public.invest_catalog_audit_events where action = 'SEEDED'), '9');

-- Governance
select pg_temp.expect('approval by the author is refused',
  pg_temp.attempt('postgres', format($q$select public.invest_transition_version(%L, 'system:migration', 'APPROVED', 'Self approval attempt')$q$, pg_temp.version_of('reserve'))),
  'error:catalog approval requires a reviewer other than the author and submitter');
select pg_temp.expect('approval requires a rationale',
  pg_temp.attempt('postgres', format($q$select public.invest_transition_version(%L, 'admin-1', 'APPROVED', 'ok')$q$, pg_temp.version_of('reserve'))),
  'error:catalog transition requires a rationale of at least 10 characters');
select pg_temp.expect('publishing straight from review is refused',
  pg_temp.attempt('postgres', format($q$select public.invest_transition_version(%L, 'admin-1', 'PUBLISHED', 'Skipping approval')$q$, pg_temp.version_of('reserve'))),
  'error:catalog transition IN_REVIEW -> PUBLISHED is not permitted');

select public.invest_transition_version(pg_temp.version_of(slug), 'admin-1', 'APPROVED', 'Reviewed concept copy and disclosures.')
from public.invest_products;
select public.invest_transition_version(pg_temp.version_of(slug), 'admin-1', 'PUBLISHED', 'Publishing reviewed concept catalog.')
from public.invest_products;

select pg_temp.expect('replaying a transition is idempotent',
  (public.invest_transition_version(pg_temp.version_of('reserve'), 'admin-1', 'PUBLISHED', 'Replay of publication.') ->> 'replayed'),
  'true');
select pg_temp.expect('published catalog lists all nine in rank order',
  (select string_agg(e ->> 'slug', ',') from jsonb_array_elements(public.invest_published_catalog()) e),
  'reserve,income,balanced,growth,ai-compute,cloud-software,digital-infrastructure,energy-power,global-innovation');
select pg_temp.expect('published reserve exposes terms as exact strings and disclosures',
  (select (e -> 'terms' ->> 'minimum_minor') || '/' || (e -> 'terms' ->> 'maximum_minor') || '/' || jsonb_array_length(e -> 'disclosures')
     from jsonb_array_elements(public.invest_published_catalog()) e where e ->> 'slug' = 'reserve'),
  '30000/1000000/4');
select pg_temp.expect('collections expose their sectors',
  (select string_agg(s ->> 'slug', ',') from jsonb_array_elements(public.invest_published_catalog()) e,
     jsonb_array_elements(e -> 'sectors') s where e ->> 'slug' = 'cloud-software'),
  'cloud-computing,software,cybersecurity');

-- Immutability
select pg_temp.expect('published content cannot be edited',
  pg_temp.attempt('postgres', format($q$update public.invest_product_versions set name = 'Changed' where id = %L$q$, pg_temp.version_of('reserve'))),
  'error:invest catalog version content is immutable once submitted');
select pg_temp.expect('published terms cannot be edited',
  pg_temp.attempt('postgres', format($q$update public.invest_product_terms set minimum_minor = 1 where version_id = %L$q$, pg_temp.version_of('reserve'))),
  'error:invest catalog version details are immutable once submitted');
select pg_temp.expect('eligibility of a published version cannot be opened in place',
  pg_temp.attempt('postgres', format($q$update public.invest_eligibility set status = 'UNDER_REVIEW' where version_id = %L$q$, pg_temp.version_of('growth'))),
  'error:invest catalog version details are immutable once submitted');

-- New version supersedes the published one
select public.invest_create_draft_version('reserve', 'MANAGED_PLAN', 'admin-2', jsonb_build_object(
  'availability', 'CONCEPT', 'name', 'Neptlium Reserve', 'tagline', 'Revised tagline for review.',
  'summary', 'Revised summary.', 'body', 'Revised body.', 'sort_rank', 10,
  'terms', jsonb_build_object('currency', 'USD', 'minimum_minor', 30000, 'maximum_minor', 1000000),
  'disclosures', jsonb_build_array(
    jsonb_build_object('kind', 'CONCEPT_STATUS', 'title', 'Concept', 'body', 'Not available.'),
    jsonb_build_object('kind', 'NOT_AN_OFFER', 'title', 'Not an offer', 'body', 'Not an offer.'))));
select pg_temp.expect('publishing proposed terms without their disclosure is refused',
  pg_temp.attempt('postgres', format($q$
    select public.invest_transition_version(%1$L, 'admin-2', 'IN_REVIEW', null);
    select public.invest_transition_version(%1$L, 'admin-1', 'APPROVED', 'Reviewed revised copy.');
    select public.invest_transition_version(%1$L, 'admin-1', 'PUBLISHED', 'Publishing revised copy.')$q$, pg_temp.version_of('reserve', 2))),
  'error:publishing proposed terms requires a proposed terms disclosure');
select pg_temp.expect('draft details stay editable before submission',
  pg_temp.attempt('postgres', format($q$insert into public.invest_disclosures (version_id, kind, title, body) values (%L, 'PROPOSED_TERMS', 'Proposed', 'Not final.')$q$, pg_temp.version_of('reserve', 2))),
  'ok');
insert into public.invest_disclosures (version_id, kind, title, body) values (pg_temp.version_of('reserve', 2), 'PROPOSED_TERMS', 'Proposed', 'Not final.');
select public.invest_transition_version(pg_temp.version_of('reserve', 2), 'admin-2', 'IN_REVIEW', null);
select pg_temp.expect('the reviewer must differ from the submitter',
  pg_temp.attempt('postgres', format($q$select public.invest_transition_version(%L, 'admin-2', 'APPROVED', 'Self approval attempt.')$q$, pg_temp.version_of('reserve', 2))),
  'error:catalog approval requires a reviewer other than the author and submitter');
select public.invest_transition_version(pg_temp.version_of('reserve', 2), 'admin-1', 'APPROVED', 'Reviewed revised copy.');
select public.invest_transition_version(pg_temp.version_of('reserve', 2), 'admin-1', 'PUBLISHED', 'Publishing revised copy.');
select pg_temp.expect('a new publication supersedes the previous version',
  (select string_agg(version || ':' || status, ',' order by version) from public.invest_product_versions
     where product_id = (select id from public.invest_products where slug = 'reserve')),
  '1:SUPERSEDED,2:PUBLISHED');

-- Investable publication is disabled
select public.invest_create_draft_version('test-investable', 'MANAGED_PLAN', 'admin-2', jsonb_build_object(
  'availability', 'INVESTABLE', 'name', 'Test investable', 'tagline', 't', 'summary', 's', 'body', 'b',
  'disclosures', jsonb_build_array(jsonb_build_object('kind', 'NOT_AN_OFFER', 'title', 'n', 'body', 'n'))));
select public.invest_transition_version(pg_temp.version_of('test-investable'), 'admin-2', 'IN_REVIEW', null);
select public.invest_transition_version(pg_temp.version_of('test-investable'), 'admin-1', 'APPROVED', 'Approved for test only.');
select pg_temp.expect('publishing an investable product is disabled',
  pg_temp.attempt('postgres', format($q$select public.invest_transition_version(%L, 'admin-1', 'PUBLISHED', 'Attempting investable publish.')$q$, pg_temp.version_of('test-investable'))),
  'error:publishing investable products is disabled');

-- Return figures are typed and gated
select public.invest_create_draft_version('test-figures', 'THEMATIC_COLLECTION', 'admin-2', jsonb_build_object(
  'availability', 'RESEARCH_ONLY', 'name', 'Test figures', 'tagline', 't', 'summary', 's', 'body', 'b',
  'disclosures', jsonb_build_array(
    jsonb_build_object('kind', 'RESEARCH_ONLY', 'title', 'r', 'body', 'r'),
    jsonb_build_object('kind', 'NOT_AN_OFFER', 'title', 'n', 'body', 'n'))));
select pg_temp.expect('a hypothetical scenario can never be customer-visible',
  pg_temp.attempt('postgres', format($q$insert into public.invest_return_figures (version_id, kind, value_bps, basis, approval_status, customer_visible)
    values (%L, 'HYPOTHETICAL_SCENARIO', 370, 'Internal planning scenario only', 'APPROVED', true)$q$, pg_temp.version_of('test-figures'))),
  'check_violation');
select pg_temp.expect('historical performance requires period, as-of date and source',
  pg_temp.attempt('postgres', format($q$insert into public.invest_return_figures (version_id, kind, value_bps, basis)
    values (%L, 'HISTORICAL_PERFORMANCE', 500, 'Missing provenance')$q$, pg_temp.version_of('test-figures'))),
  'check_violation');
select pg_temp.expect('unapproved figures cannot be customer-visible',
  pg_temp.attempt('postgres', format($q$insert into public.invest_return_figures (version_id, kind, value_bps, period, as_of, basis, source, customer_visible)
    values (%L, 'HISTORICAL_PERFORMANCE', 500, '1Y', '2026-09-30', 'Test', 'Test source', true)$q$, pg_temp.version_of('test-figures'))),
  'check_violation');
insert into public.invest_return_figures (version_id, kind, value_bps, basis) values
  (pg_temp.version_of('test-figures'), 'HYPOTHETICAL_SCENARIO', 370, 'Internal planning scenario; never shown to customers.');
insert into public.invest_return_figures (version_id, kind, value_bps, period, as_of, basis, source, approval_status, customer_visible) values
  (pg_temp.version_of('test-figures'), 'HISTORICAL_PERFORMANCE', 512, '1Y', '2026-09-30', 'Test record', 'Test source', 'APPROVED', true);
select public.invest_transition_version(pg_temp.version_of('test-figures'), 'admin-2', 'IN_REVIEW', null);
select public.invest_transition_version(pg_temp.version_of('test-figures'), 'admin-1', 'APPROVED', 'Approved test figures.');
select public.invest_transition_version(pg_temp.version_of('test-figures'), 'admin-1', 'PUBLISHED', 'Publishing test figures.');
select pg_temp.expect('only approved, customer-visible figures reach the published catalog',
  (select string_agg(r ->> 'kind', ',') from jsonb_array_elements(public.invest_published_catalog()) e,
     jsonb_array_elements(e -> 'return_figures') r where e ->> 'slug' = 'test-figures'),
  'HISTORICAL_PERFORMANCE');
select pg_temp.expect('the admin read model includes internal figures, labelled',
  (select string_agg(r ->> 'kind' || ':' || (r ->> 'customer_visible'), ',' order by r ->> 'kind') from jsonb_array_elements(public.invest_catalog_admin()) e,
     jsonb_array_elements(e -> 'return_figures') r where e ->> 'slug' = 'test-figures'),
  'HISTORICAL_PERFORMANCE:true,HYPOTHETICAL_SCENARIO:false');

-- Invalid transitions and audit
select pg_temp.expect('published versions cannot move back to approval',
  pg_temp.attempt('postgres', format($q$select public.invest_transition_version(%L, 'admin-1', 'APPROVED', 'Reverse transition.')$q$, pg_temp.version_of('growth'))),
  'error:catalog transition PUBLISHED -> APPROVED is not permitted');
select public.invest_transition_version(pg_temp.version_of('growth'), 'admin-1', 'WITHDRAWN', 'Withdrawn for test.');
select pg_temp.expect('withdrawn versions leave the published catalog',
  (select count(*)::text from jsonb_array_elements(public.invest_published_catalog()) e where e ->> 'slug' = 'growth'), '0');
select pg_temp.expect('audit events are append-only',
  pg_temp.attempt('postgres', $q$update public.invest_catalog_audit_events set actor = 'tampered'$q$),
  'error:invest catalog audit events are append-only');
select pg_temp.expect('every transition is audited',
  (select count(*)::text from public.invest_catalog_audit_events where action = 'TRANSITIONED' and to_status = 'PUBLISHED'), '11');

-- Access control
select pg_temp.expect('anon cannot read the catalog tables',
  pg_temp.attempt('anon', 'select 1 from public.invest_product_versions'), 'denied');
select pg_temp.expect('authenticated cannot read the catalog tables',
  pg_temp.attempt('authenticated', 'select 1 from public.invest_products'), 'denied');
select pg_temp.expect('authenticated cannot execute catalog reads',
  pg_temp.attempt('authenticated', 'select public.invest_published_catalog()'), 'denied');
select pg_temp.expect('authenticated cannot execute catalog commands',
  pg_temp.attempt('authenticated', format($q$select public.invest_transition_version(%L, 'x', 'WITHDRAWN', 'Browser attempt.')$q$, pg_temp.version_of('income'))), 'denied');
select pg_temp.expect('service role can read the published catalog',
  pg_temp.attempt('service_role', 'select public.invest_published_catalog()'), 'ok');
select pg_temp.expect('service role cannot write catalog tables directly',
  pg_temp.attempt('service_role', $q$insert into public.invest_research_sectors (slug, name, description) values ('x', 'x', 'x')$q$), 'denied');
select pg_temp.expect('service role can run governed commands',
  pg_temp.attempt('service_role', format($q$select public.invest_transition_version(%L, 'admin-1', 'WITHDRAWN', 'Service role withdrawal.')$q$, pg_temp.version_of('income'))), 'ok');
