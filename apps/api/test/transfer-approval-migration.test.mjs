import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const pendingState = readFileSync(resolve(repoRoot, 'supabase/migrations/20260817134000_add_transfer_approval_states.sql'), 'utf8');
const approvedState = readFileSync(resolve(repoRoot, 'supabase/migrations/20260817134100_add_transfer_approved_state.sql'), 'utf8');
const lifecycle = readFileSync(resolve(repoRoot, 'supabase/migrations/20260817134500_governed_transfer_approval_lifecycle.sql'), 'utf8');

test('transfer enum gains durable pending approval and approved states in separate forward migrations', () => {
  assert.match(pendingState, /add value if not exists 'pending_approval'/i);
  assert.match(approvedState, /add value if not exists 'approved'/i);
  assert.doesNotMatch(`${pendingState}\n${approvedState}`, /drop|rename value/i);
});

test('reservation precedes the approval workflow and legacy authorized rows only converge through reservation', () => {
  assert.match(lifecycle, /v_transfer\.state not in \('requested','authorized'\)/i);
  assert.match(lifecycle, /set state = 'reserved'/i);
  assert.match(lifecycle, /mark_transfer_pending_approval/i);
  assert.match(lifecycle, /v_transfer\.state <> 'reserved'/i);
  assert.match(lifecycle, /set state = 'pending_approval'/i);
});

test('approval is persisted, super-admin governed, idempotent and does not submit', () => {
  const approval = lifecycle.match(/create or replace function public\.approve_transfer_execution[\s\S]*?\n\$\$;/i)?.[0] ?? '';
  assert.match(approval, /super_admin/i);
  assert.match(approval, /idempotency_key/i);
  assert.match(approval, /active reservation required for approval/i);
  assert.match(approval, /state <> 'pending_approval'/i);
  assert.match(approval, /set state = 'approved'/i);
  assert.doesNotMatch(approval, /set state = 'submitted'/i);
  assert.doesNotMatch(approval, /provider_references/i);
});

test('provider submission requires the explicit approved state', () => {
  const submission = lifecycle.match(/create or replace function public\.mark_transfer_submitted[\s\S]*?\n\$\$;/i)?.[0] ?? '';
  assert.match(submission, /state <> 'approved'/i);
  assert.match(submission, /active reservation required before provider submission/i);
  assert.match(submission, /matching execution-provider reference required/i);
  assert.match(submission, /set state = 'submitted'/i);
});

test('settlement remains evidence-gated and reconciliation remains a separate state', () => {
  const settlement = lifecycle.match(/create or replace function public\.mark_transfer_provider_settled[\s\S]*?\n\$\$;/i)?.[0] ?? '';
  const reconciliation = lifecycle.match(/create or replace function public\.mark_transfer_reconciled[\s\S]*?\n\$\$;/i)?.[0] ?? '';
  assert.match(settlement, /settlement_evidence/i);
  assert.match(settlement, /matching provider settlement evidence required/i);
  assert.match(settlement, /set state = 'settled'/i);
  assert.match(reconciliation, /v_transfer\.state <> 'settled'/i);
  assert.match(reconciliation, /matched reconciliation evidence required/i);
  assert.match(reconciliation, /set state = 'reconciled'/i);
});

test('transfer lifecycle history is append-only and browser roles receive no authority', () => {
  assert.match(lifecycle, /create table public\.transfer_execution_events/i);
  assert.match(lifecycle, /before update or delete on public\.transfer_execution_events/i);
  assert.match(lifecycle, /enable row level security/i);
  assert.match(lifecycle, /revoke all on public\.transfer_execution_events from public, anon, authenticated, service_role/i);
  assert.match(lifecycle, /grant execute on function public\.approve_transfer_execution[\s\S]*to service_role/i);
  assert.match(lifecycle, /revoke update, delete on public\.transfer_executions from service_role/i);
});
