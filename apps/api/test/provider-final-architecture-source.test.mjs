import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('final provider architecture preserves control-plane ownership and replaceability', async () => {
  const architecture = await readFile(new URL('../../../docs/56_PROVIDER_FINAL_ARCHITECTURE.md', import.meta.url), 'utf8');
  assert.match(architecture, /control-plane architecture/);
  assert.match(architecture, /All three sit below Neptlium API\/Platform Core/);
  assert.match(architecture, /replace providers without replacing its financial domain/);
});
