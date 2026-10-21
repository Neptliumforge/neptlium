import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');

function transpile(dir, source, name, replacements) {
  let output = ts.transpileModule(readFileSync(join(root, source), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  for (const [specifier, file] of Object.entries(replacements)) {
    output = output.replaceAll(`'${specifier}'`, `'${pathToFileURL(join(dir, file))}'`);
  }
  writeFileSync(join(dir, name), output);
  return pathToFileURL(join(dir, name));
}

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
    `export const calls = { create: [], instructions: [] };
    export const behavior = {};
    export async function createFundingIntent(input) { calls.create.push(input); return behavior.create(input); }
    export async function getDepositInstructionsForIntent(id) { calls.instructions.push(id); return behavior.instructions(id); }
    export async function createTransferAlias() { throw new Error('unused'); }`,
  );
  writeFileSync(
    join(dir, 'scope.mjs'),
    `export const session = { result: 'MATCH', checked: [] };
    export async function checkFundingOperationScope(scope) { session.checked.push(scope); return session.result; }`,
  );
  transpile(dir, 'lib/funding/operation.ts', 'operation.mjs', {});
  transpile(dir, 'lib/funding/outcome.ts', 'outcome.mjs', {});
  const actionUrl = transpile(dir, 'app/dashboard/capital-account/actions.ts', 'actions.mjs', {
    'next/cache': 'cache.mjs',
    '@/lib/api/client': 'client.mjs',
    '@/lib/api/financial': 'financial.mjs',
    '@/lib/funding/operation': 'operation.mjs',
    '@/lib/funding/outcome': 'outcome.mjs',
    '@/lib/funding/scope': 'scope.mjs',
  });
  const action = await import(actionUrl);
  const scope = await import(pathToFileURL(join(dir, 'scope.mjs')));
  const financial = await import(pathToFileURL(join(dir, 'financial.mjs')));
  const client = await import(pathToFileURL(join(dir, 'client.mjs')));
  const cache = await import(pathToFileURL(join(dir, 'cache.mjs')));
  return { action, financial, client, cache, scope };
}

const SCOPE = 'c'.repeat(64);
const INTENT_ID = '11111111-1111-4111-8111-111111111111';
const KEY = '22222222-2222-4222-8222-222222222222';
const intent = {
  id: INTENT_ID,
  asset: 'USDC',
  network: 'BASE',
  rail: 'USDC_BASE',
  amount_atomic: null,
  state: 'CREATED',
  environment: 'LIVE',
  created_at: '2026-10-21T00:00:00Z',
  updated_at: '2026-10-21T00:00:00Z',
  replayed: false,
};

test('the operation key is forwarded to the API unchanged', async () => {
  const { action, financial } = await loadAction();
  financial.behavior.create = async () => intent;
  financial.behavior.instructions = async () => ({ capability: 'USDC_BASE', state: 'PENDING' });

  await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);
  await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);

  assert.deepEqual(
    financial.calls.create.map((call) => call.idempotencyKey),
    [KEY, KEY],
  );
});

test('a missing or malformed operation key fails closed without calling the API', async () => {
  const { action, financial } = await loadAction();
  for (const key of [undefined, '', 'not-a-uuid']) {
    const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', key);
    assert.equal(result.ok, false);
    assert.equal(result.failure, 'REJECTED');
  }
  assert.equal(financial.calls.create.length, 0);
});

test('a replayed intent is reported as REPLAYED, not as a new intent', async () => {
  const { action, financial } = await loadAction();
  financial.behavior.create = async () => ({ ...intent, replayed: true });
  financial.behavior.instructions = async () => ({ capability: 'USDC_BASE', state: 'PENDING' });

  const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);

  assert.equal(result.ok, true);
  assert.equal(result.source, 'REPLAYED');
  assert.equal(result.intentId, INTENT_ID);
});

