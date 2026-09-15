import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider observability separates health from financial truth and protects secrets', async () => {
  const standard = await readFile(new URL('../../../docs/23_PROVIDER_OBSERVABILITY_STANDARD.md', import.meta.url), 'utf8');
  assert.match(standard, /Never log API keys/);
  assert.match(standard, /ambiguous submissions/);
  assert.match(standard, /green provider health check is not equivalent to a certified financial capability/);
});
