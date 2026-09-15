import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider engineering principles encode core safety posture', async () => {
  const principles = await readFile(new URL('../../../docs/66_PROVIDER_ENGINEERING_PRINCIPLES.md', import.meta.url), 'utf8');
  assert.match(principles, /Own the domain; rent the rail/);
  assert.match(principles, /Treat provider events as evidence, not accounting/);
  assert.match(principles, /Separate observation from execution/);
});
