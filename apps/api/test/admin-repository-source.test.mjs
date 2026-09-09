import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const repositorySource = readFileSync(new URL('../src/admin-repository.ts', import.meta.url), 'utf8');

function implementation(name, nextName) {
  const start = repositorySource.lastIndexOf(`async ${name}`);
  const end = repositorySource.indexOf(`\n  async ${nextName}`, start);
  assert.notEqual(start, -1, `${name} implementation must exist`);
  assert.notEqual(end, -1, `${name} implementation boundary must exist`);
  return repositorySource.slice(start, end);
}

test('legacy admin transaction listings read wallet_transactions rather than profiles', () => {
  const start = repositorySource.indexOf('private async listLegacyTransactions');
  const end = repositorySource.indexOf('\n  async listDeposits', start);
  assert.notEqual(start, -1, 'listLegacyTransactions must exist');
  assert.notEqual(end, -1, 'listLegacyTransactions boundary must exist');

  const source = repositorySource.slice(start, end);
  assert.match(source, /this\.page\(`wallet_transactions\?\$\{filters\.join\('&'\)\}`/);
  assert.doesNotMatch(source, /this\.page\(`profiles\?/);
  assert.match(source, /select=id,profile_id,type,asset,amount,status,reference,counterparty,created_at/);
});

test('canonical financial and reconciliation listings use governed repository tables', () => {
  assert.match(implementation('listCanonicalFundings', 'listWithdrawals'), /funding_intents/);
  assert.match(implementation('listCanonicalWithdrawals', 'approveWithdrawal'), /transfer_executions/);
  assert.match(implementation('listReconciliationRuns', 'listReconciliationItems'), /reconciliation_runs/);
  assert.match(implementation('listReconciliationItems', 'listProviderWebhooks'), /reconciliation_items/);
  assert.match(implementation('listProviderWebhooks', 'audit'), /provider_webhook_inbox/);
});

test('provider webhook administration does not expose provider payloads', () => {
  const source = implementation('listProviderWebhooks', 'audit');
  assert.match(source, /select=id,provider,environment,provider_event_id,signature_verified_at,processing_state,attempts,last_error_code,received_at,processed_at/);
  assert.doesNotMatch(source, /select=[^\n]*payload/);
});
