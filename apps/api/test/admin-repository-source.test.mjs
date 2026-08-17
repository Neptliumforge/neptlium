import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const repositorySource = readFileSync(new URL('../src/admin-repository.ts', import.meta.url), 'utf8');

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
