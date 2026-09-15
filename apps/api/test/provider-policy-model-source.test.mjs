import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider policy model keeps execution subordinate to Neptlium authorization', async () => {
  const model = await readFile(new URL('../../../docs/37_PROVIDER_POLICY_MODEL.md', import.meta.url), 'utf8');
  assert.match(model, /capability certification never substitutes for Neptlium authorization/i);
  assert.match(model, /Alchemy observation\/intelligence capabilities remain non-executing/);
});