test('a recorded intent is not reported as failed when the instruction lookup fails', async () => {
  const { action, financial, client, cache } = await loadAction();
  financial.behavior.create = async () => intent;
  financial.behavior.instructions = async () => {
    throw new client.ApiClientError(503, 'api_unavailable', 'down');
  };

  const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);

  assert.equal(result.ok, true);
  assert.equal(result.intentId, INTENT_ID);
  assert.equal(result.instructions.status, 'UNAVAILABLE');
  assert.equal(result.instructions.instruction, undefined, 'no instruction may be fabricated');
  assert.doesNotMatch(result.instructions.message, /could not be created/);
  assert.equal(financial.calls.create.length, 1);
  assert.ok(cache.revalidated.includes('/dashboard/activity'));
});

test('instruction lookup failures are classified by cause', async () => {
  const { action, financial, client } = await loadAction();
  financial.behavior.create = async () => intent;
  const cases = [
    [new client.ApiClientError(401, 'session_expired', 'x'), 'SESSION_EXPIRED'],
    [new client.ApiClientError(403, 'forbidden', 'x'), 'FORBIDDEN'],
    [new client.ApiClientError(404, 'not_found', 'x'), 'FORBIDDEN'],
    [new client.ApiClientError(503, 'api_timeout', 'x'), 'UNAVAILABLE'],
    [new client.ApiClientError(500, 'api_error', 'x'), 'UNAVAILABLE'],
    [new Error('socket hang up'), 'UNAVAILABLE'],
  ];
  for (const [error, status] of cases) {
    financial.behavior.instructions = async () => {
      throw error;
    };
    const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);
    assert.equal(result.ok, true, `${status}: intent stays recorded`);
    assert.equal(result.instructions.status, status);
  }
});

test('a pending route is RESOLVED as pending, distinct from a lookup failure', async () => {
  const { action, financial } = await loadAction();
  const pending = {
    funding_intent_id: INTENT_ID,
    capability: 'USDC_BASE',
    state: 'PENDING',
    reason: 'governed_deposit_route_not_assigned',
  };
  financial.behavior.create = async () => intent;
  financial.behavior.instructions = async () => pending;

  const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);

  assert.deepEqual(result.instructions, { status: 'RESOLVED', instruction: pending });
});

test('intent creation failures are classified; ambiguous outcomes are retryable', async () => {
  const { action, financial, client } = await loadAction();
  const cases = [
    [new client.ApiClientError(401, 'session_expired', 'x'), 'SESSION_EXPIRED'],
    [new client.ApiClientError(503, 'provider_capability_unavailable', 'x'), 'REJECTED'],
    [new client.ApiClientError(422, 'validation_failed', 'x'), 'REJECTED'],
    [new client.ApiClientError(409, 'idempotency_conflict', 'x'), 'KEY_CONFLICT'],
    [new client.ApiClientError(503, 'api_timeout', 'x'), 'AMBIGUOUS'],
    [new client.ApiClientError(503, 'api_unavailable', 'x'), 'AMBIGUOUS'],
    [new client.ApiClientError(502, 'api_error', 'x'), 'AMBIGUOUS'],
    [new Error('fetch failed'), 'AMBIGUOUS'],
  ];
  for (const [error, failure] of cases) {
    financial.behavior.create = async () => {
      throw error;
    };
    const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);
    assert.equal(result.ok, false);
    assert.equal(result.failure, failure, error.message);
  }
  assert.equal(financial.calls.instructions.length, 0, 'no lookup without a recorded intent');
});

test('a rejected intent keeps the mapped capability message', async () => {
  const { action, financial, client } = await loadAction();
  financial.behavior.create = async () => {
    throw new client.ApiClientError(503, 'provider_capability_unavailable', 'gate closed');
  };

  const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);

  assert.deepEqual(result, {
    ok: false,
    failure: 'REJECTED',
    error: 'This funding rail is not currently available.',
  });
});

test('instruction recovery reads by intent ID and never creates an intent', async () => {
  const { action, financial } = await loadAction();
  const issued = {
    funding_intent_id: INTENT_ID,
    capability: 'USDC_BASE',
    state: 'ENABLED',
    deposit_address: '0xabc',
  };
  financial.behavior.instructions = async () => issued;

  const result = await action.getDepositInstructionsAction(SCOPE, INTENT_ID);

  assert.deepEqual(result, { status: 'RESOLVED', instruction: issued });
  assert.deepEqual(financial.calls.instructions, [INTENT_ID]);
  assert.equal(financial.calls.create.length, 0);
});

