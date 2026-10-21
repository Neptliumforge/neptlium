import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');

async function loadModules() {
  const dir = mkdtempSync(join(tmpdir(), 'funding-operation-'));
  for (const name of ['operation', 'outcome', 'request']) {
    const output = ts
      .transpileModule(readFileSync(join(root, `lib/funding/${name}.ts`), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      })
      .outputText.replaceAll("'./operation'", "'./operation.mjs'")
      .replaceAll("'./outcome'", "'./outcome.mjs'");
    writeFileSync(join(dir, `${name}.mjs`), output);
  }
  return {
    operation: await import(pathToFileURL(join(dir, 'operation.mjs'))),
    request: await import(pathToFileURL(join(dir, 'request.mjs'))),
  };
}

const ENABLED = {
  status: 'RESOLVED',
  instruction: { capability: 'USDC_BASE', state: 'ENABLED', deposit_address: '0xabc' },
};

const SCOPE_A = 'a'.repeat(64);
const SCOPE_B = 'b'.repeat(64);

// Simulates the API's owner-scoped idempotency (unique per owner and key): a
// key replays its recorded intent, even when the response to the first
// attempt was lost in transit. `session` is the principal scope of the
// current authenticated session, which the server action compares against the
// operation's scope before submitting or reading anything.
function fakeApi() {
  const intents = new Map();
  const owners = new Map();
  const api = {
    session: SCOPE_A,
    created: 0,
    createCalls: [],
    recoverCalls: [],
    loseNextResponse: false,
    lookup: async () => ENABLED,
    async create(scope, capability, key, amountAtomic) {
      if (scope !== api.session)
        return { ok: false, failure: 'PRINCIPAL_CHANGED', error: 'principal changed' };
      api.createCalls.push({ scope, capability, key, amountAtomic });
      const slot = `${scope}:${key}`;
      let source = 'REPLAYED';
      if (!intents.has(slot)) {
        api.created += 1;
        const id = `00000000-0000-4000-8000-${String(api.created).padStart(12, '0')}`;
        intents.set(slot, id);
        owners.set(id, scope);
        source = 'CREATED';
      }
      if (api.loseNextResponse) {
        api.loseNextResponse = false;
        throw new TypeError('Failed to fetch');
      }
      return { ok: true, intentId: intents.get(slot), source, instructions: await api.lookup() };
    },
    async recover(scope, id) {
      if (scope !== api.session)
        return { status: 'PRINCIPAL_CHANGED', message: 'principal changed' };
      api.recoverCalls.push(id);
      if (owners.get(id) !== scope) return { status: 'FORBIDDEN', message: 'not yours' };
      return api.lookup(id);
    },
  };
  return api;
}

function memoryStorage(entries = new Map()) {
  return {
    entries,
    failRead: false,
    failWrite: false,
    dropWrites: false,
    getItem(k) {
      if (this.failRead) throw new DOMException('blocked', 'SecurityError');
      return entries.get(k) ?? null;
    },
    setItem(k, v) {
      if (this.failWrite) throw new DOMException('full', 'QuotaExceededError');
      if (!this.dropWrites) entries.set(k, v);
    },
  };
}

// Mirrors useDepositInstructions: an in-memory cache over principal-scoped
// session storage. A fresh harness over the same storage models a reload.
function harness(request, operation, api, { storage = memoryStorage(), scope = SCOPE_A } = {}) {
  let minted = 0;
  let cache = null;
  return {
    storage,
    scope,
    deps: {
      load: () => {
        if (cache) return cache;
        const store = operation.readOperationStore(storage, scope);
        if (store) cache = store;
        return store;
      },
      save: (store) => {
        cache = store;
        return operation.persistOperationStore(storage, scope, store);
      },
      mintKey: () => {
        minted += 1;
        const prefix = scope === SCOPE_A ? 'aaaaaaaa' : 'bbbbbbbb';
        return `${prefix}-aaaa-4aaa-8aaa-${String(minted).padStart(12, '0')}`;
      },
      create: (...args) => api.create(scope, ...args),
      recover: (id) => api.recover(scope, id),
    },
  };
}

function storedOperation(operation, h, capability = 'USDC_BASE') {
  return operation.findOperation(operation.readOperationStore(h.storage, h.scope), capability);
}

