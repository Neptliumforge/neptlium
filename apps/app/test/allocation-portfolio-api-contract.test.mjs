import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

test('Allocation consumes the governed allocation API domain', () => {
  const client = read('lib/api/allocation.ts');
  const page = read('app/dashboard/allocations/page.tsx');

  assert.match(client, /import 'server-only'/);
  assert.match(client, /\/v1\/allocation\/workspace/);
  assert.match(client, /\/v1\/allocation\/policies/);
  assert.match(client, /\/v1\/allocation\/models/);
  assert.match(client, /\/v1\/allocation\/plans/);
  assert.match(client, /\/v1\/allocation\/drift-decisions/);
  assert.match(page, /getAllocationWorkspace/);

  assert.doesNotMatch(page, /\/v1\//);
  assert.doesNotMatch(page, /supabase|createClient|\.from\(/);
});

test('Allocation mutation identity remains transport-owned', () => {
  const client = read('lib/api/allocation.ts');
  const actions = read('app/dashboard/allocations/actions.ts');

  assert.doesNotMatch(actions, /randomUUID/);
  assert.doesNotMatch(actions, /apiRequest/);
  assert.doesNotMatch(actions, /\/v1\//);
  assert.doesNotMatch(client, /mutationHeaders/);
  assert.doesNotMatch(client, /idempotencyKey/);
});

test('Allocation execution remains explicitly unavailable', () => {
  const client = read('lib/api/allocation.ts');
  const workspace = read('app/dashboard/allocations/AllocationWorkspace.tsx');

  assert.match(client, /executionState: 'UNAVAILABLE'/);
  assert.match(client, /execution: 'UNAVAILABLE'/);
  assert.match(workspace, /Execution unavailable/);
  assert.doesNotMatch(workspace, /Execution available/);
});

test('Portfolio intelligence consumes governed allocation state', () => {
  const page = read('app/dashboard/portfolio/page.tsx');

  assert.match(page, /getAllocationWorkspace/);
  assert.match(page, /allocationPolicy/);
  assert.match(page, /allocationDrift/);
  assert.match(page, /allocationOutsidePolicy/);
  assert.match(page, /allocationReview/);
  assert.match(page, /allocationValuationUnavailable/);

  assert.match(page, /No allocation policy is established/);
  assert.match(page, /cross-asset valuation evidence is unavailable/);
  assert.match(page, /reserve requirement/);

  assert.doesNotMatch(page, /Open Allocation to compare canonical positions with an authorized policy/);
});

test('Portfolio quantities remain canonical and valuation does not become fabricated', () => {
  const page = read('app/dashboard/portfolio/page.tsx');

  assert.match(page, /getCanonicalBalances/);
  assert.match(page, /Canonical ledger/);
  assert.match(page, /cross-asset total remains unavailable without governed valuation evidence/);
  assert.match(page, /Not established without an authoritative market-data and valuation source/);
});
