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

test('Capital Account server actions consume financial-domain commands rather than raw routes', () => {
  const actions = read('app/dashboard/capital-account/actions.ts');

  assert.match(actions, /createFundingIntent/);
  assert.match(actions, /getDepositInstructionsForIntent/);
  assert.match(actions, /createTransferAlias/);

  assert.doesNotMatch(actions, /apiRequest/);
  assert.doesNotMatch(actions, /\/v1\//);
  assert.doesNotMatch(actions, /circle|alchemy|stripe|supabase/i);
});

test('personal Capital distinguishes empty capability state from retrieval failure', () => {
  const bootstrap = read('lib/product/bootstrap.ts');
  const experience = read('components/product/OperatingExperience.tsx');

  assert.match(bootstrap, /funding_capability_unavailable/);
  assert.match(bootstrap, /transfer_capability_unavailable/);
  assert.match(experience, /snapshot\.fundingCapabilities\.state !== 'READY'/);
  assert.match(experience, /Funding capability unavailable/);
  assert.match(experience, /transferCapabilitiesAvailable/);
  assert.match(experience, /Outbound capability unavailable/);
  assert.match(experience, /authoritative capability response contains no funding routes/i);
  assert.doesNotMatch(experience, /fundingCapabilities\.state !== 'READY' \? \[\]/);
});

test('withdrawal submission remains inert until governed reservation authority exists', () => {
  const capitalAccount = read('app/dashboard/capital-account/CapitalAccountView.tsx');

  assert.match(capitalAccount, /productStateFromCapability/);
  assert.match(capitalAccount, /No execution action is exposed here/);
  assert.match(capitalAccount, /Reviewing a movement does not reserve or move capital/);
  assert.doesNotMatch(capitalAccount, /<Button[^>]*>\s*Request movement\s*<\/Button>/);
});