test('an ambiguous POST is retried under the same key and records one intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);

  api.loseNextResponse = true;
  const first = await request.requestDepositInstructions(deps, 'USDC_BASE');
  assert.equal(first.ok, false);
  assert.equal(first.failure, 'AMBIGUOUS');

  const retry = await request.requestDepositInstructions(deps, 'USDC_BASE');
  assert.equal(retry.ok, true);
  assert.equal(retry.source, 'REPLAYED');
  assert.equal(api.created, 1, 'exactly one intent was recorded');
  assert.equal(api.createCalls[0].key, api.createCalls[1].key);
});

test('the operation key survives a reload after an ambiguous POST', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const before = harness(request, operation, api);
  api.loseNextResponse = true;
  await request.requestDepositInstructions(before.deps, 'USDC_BASE');

  const after = harness(request, operation, api, { storage: before.storage });
  const result = await request.requestDepositInstructions(after.deps, 'USDC_BASE');

  assert.equal(result.ok, true);
  assert.equal(api.created, 1);
  assert.equal(api.createCalls[0].key, api.createCalls[1].key);
});

test('concurrent repeated submissions share one key and one intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);

  const results = await Promise.all([
    request.requestDepositInstructions(deps, 'USDC_BASE'),
    request.requestDepositInstructions(deps, 'USDC_BASE'),
  ]);

  assert.ok(results.every((result) => result.ok));
  assert.equal(new Set(api.createCalls.map((call) => call.key)).size, 1);
  assert.equal(api.created, 1);
});

test('a known intent recovers instructions by ID and never re-submits', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);

  const first = await request.requestDepositInstructions(deps, 'USDC_BASE');
  const again = await request.requestDepositInstructions(deps, 'USDC_BASE');

  assert.equal(api.createCalls.length, 1);
  assert.deepEqual(api.recoverCalls, [first.intentId]);
  assert.equal(again.source, 'RECOVERED');
  assert.equal(again.intentId, first.intentId);
  assert.deepEqual(again.instructions, ENABLED);
});

test('a failed lookup after creation is retried by recovery, not by a new intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);
  api.lookup = async () => ({ status: 'UNAVAILABLE', message: 'later' });

  const first = await request.requestDepositInstructions(deps, 'USDC_BASE');
  assert.equal(first.ok, true);
  assert.equal(first.instructions.status, 'UNAVAILABLE');

  api.lookup = async () => ENABLED;
  const retry = await request.requestDepositInstructions(deps, 'USDC_BASE');
  assert.equal(retry.source, 'RECOVERED');
  assert.deepEqual(retry.instructions, ENABLED);
  assert.equal(api.createCalls.length, 1);
});

test('a recovery transport failure is UNAVAILABLE and keeps the intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);
  const first = await request.requestDepositInstructions(deps, 'USDC_BASE');

  api.recover = async () => {
    throw new TypeError('Failed to fetch');
  };
  const result = await request.requestDepositInstructions(deps, 'USDC_BASE');

  assert.equal(result.ok, true);
  assert.equal(result.intentId, first.intentId);
  assert.equal(result.instructions.status, 'UNAVAILABLE');
  assert.equal(operation.findOperation(deps.load(), 'USDC_BASE').intentId, first.intentId);
});

test('a forbidden recovery preserves the operation and does not expose its intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const h = harness(request, operation, api);
  const first = await request.requestDepositInstructions(h.deps, 'USDC_BASE');

  api.lookup = async () => ({ status: 'FORBIDDEN', message: 'no' });
  const forbidden = await request.requestDepositInstructions(h.deps, 'USDC_BASE');

  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.failure, 'FORBIDDEN');
  assert.equal(forbidden.intentId, undefined, 'intent ID is not presented');
  assert.equal(forbidden.instructions, undefined, 'no instructions are presented');
  const kept = storedOperation(operation, h);
  assert.equal(kept.intentId, first.intentId);
  assert.equal(kept.key, api.createCalls[0].key);

  // Once readable again, the same intent is recovered; nothing is re-submitted.
  api.lookup = async () => ENABLED;
  const recovered = await request.requestDepositInstructions(h.deps, 'USDC_BASE');
  assert.equal(recovered.source, 'RECOVERED');
  assert.equal(recovered.intentId, first.intentId);
  assert.equal(api.createCalls.length, 1);
});

