import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');

// Load the server action with its API transport replaced by in-memory stubs so
// the action's own state handling is exercised without network or session.
async function loadAction() {
  const dir = mkdtempSync(join(tmpdir(), 'funding-action-'));
  writeFileSync(
    join(dir, 'cache.mjs'),
    'export const revalidated = []; export function revalidatePath(p) { revalidated.push(p); }',
  );
  writeFileSync(
    join(dir, 'client.mjs'),
    `export class ApiClientError extends Error {
    constructor(status, code, message) { super(message); this.status = status; this.code = code; }
  }`,
  );
  writeFileSync(
    join(dir, 'financial.mjs'),
    `export const calls = { create: 0, instructions: 0 };
    export const behavior = {};
    export async function createFundingIntent(input) { calls.create += 1; return behavior.create(input); }
    export async function getDepositInstructionsForIntent(id) { calls.instructions += 1; return behavior.instructions(id); }
    export async function createTransferAlias() { throw new Error('unused'); }`,
  );
  const source = readFileSync(join(root, 'app/dashboard/capital-account/actions.ts'), 'utf8');
  const output = ts
    .transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    })
    .outputText.replace("'next/cache'", `'${pathToFileURL(join(dir, 'cache.mjs'))}'`)
    .replace("'@/lib/api/client'", `'${pathToFileURL(join(dir, 'client.mjs'))}'`)
    .replace("'@/lib/api/financial'", `'${pathToFileURL(join(dir, 'financial.mjs'))}'`);
  writeFileSync(join(dir, 'actions.mjs'), output);
  const action = await import(pathToFileURL(join(dir, 'actions.mjs')));
  const financial = await import(pathToFileURL(join(dir, 'financial.mjs')));
  const client = await import(pathToFileURL(join(dir, 'client.mjs')));
  const cache = await import(pathToFileURL(join(dir, 'cache.mjs')));
  return { action, financial, client, cache };
}

const intent = {
  id: 'fi_123',
  asset: 'USDC',
  network: 'BASE',
  rail: 'USDC_BASE',
  amount_atomic: null,
  state: 'CREATED',
  environment: 'LIVE',
  created_at: '2026-10-21T00:00:00Z',
  updated_at: '2026-10-21T00:00:00Z',
};

test('a recorded intent is not reported as failed when the instruction lookup fails', async () => {
  const { action, financial, cache } = await loadAction();
  financial.behavior.create = async () => intent;
  financial.behavior.instructions = async () => {
    throw new Error('api_unavailable');
  };

  const result = await action.createFundingIntentAction('USDC_BASE');

  assert.equal(result.ok, true);
  assert.equal(result.intent.id, 'fi_123');
  assert.equal(result.instructions.state, 'PENDING');
  assert.equal(result.instructions.funding_intent_id, 'fi_123');
  assert.equal(result.instructions.deposit_address, undefined, 'no address may be fabricated');
  assert.equal(financial.calls.create, 1);
  assert.ok(cache.revalidated.includes('/dashboard/activity'));
});

test('a rejected intent still fails closed with a mapped message and issues no lookup', async () => {
  const { action, financial, client } = await loadAction();
  financial.behavior.create = async () => {
    throw new client.ApiClientError(503, 'provider_capability_unavailable', 'gate closed');
  };

  const result = await action.createFundingIntentAction('USDC_BASE');

  assert.deepEqual(result, { ok: false, error: 'This funding rail is not currently available.' });
  assert.equal(financial.calls.instructions, 0);
});

test('issued instructions pass through unchanged', async () => {
  const { action, financial } = await loadAction();
  const issued = {
    funding_intent_id: 'fi_123',
    capability: 'USDC_BASE',
    state: 'ENABLED',
    deposit_address: '0xabc',
  };
  financial.behavior.create = async () => intent;
  financial.behavior.instructions = async () => issued;

  const result = await action.createFundingIntentAction('USDC_BASE');

  assert.equal(result.ok, true);
  assert.deepEqual(result.instructions, issued);
});
