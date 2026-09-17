import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('Neptlium Treasury protects the authenticated dashboard with a Supabase session but grants no browser financial authority', () => {
  const proxy = read('proxy.ts');
  const dashboard = read('app/dashboard/[[...section]]/page.tsx');
  assert.match(proxy, /refreshSupabaseSession/);
  assert.match(proxy, /\/auth\/sign-in/);
  assert.match(dashboard, /Organization authority unavailable/);
  assert.match(dashboard, /Execution capability/);
  assert.match(dashboard, /No active execution/);
  assert.doesNotMatch(dashboard, /circle\.com|alchemy\.com|fetch\(|service_role|private_key/i);
});

test('Neptlium Treasury preserves institutional navigation and authority boundaries', () => {
  const dashboard = read('app/dashboard/[[...section]]/page.tsx');
  for (const label of [
    'Overview',
    'Treasury',
    'Investments',
    'Allocations',
    'Operations',
    'Authority',
    'Records',
  ])
    assert.match(dashboard, new RegExp(label));
  for (const action of ['Fund', 'Move', 'Allocate', 'Settle', 'Reconcile', 'Govern'])
    assert.match(dashboard, new RegExp(action));
  for (const layer of [
    'Organizations',
    'Members',
    'Roles',
    'Permissions',
    'Approval policies',
    'Mandates',
    'Agents',
  ])
    assert.match(dashboard, new RegExp(layer));
  assert.match(
    dashboard,
    /Authentication identifies a person; it does not grant permission to move capital/,
  );
  assert.match(dashboard, /AI does not create authority/);
  assert.match(dashboard, /Unknown state is never\s+represented as zero/);
});

test('institutional operating state remains explicit and evidence-aware', () => {
  const dashboard = read('app/dashboard/[[...section]]/page.tsx');
  for (const metric of [
    'Capital',
    'Available liquidity',
    'Committed capital',
    'Pending settlement',
  ])
    assert.match(dashboard, new RegExp(metric));
  for (const state of ['Unavailable', 'Disabled', 'Denied, approval required, or authorized'])
    assert.match(dashboard, new RegExp(state));
  assert.match(
    dashboard,
    /provider observation alone will not appear as an authorized, settled or reconciled\s+movement/i,
  );
  assert.doesNotMatch(dashboard, /\$[0-9]|€[0-9]|£[0-9]/);
});

test('Neptlium Treasury native access uses the shared browser client and never exposes privileged credentials', () => {
  const signIn = read('app/auth/sign-in/sign-in-form.tsx');
  const signOut = read('app/auth/sign-out-button.tsx');
  assert.match(signIn, /createSupabaseBrowserClient/);
  assert.match(signIn, /signInWithPassword/);
  assert.match(signOut, /auth\.signOut\(\)/);
  assert.doesNotMatch(`${signIn}\n${signOut}`, /service_role|private_key|entity_secret|api_key/i);
});