test('instruction recovery rejects a malformed intent ID without calling the API', async () => {
  const { action, financial } = await loadAction();
  const result = await action.getDepositInstructionsAction(SCOPE, '../intents');
  assert.equal(result.status, 'FORBIDDEN');
  assert.equal(financial.calls.instructions.length, 0);
});

test('an operation scope from another principal submits nothing', async () => {
  const { action, financial, scope } = await loadAction();
  financial.behavior.create = async () => intent;
  scope.session.result = 'MISMATCH';

  const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);

  assert.equal(result.ok, false);
  assert.equal(result.failure, 'PRINCIPAL_CHANGED');
  assert.deepEqual(scope.session.checked, [SCOPE]);
  assert.equal(financial.calls.create.length, 0);
});

test('a missing session is SESSION_EXPIRED and submits nothing', async () => {
  const { action, financial, scope } = await loadAction();
  scope.session.result = 'NO_SESSION';

  const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);

  assert.equal(result.failure, 'SESSION_EXPIRED');
  assert.equal(financial.calls.create.length, 0);
});

test('an unverifiable session is a definitive rejection, never ambiguous', async () => {
  const { action, financial, scope } = await loadAction();
  scope.session.result = 'UNVERIFIED';

  const result = await action.createFundingIntentAction(SCOPE, 'USDC_BASE', KEY);

  assert.equal(result.failure, 'REJECTED');
  assert.match(result.error, /No request was sent/);
  assert.equal(financial.calls.create.length, 0);
});

test('recovery under another principal reads nothing', async () => {
  const { action, financial, scope } = await loadAction();
  financial.behavior.instructions = async () => ({ state: 'ENABLED', deposit_address: '0xabc' });
  const cases = [
    ['MISMATCH', 'PRINCIPAL_CHANGED'],
    ['NO_SESSION', 'SESSION_EXPIRED'],
    ['UNVERIFIED', 'UNAVAILABLE'],
  ];
  for (const [check, status] of cases) {
    scope.session.result = check;
    const result = await action.getDepositInstructionsAction(SCOPE, INTENT_ID);
    assert.equal(result.status, status);
    assert.equal(result.instruction, undefined);
  }
  assert.equal(financial.calls.instructions.length, 0);
});

async function loadScope(user) {
  const dir = mkdtempSync(join(tmpdir(), 'funding-scope-'));
  writeFileSync(join(dir, 'server-only.mjs'), '');
  writeFileSync(
    join(dir, 'session.mjs'),
    `export const state = { user: ${JSON.stringify(user)}, fail: false };
    export async function getSessionUser() { if (state.fail) throw new Error('auth down'); return state.user; }`,
  );
  transpile(dir, 'lib/funding/operation.ts', 'operation.mjs', {});
  const url = transpile(dir, 'lib/funding/scope.ts', 'scope.mjs', {
    'server-only': 'server-only.mjs',
    '@/lib/auth/session': 'session.mjs',
    './operation': 'operation.mjs',
  });
  return {
    scope: await import(url),
    session: await import(pathToFileURL(join(dir, 'session.mjs'))),
  };
}

test('operation scopes are opaque, per principal, and checked against the live session', async () => {
  const { scope, session } = await loadScope({ id: 'principal-a', email: null });
  const a = scope.fundingOperationScope('principal-a');
  const b = scope.fundingOperationScope('principal-b');

  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, b);
  assert.ok(!a.includes('principal-a'), 'the raw principal ID is not stored in the browser');
  assert.equal(await scope.checkFundingOperationScope(a), 'MATCH');
  assert.equal(await scope.checkFundingOperationScope(b), 'MISMATCH');
  assert.equal(await scope.checkFundingOperationScope('principal-a'), 'MISMATCH');
  assert.equal(await scope.checkFundingOperationScope(undefined), 'MISMATCH');
  session.state.user = null;
  assert.equal(await scope.checkFundingOperationScope(a), 'NO_SESSION');
  session.state.fail = true;
  assert.equal(await scope.checkFundingOperationScope(a), 'UNVERIFIED');
});
