import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider architecture manifest reinforces the Neptlium control plane', async () => {
  const manifest = await readFile(new URL('../../../docs/70_PROVIDER_ARCHITECTURE_MANIFEST.md', import.meta.url), 'utf8');
  assert.match(manifest, /Neptlium provides the control plane/);
  assert.match(manifest, /provider-neutral domain ownership/);
  assert.match(manifest, /reject the shortcut/);
});
