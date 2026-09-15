import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider validation plan requires real checks and separates live certification', async () => {
  const plan = await readFile(new URL('../../../docs/58_PROVIDER_VALIDATION_PLAN.md', import.meta.url), 'utf8');
  assert.match(plan, /API TypeScript typecheck/);
  assert.match(plan, /Report each executed check as PASS\/FAIL\/BLOCKED\/NOT RUN/);
  assert.match(plan, /does not certify live Circle\/Alchemy\/Stripe production capability/);
});
