import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider review guide requires overlap and financial-boundary review', async () => {
  const guide = await readFile(new URL('../../../docs/47_PROVIDER_PR_REVIEW_GUIDE.md', import.meta.url), 'utf8');
  assert.match(guide, /overlapping Platform Core\/Treasury\/provider PR/);
  assert.match(guide, /provider evidence and submission outcomes non-canonical until reconciliation/);
  assert.match(guide, /Never approve a provider change.*weakening financial truth or execution gates/s);
});
