import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const allocate = read('supabase/functions/allocate-portfolio/index.ts');
const yieldFn = read('supabase/functions/calculate-yield/index.ts');
const migration = read('supabase/migrations/20260913061000_gate05_retire_legacy_financial_authority.sql');

test('legacy portfolio allocator remains an inert 410 tombstone', () => {
  assert.match(allocate, /ALLOCATE_PORTFOLIO_RETIRED/);
  assert.match(allocate, /status:\s*410/);
  assert.doesNotMatch(allocate, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(allocate, /\.from\(/);
  assert.doesNotMatch(allocate, /insert|update|upsert|delete/i);
});

test('legacy synthetic yield function remains an inert 410 tombstone', () => {
  assert.match(yieldFn, /CALCULATE_YIELD_RETIRED/);
  assert.match(yieldFn, /status:\s*410/);
  assert.doesNotMatch(yieldFn, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(yieldFn, /\.from\(/);
  assert.doesNotMatch(yieldFn, /insert|update|upsert|delete/i);
});

test('Gate 05 migration removes browser canonical write policies and synthetic yield cron', () => {
  assert.match(migration, /drop policy if exists "User can create transaction" on public\.transactions/i);
  assert.match(migration, /revoke insert, update, delete on table public\.transactions from anon, authenticated/i);
  assert.match(migration, /drop policy if exists portfolios_update_own on public\.portfolios/i);
  assert.match(migration, /revoke insert, update, delete on table public\.portfolios from anon, authenticated/i);
  assert.match(migration, /jobname\s*=\s*'calculate-yield-daily'/i);
  assert.match(migration, /cron\.unschedule/i);
});
