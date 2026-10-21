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

// Simulates the API's owner-scoped idempotency: a key replays its recorded
// intent, even when the response to the first attempt was lost in transit.
function fakeApi() {
  const intents = new Map();
  const api = {
    created: 0,
    createCalls: [],
    recoverCalls: [],
    loseNextResponse: false,
    lookup: async () => ENABLED,
    async create(capability, key, amountAtomic) {
      api.createCalls.push({ capability, key, amountAtomic });
      let source = 'REPLAYED';
      if (!intents.has(key)) {
        api.created += 1;
        intents.set(key, `00000000-0000-4000-8000-${String(api.created).padStart(12, '0')}`);
        source = 'CREATED';
      }
      if (api.loseNextResponse) {
        api.loseNextResponse = false;
        throw new TypeError('Failed to fetch');
      }
      return { ok: true, intentId: intents.get(key), source, instructions: await api.lookup() };
    },
    async recover(id) {
      api.recoverCalls.push(id);
      return api.lookup(id);
    },
  };
  return api;
}

function harness(request, operation, api, storage = new Map()) {
  let minted = 0;
  const mem = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, v),
  };
  // A fresh in-memory cache per harness models a page reload over the same
  // session storage.
  let cache = null;
  return {
    storage,
    deps: {
      load: () => (cache ??= operation.readOperationStore(mem)),
      save: (store) => {
        cache = store;
        operation.writeOperationStore(mem, store);
      },
      mintKey: () => {
        minted += 1;
        return `aaaaaaaa-aaaa-4aaa-8aaa-${String(minted).padStart(12, '0')}`;
      },
      create: (...args) => api.create(...args),
      recover: (id) => api.recover(id),
    },
  };
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

  const after = harness(request, operation, api, before.storage);
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

test('a forbidden recovery forgets the stored intent', async () => {
  const { request, operation } = await loadModules();
  const api = fakeApi();
  const { deps } = harness(request, operation, api);
  await request.requestDepositInstructions(deps, 'USDC_BASE');

  api.lookup = async () => ({ status: 'FORBIDDEN', message: 'no' });
  const result = await request.requestDepositInstructions(deps, 'USDC_BASE');

  assert.equal(result.instructions.status, 'FORBIDDEN');
  assert.equal(operation.findOperation(deps.load(), 'USDC_BASE'), null);
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
  api.create = async (capability, key) => {
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

test('stored operations are validated and storage failures do not throw', async () => {
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
  const throwing = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  };
  assert.deepEqual(operation.readOperationStore(throwing), {});
  assert.doesNotThrow(() => operation.writeOperationStore(throwing, {}));
});
