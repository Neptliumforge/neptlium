import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');
const page = read('app/dashboard/allocations/page.tsx');
const workspace = read('app/dashboard/allocations/AllocationWorkspace.tsx');
const components = read('components/product/AllocationIntelligence.tsx');
const surface = `${page}\n${workspace}\n${components}`;

test('Allocation Intelligence preserves the authoritative server-side workspace boundary', () => {
  assert.match(page, /requireProvisionedUser/);
  assert.match(page, /getAllocationWorkspace/);
  assert.doesNotMatch(surface, /supabase|createClient|\.from\s*\(|\.rpc\s*\(/i);
  assert.doesNotMatch(surface, /api\.stripe|alchemy-sdk|fireblocks|coinbase/i);
});

test('Allocation Intelligence presents the required institutional architecture', () => {
  for (const component of [
    'AllocationHeader',
    'AllocationLifecycle',
    'ObservedCapital',
    'PolicyFramework',
    'DecisionIntelligence',
    'ModeledReview',
    'AllocationContext',
  ]) {
    assert.match(workspace, new RegExp(component), `missing ${component}`);
  }
  assert.match(components, /Allocation Intelligence/);
  assert.match(
    components,
    /Understand capital structure, policy alignment, and decision readiness\./,
  );
  assert.match(components, /Allocation decisions remain separate from capital execution\./);
});

test('allocation lifecycle remains truthful and execution remains unavailable', () => {
  for (const state of ['Observed', 'Modeled', 'Authorized', 'Executed', 'Reconciled']) {
    assert.match(surface, new RegExp(state), `missing lifecycle state ${state}`);
  }
  assert.match(workspace, /Execution unavailable/);
  assert.doesNotMatch(
    surface,
    /Execution available|Execute allocation|Rebalance now|Auto rebalance|>Buy<|>Sell<|>Trade</,
  );
});

test('unknown allocation states use explicit non-financial placeholders', () => {
  for (const state of [
    'No positions available',
    'Policy has not been established',
    'Drift analysis not established',
    'No modeled allocation plan yet',
    'No allocation decisions recorded',
  ]) {
    assert.match(surface, new RegExp(state), `missing placeholder ${state}`);
  }
  for (const fabricated of ['$0 allocation', 'Perfect allocation', 'No risk', 'Rebalance ready']) {
    assert.doesNotMatch(surface, new RegExp(fabricated.replace('$', '\\$'), 'i'));
  }
});

test('policy and modeled decisions preserve decision-versus-execution boundaries', () => {
  assert.match(workspace, /saveAllocationPolicyAction/);
  assert.match(workspace, /authorizeAllocationPolicyAction/);
  assert.match(workspace, /reviewRebalanceAction/);
  assert.match(workspace, /authorizeAllocationPlanAction/);
  assert.match(workspace, /Authorization records an approved decision/);
  assert.match(workspace, /It does not move capital/);
});