test('a genuinely new deposit request mints a distinct key and intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);

  const first = await request.requestDepositInstructions(deps, 'USDC_BASE');
  request.startNewDepositRequest(deps, 'USDC_BASE');
  const second = await request.requestDepositInstructions(deps, 'USDC_BASE');

  assert.equal(api.created, 2);
  assert.notEqual(api.createCalls[0].key, api.createCalls[1].key);
  assert.notEqual(first.intentId, second.intentId);
  assert.equal(second.source, 'CREATED');
});

test('different capabilities use different operations', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);

  await request.requestDepositInstructions(deps, 'USDC_BASE');
  await request.requestDepositInstructions(deps, 'BTC_BITCOIN');

  assert.notEqual(api.createCalls[0].key, api.createCalls[1].key);
});

test('a key conflict discards the operation so the next request uses a new key', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);
  const create = api.create;
  api.create = async () => ({ ok: false, failure: 'KEY_CONFLICT', error: 'conflict' });

  const conflicted = await request.requestDepositInstructions(deps, 'USDC_BASE');
  assert.equal(conflicted.failure, 'KEY_CONFLICT');
  const firstKey = operation.findOperation(deps.load(), 'USDC_BASE');
  assert.equal(firstKey, null);

  api.create = create;
  await request.requestDepositInstructions(deps, 'USDC_BASE');
  assert.equal(api.created, 1);
});

test('other failures keep the operation key for a safe retry', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);
  for (const failure of ['AMBIGUOUS', 'SESSION_EXPIRED', 'REJECTED']) {
    api.create = async () => ({ ok: false, failure, error: failure });
    await request.requestDepositInstructions(deps, 'USDC_BASE');
  }
  const keys = new Set();
  api.create = async (scope, capability, key) => {
    keys.add(key);
    return { ok: false, failure: 'AMBIGUOUS', error: '' };
  };
  await request.requestDepositInstructions(deps, 'USDC_BASE');
  await request.requestDepositInstructions(deps, 'USDC_BASE');
  assert.equal(keys.size, 1);
  assert.ok(operation.findOperation(deps.load(), 'USDC_BASE'));
});

test('a browser that cannot mint a key sends nothing', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);
  const result = await request.requestDepositInstructions(
    {
      ...deps,
      mintKey: () => {
        throw new Error('randomUUID unavailable');
      },
    },
    'USDC_BASE',
  );
  assert.equal(result.ok, false);
  assert.equal(api.createCalls.length, 0);
});

test('stored operations are validated; unreadable storage is unknown, not empty', async () => {
  const { operation } = await loadModules();
  assert.deepEqual(operation.parseOperationStore('not json'), {});
  assert.deepEqual(
    operation.parseOperationStore(
      JSON.stringify({
        x: { capability: 'USDC_BASE', amountAtomic: null, key: 'short', intentId: null },
      }),
    ),
    {},
  );
  const storage = memoryStorage();
  storage.failRead = true;
  storage.failWrite = true;
  assert.equal(operation.readOperationStore(storage, SCOPE_A), null);
  assert.equal(operation.readOperationStore(null, SCOPE_A), null);
  assert.equal(operation.persistOperationStore(storage, SCOPE_A, {}), false);
  assert.equal(operation.persistOperationStore(null, SCOPE_A, {}), false);
  assert.throws(() => operation.operationStorageKey('not-a-scope'));
  assert.notEqual(operation.operationStorageKey(SCOPE_A), operation.operationStorageKey(SCOPE_B));
});

test('blocked storage sends no new request', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const h = harness(request, operation, api);
  h.storage.failRead = true;

  const result = await request.requestDepositInstructions(h.deps, 'USDC_BASE');

  assert.equal(result.ok, false);
  assert.equal(result.failure, 'STORAGE_UNAVAILABLE');
  assert.equal(api.createCalls.length, 0);
});

