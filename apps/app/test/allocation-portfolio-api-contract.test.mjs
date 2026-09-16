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

test('Portfolio intelligence consumes governed allocation state through the authenticated bootstrap', () => {
  const bootstrap = read('lib/product/bootstrap.ts');
  const page = read('app/dashboard/portfolio/page.tsx');
  const experience = read('components/product/OperatingExperience.tsx');

  assert.match(bootstrap, /getAllocationState\(\)/);
  assert.match(bootstrap, /allocation: projection\(allocation\)/);
  assert.match(page, /PortfolioExperience/);
  assert.match(experience, /snapshot\.allocation\.state === 'READY'/);
  for (const stage of ['MODEL', 'REVIEW', 'APPROVE', 'RESERVE', 'EXECUTE', 'RECONCILE']) {
    assert.match(experience, new RegExp(`'${stage}'`));
  }
  assert.doesNotMatch(
    page,
    /createAllocationPolicy|updateAllocationPolicy|authorizeAllocationPolicy|createAllocationModel|createAllocationPlan/,
  );
});

test('Portfolio financial truth is sourced once and valuation remains unavailable without evidence', () => {
  const bootstrap = read('lib/product/bootstrap.ts');
  const experience = read('components/product/OperatingExperience.tsx');

  assert.match(bootstrap, /getCanonicalBalances\(\)/);
  assert.match(bootstrap, /getPortfolioState\(\)/);
  assert.match(bootstrap, /canonical_balances_unavailable/);
  assert.match(experience, /Portfolio valuation is not available yet/);
  assert.match(experience, /Unknown allocation is not rendered as zero/);
  assert.match(experience, /Investment positions are not available/);
  assert.doesNotMatch(experience, /mock|illustrative|sample holding|fake valuation/i);
});
