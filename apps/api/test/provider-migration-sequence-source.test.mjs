import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider migration sequence requires overlap reconciliation and validation', async () => {
  const sequence = await readFile(new URL('../../../docs/43_PROVIDER_MIGRATION_SEQUENCE.md', import.meta.url), 'utf8');
  assert.match(sequence, /Reconcile overlapping Treasury provider-orchestration branches/);
  assert.match(sequence, /Do not merge overlapping provider branches merely because each is independently mergeable/);
});
