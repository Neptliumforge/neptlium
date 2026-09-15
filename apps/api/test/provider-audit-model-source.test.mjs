import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider audit model is immutable evidence, not ledger truth', async () => {
  const model = await readFile(new URL('../../../docs/50_PROVIDER_AUDIT_MODEL.md', import.meta.url), 'utf8');
  assert.match(model, /safe, immutable audit evidence/);
  assert.match(model, /do not substitute for canonical ledger entries or provider evidence/);
  assert.match(model, /Sensitive credentials.*never belong in audit events/s);
});