test('a quota failure sends nothing and leaves no unrecoverable key in memory', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const h = harness(request, operation, api);
  h.storage.failWrite = true;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await request.requestDepositInstructions(h.deps, 'USDC_BASE');
    assert.equal(result.failure, 'STORAGE_UNAVAILABLE');
  }
  assert.equal(api.createCalls.length, 0);
  assert.equal(operation.findOperation(h.deps.load(), 'USDC_BASE'), null);

  // Once storage works, the key is persisted before it is first submitted.
  h.storage.failWrite = false;
  const result = await request.requestDepositInstructions(h.deps, 'USDC_BASE');
  assert.equal(result.ok, true);
  assert.equal(api.created, 1);
  assert.equal(storedOperation(operation, h).key, api.createCalls[0].key);
});

test('silently dropped writes are detected and nothing is sent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const h = harness(request, operation, api);
  h.storage.dropWrites = true;

  const result = await request.requestDepositInstructions(h.deps, 'USDC_BASE');

  assert.equal(result.failure, 'STORAGE_UNAVAILABLE');
  assert.equal(api.createCalls.length, 0);
});

test('a transient read failure never overwrites a recorded operation', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const before = harness(request, operation, api);
  api.loseNextResponse = true;
  await request.requestDepositInstructions(before.deps, 'USDC_BASE');
  const recorded = storedOperation(operation, before);

  const reloaded = harness(request, operation, api, { storage: before.storage });
  before.storage.failRead = true;
  const blocked = await request.requestDepositInstructions(reloaded.deps, 'USDC_BASE');
  assert.equal(blocked.failure, 'STORAGE_UNAVAILABLE');
  before.storage.failRead = false;
  assert.deepEqual(storedOperation(operation, before), recorded);

  const retry = await request.requestDepositInstructions(reloaded.deps, 'USDC_BASE');
  assert.equal(retry.source, 'REPLAYED');
  assert.equal(api.created, 1);
});

test('operations are isolated per authenticated principal', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const storage = memoryStorage();
  const a = harness(request, operation, api, { storage, scope: SCOPE_A });
  api.loseNextResponse = true;
  await request.requestDepositInstructions(a.deps, 'USDC_BASE');
  const aOperation = storedOperation(operation, a);

  // Account B signs in in the same tab (fresh page over the same storage).
  api.session = SCOPE_B;
  const b = harness(request, operation, api, { storage, scope: SCOPE_B });
  const bResult = await request.requestDepositInstructions(b.deps, 'USDC_BASE');

  assert.equal(bResult.ok, true);
  assert.equal(bResult.source, 'CREATED');
  const bOperation = storedOperation(operation, b);
  assert.notEqual(bOperation.key, aOperation.key, "B never reuses A's key");
  assert.notEqual(bResult.intentId, aOperation.intentId);
  assert.deepEqual(api.recoverCalls, [], "B never looks up A's intent");
  assert.deepEqual(storedOperation(operation, a), aOperation, "A's operation is untouched");

  // A signs back in and resumes the same request without a duplicate.
  api.session = SCOPE_A;
  const aAgain = harness(request, operation, api, { storage, scope: SCOPE_A });
  const resumed = await request.requestDepositInstructions(aAgain.deps, 'USDC_BASE');
  assert.equal(resumed.source, 'REPLAYED');
  assert.equal(api.createCalls.filter((call) => call.key === aOperation.key).length, 2);
  assert.equal(api.created, 2, 'one intent per account');
});

test('a stale page after an account switch submits and reads nothing', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const a = harness(request, operation, api, { scope: SCOPE_A });
  const first = await request.requestDepositInstructions(a.deps, 'USDC_BASE');

  // Another tab signs in as B; this tab still holds A's page and scope.
  api.session = SCOPE_B;
  const recovery = await request.requestDepositInstructions(a.deps, 'USDC_BASE');
  assert.equal(recovery.ok, false);
  assert.equal(recovery.failure, 'PRINCIPAL_CHANGED');
  assert.equal(recovery.intentId, undefined);
  assert.deepEqual(api.recoverCalls, []);

  request.startNewDepositRequest(a.deps, 'USDC_BASE');
  const submission = await request.requestDepositInstructions(a.deps, 'USDC_BASE');
  assert.equal(submission.failure, 'PRINCIPAL_CHANGED');
  assert.equal(api.createCalls.length, 1, 'nothing submitted under B');
  assert.ok(storedOperation(operation, a), "A's new operation is retained for A");
  assert.notEqual(first.intentId, undefined);
});

