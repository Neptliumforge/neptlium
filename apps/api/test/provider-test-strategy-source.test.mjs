import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider test strategy avoids unsafe live economic testing', async () => {
  const strategy = await readFile(new URL('../../../docs/40_PROVIDER_TEST_STRATEGY.md', import.meta.url), 'utf8');
  assert.match(strategy, /Do not create live charges\/transfers merely to satisfy CI/);
  assert.match(strategy, /provider evidence cannot directly create canonical financial truth/);
  assert.match(strategy, /Production verification is a separately authorized operational gate/);
});
