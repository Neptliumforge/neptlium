import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';

const sourceUrl = new URL('../functions/stripe-webhook/index.ts', import.meta.url);
const source = readFileSync(sourceUrl, 'utf8');
const executableSource = source.replace(/^\s*\/\/.*$/gm, '');

function handler() {
  let callback;
  vm.runInNewContext(source, {
    Deno: {
      serve(fn) {
        callback = fn;
      },
    },
    Response,
    JSON,
  });
  assert.equal(typeof callback, 'function');
  return callback;
}

test('legacy Stripe webhook tombstone always returns 410', async () => {
  const invoke = handler();
  for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    const response = await invoke(new Request('https://example.test', { method }));
    assert.equal(response.status, 410);
    assert.equal((await response.json()).error, 'STRIPE_WEBHOOK_RETIRED');
  }
});

test('legacy Stripe webhook tombstone has no provider or financial authority', () => {
  assert.doesNotMatch(executableSource, /import\s/);
  assert.doesNotMatch(executableSource, /createClient|Stripe|constructEvent|fetch\s*\(/);
  assert.doesNotMatch(executableSource, /Deno\.env|getenv|process\.env/);
  assert.doesNotMatch(
    executableSource,
    /transactions|portfolios|funding_intents|settlement_evidence|ledger_/i,
  );
  assert.doesNotMatch(executableSource, /req\.|request\.|\.json\(|\.text\(/);
});

test('legacy Stripe webhook directory contains one executable source file', () => {
  const files = readdirSync(new URL('../functions/stripe-webhook/', import.meta.url));
  assert.deepEqual(files.sort(), ['index.ts']);
});