test('an expired session resumes the same operation after signing in again', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const h = harness(request, operation, api);
  const create = api.create;
  api.create = async () => ({ ok: false, failure: 'SESSION_EXPIRED', error: 'expired' });

  const expired = await request.requestDepositInstructions(h.deps, 'USDC_BASE');
  assert.equal(expired.failure, 'SESSION_EXPIRED');
  const key = storedOperation(operation, h).key;

  // Same-tab sign-in returns to the deposit page: a fresh page, same storage.
  api.create = create;
  const returned = harness(request, operation, api, { storage: h.storage });
  const result = await request.requestDepositInstructions(returned.deps, 'USDC_BASE');
  assert.equal(result.ok, true);
  assert.equal(api.created, 1);
  assert.equal(api.createCalls[0].key, key);
  const again = await request.requestDepositInstructions(returned.deps, 'USDC_BASE');
  assert.equal(again.source, 'RECOVERED');
  assert.equal(api.created, 1);
});

test('an expired session during recovery keeps the operation and its intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const h = harness(request, operation, api);
  const first = await request.requestDepositInstructions(h.deps, 'USDC_BASE');
  api.lookup = async () => ({ status: 'SESSION_EXPIRED', message: 'expired' });

  const result = await request.requestDepositInstructions(h.deps, 'USDC_BASE');

  assert.equal(result.instructions.status, 'SESSION_EXPIRED');
  assert.equal(storedOperation(operation, h).intentId, first.intentId);
  assert.equal(api.createCalls.length, 1);
});

test('a lost response, reload and repeated clicks still record one intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const before = harness(request, operation, api);
  api.loseNextResponse = true;
  await request.requestDepositInstructions(before.deps, 'USDC_BASE');

  const after = harness(request, operation, api, { storage: before.storage });
  const results = await Promise.all([
    request.requestDepositInstructions(after.deps, 'USDC_BASE'),
    request.requestDepositInstructions(after.deps, 'USDC_BASE'),
    request.requestDepositInstructions(after.deps, 'USDC_BASE'),
  ]);

  assert.ok(results.every((result) => result.ok));
  assert.equal(new Set(results.map((result) => result.intentId)).size, 1);
  assert.equal(new Set(api.createCalls.map((call) => call.key)).size, 1);
  assert.equal(api.created, 1);
});

test('session expiry returns to the deposit page through the validated next contract', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'funding-return-'));
  const outcomeUrl = pathToFileURL(join(dir, 'outcome.mjs'));
  writeFileSync(
    outcomeUrl,
    ts.transpileModule(readFileSync(join(root, 'lib/funding/outcome.ts'), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText,
  );
  const authUrl = pathToFileURL(join(dir, 'auth-utils.mjs'));
  writeFileSync(
    authUrl,
    ts.transpileModule(readFileSync(join(root, 'app/(auth)/auth-utils.ts'), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText,
  );
  const { signInToContinueHref } = await import(outcomeUrl);
  const { safeInternalPath } = await import(authUrl);

  for (const page of ['/dashboard/deposit/crypto', '/dashboard/capital-account']) {
    const href = new URL(signInToContinueHref(page), 'https://app.neptlium.invalid');
    assert.equal(href.pathname, '/auth/sign-in');
    assert.deepEqual([...href.searchParams.keys()], ['next']);
    assert.equal(safeInternalPath(href.searchParams.get('next')), page);
  }

  const flow = readFileSync(
    join(root, 'app/dashboard/deposit/crypto/CryptoDepositFlow.tsx'),
    'utf8',
  );
  const view = readFileSync(
    join(root, 'app/dashboard/capital-account/CapitalAccountView.tsx'),
    'utf8',
  );
  assert.doesNotMatch(flow, /href="\/sign-in"/, 'the legacy entry drops the return destination');
  assert.match(flow, /signInToContinueHref\('\/dashboard\/deposit\/crypto'\)/);
  assert.match(view, /signInToContinueHref\('\/dashboard\/capital-account'\)/);
});
