import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider change policy protects canonical financial authority', async () => {
  const policy = await readFile(new URL('../../../docs/35_PROVIDER_CHANGE_POLICY.md', import.meta.url), 'utf8');
  assert.match(policy, /allowing a provider to own canonical balance\/ledger\/reconciliation semantics/);
  assert.match(policy, /allowing browser\/provider-direct privileged execution/);
  assert.match(policy, /enabling a new economic operation without an explicit reconciliation contract/);
});
