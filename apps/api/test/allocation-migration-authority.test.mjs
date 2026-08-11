import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const foundation = readFileSync(resolve(repoRoot, 'supabase/migrations/20260811073000_allocation_engine_foundation.sql'), 'utf8');
const authority = readFileSync(resolve(repoRoot, 'supabase/migrations/20260811073500_allocation_api_authority_grants.sql'), 'utf8');

test('Allocation persistence enables RLS on every governed table', () => {
  for (const table of [
    'allocation_policies',
    'allocation_policy_versions',
    'allocation_targets',
    'allocation_models',
    'allocation_plans',
    'allocation_plan_movements',
    'allocation_events',
    'allocation_idempotency',
  ]) {
    assert.match(foundation, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
});

test('browser roles receive no direct Allocation persistence authority', () => {
  assert.match(foundation, /revoke all on public\.allocation_policies[\s\S]*from anon, authenticated;/i);
  assert.match(authority, /revoke all on table[\s\S]*from public, anon, authenticated, service_role;/i);
});

test('apps/api service role is read plus governed RPC only', () => {
  assert.match(authority, /grant select on table[\s\S]*allocation_policy_current[\s\S]*allocation_plan_projection[\s\S]*to service_role;/i);
  assert.match(authority, /grant execute on function[\s\S]*allocation_create_policy[\s\S]*allocation_authorize_plan[\s\S]*allocation_record_decision[\s\S]*to service_role;/i);
  assert.doesNotMatch(authority, /grant\s+(insert|update|delete|all)[\s\S]*to service_role/i);
});
