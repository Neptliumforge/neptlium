import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider release note does not claim live financial activation', async () => {
  const note = await readFile(new URL('../../../docs/64_PROVIDER_RELEASE_NOTE.md', import.meta.url), 'utf8');
  assert.match(note, /does not activate live financial execution/);
  assert.match(note, /explicit certification and operational gates/);
});
