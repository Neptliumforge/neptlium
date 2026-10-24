import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Static contract for the Invest catalog migration (docs/platform/INVEST_CATALOG.md).
// Behaviour is proven against Postgres by supabase/test/invest-catalog/run.sql.

const migration = readFileSync(
  new URL('../migrations/20261022090000_invest_product_catalog.sql', import.meta.url),
  'utf8',
);
const sql = migration.replace(/--.*$/gm, '');
const seed = migration.slice(migration.indexOf('-- Seed:')).replace(/--.*$/gm, '');

const tables = [
  'invest_products',
  'invest_product_versions',
  'invest_product_terms',
  'invest_research_sectors',
  'invest_version_sectors',
  'invest_instruments',
  'invest_version_instruments',
  'invest_eligibility',
  'invest_disclosures',
  'invest_return_figures',
  'invest_catalog_audit_events',
];

test('every catalog table is created, RLS-enabled and closed to browser roles', () => {
  const created = [...sql.matchAll(/create table public\.(\w+)/g)].map((match) => match[1]);
  assert.deepEqual(created.sort(), [...tables].sort());
  for (const table of tables) assert.match(sql, new RegExp(`'${table}'`), table);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all privileges on table public\.%I from public, anon, authenticated/);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger on table public\.%I from service_role/);
  assert.doesNotMatch(sql, /grant [^;]* to [^;]*\b(anon|authenticated|public)\b/i);
  assert.doesNotMatch(sql, /create policy/i);
});

test('governed functions run with a fixed search path and are executable by service_role only', () => {
  const definers = sql.match(/security definer/g) ?? [];
  const pinned = sql.match(/set search_path = pg_catalog, public/g) ?? [];
  assert.ok(definers.length >= 6);
  assert.ok(pinned.length >= definers.length);
  assert.match(sql, /revoke all on function public\.%s from public, anon, authenticated/);
  for (const grant of sql.match(/grant execute on function[^;]*;/g) ?? [])
    assert.match(grant, /to service_role;$/, grant);
  assert.doesNotMatch(sql, /grant execute on function public\.invest_version_document/);
});

test('investable publication is disabled and the review requires two people', () => {
  assert.match(sql, /raise exception 'publishing investable products is disabled'/);
  assert.match(sql, /approval requires a reviewer other than the author and submitter/);
});

test('seed publishes nothing and carries no instruments, prices or returns', () => {
  assert.match(sql, /set status = 'IN_REVIEW', submitted_by = 'system:migration'/);
  assert.doesNotMatch(sql, /'PUBLISHED'\s*,\s*submitted_by/);
  assert.doesNotMatch(sql, /insert into public\.invest_(instruments|version_instruments|return_figures)\b/);
  assert.doesNotMatch(sql, /3\.7|\b370\b|guaranteed/i);
  assert.ok(migration.indexOf('-- Seed:') > 0);
  assert.doesNotMatch(seed, /PERMITTED|INVESTABLE|UNDER_REVIEW/);
  assert.match(seed, /'NOT_SUPPORTED'/);
});

test('hypothetical scenarios can never be customer-visible', () => {
  assert.match(sql, /HYPOTHETICAL_SCENARIO/);
  assert.match(sql, /check \(kind <> 'HYPOTHETICAL_SCENARIO' or customer_visible = false\)/);
  assert.match(sql, /check \(not customer_visible or approval_status = 'APPROVED'\)/);
});

test('the migration does not touch existing tables', () => {
  for (const match of sql.matchAll(/(?:alter|drop|truncate|update|delete from)\s+(?:table\s+)?public\.(\w+)/gi))
    assert.ok(match[1].startsWith('invest_'), match[0]);
});
