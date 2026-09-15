import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('architecture decision freezes provider roles without claiming migration completion', async () => {
  const record = await readFile(new URL('../../../docs/25_PROVIDER_DECISION_RECORD.md', import.meta.url), 'utf8');
  assert.match(record, /Circle for supported stablecoin\/digital-money/);
  assert.match(record, /Alchemy for multi-chain blockchain connectivity\/observation\/intelligence/);
  assert.match(record, /Stripe for supported fiat\/payment\/billing/);
  assert.match(record, /Base-specific legacy Alchemy RPC validation path/);
});
