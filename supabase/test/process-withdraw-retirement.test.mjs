import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../../', import.meta.url);
const source = await readFile(
  new URL('../functions/process-withdraw/index.ts', import.meta.url),
  'utf8',
);

function loadRetiredEndpoint() {
  let handler;
  const effects = [];
  const deny = (name) => () => {
    effects.push(name);
    throw new Error(`Forbidden side effect: ${name}`);
  };
  const context = vm.createContext(
    {
      Response,
      Deno: new Proxy(
        {
          serve(callback) {
            assert.equal(handler, undefined);
            handler = callback;
          },
        },
        {
          get(target, key) {
            if (key === 'serve') return target.serve;
            return deny(`Deno.${String(key)}`)();
          },
        },
      ),
      fetch: deny('fetch'),
      createClient: deny('createClient'),
      setTimeout: deny('setTimeout'),
      setInterval: deny('setInterval'),
      console: new Proxy({}, { get: (_, key) => deny(`console.${String(key)}`) }),
    },
    { codeGeneration: { strings: false, wasm: false } },
  );
  vm.runInContext(source, context, { timeout: 1000 });
  assert.equal(typeof handler, 'function');
  return { handler, effects };
}

async function assertRetired(handler, request) {
  const response = await handler(request);
  assert.equal(response.status, 410);
  assert.equal(response.ok, false);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.deepEqual(await response.json(), {
    error: 'WITHDRAWAL_ENDPOINT_RETIRED',
    message:
      'This withdrawal endpoint is retired. Withdrawals are unavailable through this endpoint.',
  });
}

test('all methods, including preflight, fail closed without financial side effects', async () => {
  const { handler, effects } = loadRetiredEndpoint();
  for (const method of ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    await assertRetired(
      handler,
      new Request('https://example.invalid/process-withdraw', { method }),
    );
  }
  assert.deepEqual(effects, []);
});

test('legacy withdrawal payloads, malformed bodies and missing/invalid auth never complete', async () => {
  const { handler, effects } = loadRetiredEndpoint();
  for (const body of [
    '{"amount":1,"walletAddress":"not-a-payout-destination"}',
    '{',
    'null',
    '',
    '{"amount":-1}',
    '{"amount":1e300}',
  ]) {
    for (const authorization of [undefined, 'Bearer invalid', 'Bearer synthetic-test-token']) {
      await assertRetired(
        handler,
        new Request('https://example.invalid/process-withdraw', {
          method: 'POST',
          headers: authorization ? { authorization } : {},
          body,
        }),
      );
    }
  }
  assert.deepEqual(effects, []);
});

test('repeated invocation remains retired', async () => {
  const { handler, effects } = loadRetiredEndpoint();
  for (let i = 0; i < 100; i++) await assertRetired(handler, undefined);
  assert.deepEqual(effects, []);
});

test('no request property, identity, header or body is read', async () => {
  const { handler, effects } = loadRetiredEndpoint();
  await assertRetired(
    handler,
    new Proxy(
      {},
      {
        get() {
          throw new Error('The retired endpoint must not inspect requests');
        },
      },
    ),
  );
  assert.deepEqual(effects, []);
});

test('entrypoint has no imports, financial access, secret access or alternate code files', async () => {
  const executable = source.replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(
    executable,
    /\b(import|require|fetch|createClient|transactions|portfolios|transfer_executions|ledger_journals|ledger_postings|completed|success|process|env|eval)\b/,
  );
  assert.deepEqual(await readdir(new URL('../functions/process-withdraw/', import.meta.url)), [
    'index.ts',
  ]);
});

test('configuration preserves gateway JWT verification and pins the retired entrypoint', async () => {
  const config = await readFile(new URL('../config.toml', import.meta.url), 'utf8');
  assert.match(
    config,
    /\[functions\.process-withdraw\]\s+verify_jwt = true\s+entrypoint = "\.\/functions\/process-withdraw\/index\.ts"/,
  );
  assert.doesNotMatch(config, /verify_jwt\s*=\s*false/);
});

test('application, shared-package and CI sources cannot call or redeploy the legacy name', () => {
  let matches;
  try {
    matches = execFileSync(
      'git',
      [
        'grep',
        '-n',
        '-i',
        '-E',
        'process[-_]withdraw|processWithdraw',
        '--',
        'apps',
        'packages',
        '.github',
      ],
      { cwd: root, encoding: 'utf8' },
    );
  } catch (error) {
    if (error.status !== 1) throw error;
    matches = '';
  }
  assert.equal(matches, '');
});
