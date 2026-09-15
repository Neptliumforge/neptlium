import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider governance remains a platform concern', async () => {
  const governance = await readFile(new URL('../../../docs/38_PROVIDER_GOVERNANCE.md', import.meta.url), 'utf8');
  assert.match(governance, /Provider architecture is governed as a platform concern/);
  assert.match(governance, /Operational configuration.*does not itself certify a capability/s);
});
