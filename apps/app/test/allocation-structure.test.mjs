import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');

test('Allocation customer surface is API-owned and contains no provider SDK authority', () => {
  const page = read('app/dashboard/allocations/page.tsx');
  const workspace = read('app/dashboard/allocations/AllocationWorkspace.tsx');
  const actions = read('app/dashboard/allocations/actions.ts');
  const api = read('lib/api/allocation.ts');
  const combined = `${page}\n${workspace}\n${actions}\n${api}`;
  assert.equal(api.includes('/v1/allocation/workspace'), true);
  assert.equal(actions.includes('authorizeAllocationPlan'), true);
  assert.equal(workspace.includes('Execution unavailable'), true);
  for (const provider of ['@coinbase', 'fireblocks-sdk', '@fireblocks', '@circle-fin', 'stripe', 'alchemy-sdk']) {
    assert.equal(combined.toLowerCase().includes(provider.toLowerCase()), false, `Allocation customer code imports or names provider SDK ${provider}`);
  }
  assert.equal(/\.from\s*\(|\.rpc\s*\(/.test(combined), false, 'Allocation customer code must not access Supabase data directly');
});

test('Allocation UI never renders fabricated unknown-value money placeholders', () => {
  const workspace = read('app/dashboard/allocations/AllocationWorkspace.tsx');
  for (const forbidden of ['$—', '$-', '-- USD', '0.00 USD']) assert.equal(workspace.includes(forbidden), false);
  assert.equal(workspace.includes('Valuation required'), true);
  assert.equal(workspace.includes('No canonical positions yet'), true);
});

test('Allocation review language separates authorization from execution', () => {
  const workspace = read('app/dashboard/allocations/AllocationWorkspace.tsx');
  assert.equal(workspace.includes('Authorize plan'), true);
  assert.equal(workspace.includes('Capital movement will remain unavailable'), true);
  for (const forbidden of ['Invest now', 'Auto rebalance', '>Buy<', '>Sell<', 'Optimize portfolio']) assert.equal(workspace.includes(forbidden), false);
});
