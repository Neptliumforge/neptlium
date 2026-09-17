import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8');

test('developer docs label capability state instead of presenting future authority as live', () => {
  for (const label of ['Available', 'Beta', 'Planned', 'Unavailable'])
    assert.match(page, new RegExp(label));
  assert.match(page, /Organization authority'[\s\S]*?'Planned'/);
  assert.match(page, /Agentic capital execution'[\s\S]*?'Unavailable'/);
  assert.match(page, /AI does not create authority/);
});

test('developer docs preserve one shared API boundary and contain no real secrets', () => {
  assert.match(page, /api\.neptlium\.com/);
  assert.match(page, /GET \/v1\/platform\/capabilities/);
  assert.doesNotMatch(page, /treasury-api\.neptlium\.com|pay-api\.neptlium\.com/);
  assert.doesNotMatch(page, /sk_live_|whsec_|service_role|private_key/i);
});

test('developer docs preserve the complete authority and financial-state sequences', () => {
  for (const step of ['Mandate', 'Authority check', 'Execution', 'Reconciliation', 'Record'])
    assert.match(page, new RegExp(step));
  for (const distinction of [
    'Unknown',
    'Provider observation',
    'Canonical ledger',
    'Settled',
    'Reconciled',
  ])
    assert.match(page, new RegExp(distinction));
});
