import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('Capital Account and Treasury consume canonical financial API contracts', () => {
  const financial = read('lib/api/financial.ts');

  assert.match(financial, /\/v1\/capital-account\/balances/);
  assert.match(financial, /NEPTLIUM_CANONICAL_LEDGER/);
  assert.match(financial, /\/v1\/funding\/capabilities/);
  assert.match(financial, /\/v1\/funding\/intents/);
  assert.match(financial, /\/v1\/funding\/activity/);
  assert.match(financial, /\/v1\/capital-account\/deposit-instructions/);
  assert.match(financial, /\/v1\/treasury\/aliases/);
  assert.match(financial, /\/v1\/treasury\/transfer-capabilities/);
  assert.match(financial, /\/v1\/treasury\/transfers/);

  assert.match(financial, /environment: 'LIVE'/);
  assert.doesNotMatch(financial, /BASE-SEPOLIA|testnet/i);
});

test('wallet server actions consume financial-domain commands rather than raw routes', () => {
  const actions = read('app/dashboard/wallet/actions.ts');

  assert.match(actions, /createFundingIntent/);
  assert.match(actions, /getDepositInstructionsForIntent/);
  assert.match(actions, /createTransferAlias/);

  assert.doesNotMatch(actions, /apiRequest/);
  assert.doesNotMatch(actions, /\/v1\//);
  assert.doesNotMatch(actions, /circle|alchemy|stripe|supabase/i);
});

test('Treasury distinguishes execution closed from capability retrieval failure', () => {
  const page = read('app/dashboard/treasury/page.tsx');
  const view = read('app/dashboard/treasury/TreasuryView.tsx');

  assert.match(page, /transferCapabilityError=\{transferCapabilities\.status === 'rejected'\}/);
  assert.match(view, /readonly transferCapabilityError: boolean/);
  assert.match(view, /transferCapabilityError \? 'Unavailable'/);
});

test('withdrawal submission remains inert until governed reservation authority exists', () => {
  const wallet = read('app/dashboard/wallet/WalletView.tsx');

  assert.match(wallet, /Withdrawal submission unavailable/);
  assert.match(wallet, /No request has been sent\./);
  assert.match(wallet, /Reviewing a withdrawal does not reserve or move capital/);
  assert.match(wallet, /<Button className="mt-4" disabled>Submit withdrawal<\/Button>/);
});
