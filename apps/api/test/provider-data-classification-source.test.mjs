import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider data classification protects privileged secrets and evidence', async () => {
  const classification = await readFile(new URL('../../../docs/39_PROVIDER_DATA_CLASSIFICATION.md', import.meta.url), 'utf8');
  assert.match(classification, /restricted server-only data/);
  assert.match(classification, /Raw provider webhook payloads/);
  assert.match(classification, /must not expose secrets or imply live provider capability/);
});
