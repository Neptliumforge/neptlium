import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider doctrine status does not claim merge or production activation', async () => {
  const status = await readFile(new URL('../../../docs/67_PROVIDER_DOCTRINE_STATUS.md', import.meta.url), 'utf8');
  assert.match(status, /prepared for validation\/review/);
  assert.match(status, /not a claim of production provider activation/);
  assert.match(status, /merge-to-main verification remain necessary/);
});
