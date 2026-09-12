import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const directory = new URL('supabase/functions/process-deposit/', root);
const source = readFileSync(new URL('index.ts', directory), 'utf8');

function load() {
  let handler;
  const forbidden = () => {
    throw new Error('Side effect attempted');
  };
  const context = vm.createContext({
    Response,
    JSON,
    Deno: new Proxy(
      {
        serve: (callback) => {
          assert.equal(handler, undefined);
          handler = callback;
        },
      },
      {
        get(target, key) {
          if (key !== 'serve') forbidden();
          return target[key];
        },
      },
    ),
    fetch: forbidden,
    createClient: forbidden,
    setTimeout: forbidden,
    setInterval: forbidden,
    console: new Proxy({}, { get: forbidden }),
  });
  vm.runInContext(source, context, { timeout: 1000 });
  assert.equal(typeof handler, 'function');
  return handler;
}

async function retired(response) {
  assert.equal(response.status, 410);
  assert.equal(response.ok, false);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const body = await response.json();
  assert.equal(body.error, 'DEPOSIT_ENDPOINT_RETIRED');
  assert.match(body.message, /retired.*unavailable/i);
  assert.doesNotMatch(JSON.stringify(body), /Hello|success|accepted|completed/i);
  assert.deepEqual(Object.keys(body).sort(), ['error', 'message']);
}

test('every HTTP method fails closed without acknowledgement or side effects', async () => {
  const handler = load();
  for (const method of [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'TRACE',
    'CONNECT',
  ])
    await retired(await handler({ method }));
});

test('malformed, sample and synthetic checkout payloads with absent or invalid auth remain retired', async () => {
  const handler = load();
  for (const body of [
    '{',
    '',
    '{"name":"synthetic-test"}',
    '{"stripe_session_id":"gate03-not-a-real-session","user_id":"gate03-synthetic-invalid-user"}',
  ])
    for (const authorization of [undefined, 'Bearer invalid-synthetic-token'])
      await retired(
        await handler({
          method: 'POST',
          body,
          headers: { authorization },
          json() {
            throw new Error('Body parsed');
          },
        }),
      );
});

test('one hundred repeated requests remain fail closed', async () => {
  const handler = load();
  for (let i = 0; i < 100; i++) await retired(await handler({ method: 'POST' }));
});

test('no request property is read, even for a hostile request object', async () => {
  const request = new Proxy(
    {},
    {
      get() {
        throw new Error('Request read');
      },
      ownKeys() {
        throw new Error('Request enumerated');
      },
    },
  );
  await retired(await load()(request));
});

test('the sole executable source cannot import clients or access Stripe, database, network or secrets', () => {
  assert.deepEqual(readdirSync(directory), ['index.ts']);
  const executable = source.replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(
    executable,
    /\b(?:import|require|fetch|XMLHttpRequest|WebSocket|createClient|process|eval|Function|setTimeout|setInterval)\b|Deno\.(?!serve)|\.(?:from|rpc|json|text|arrayBuffer|env)\s*\(/,
  );
  assert.doesNotMatch(
    executable,
    /Stripe|deposit_routes|wallet_deposits|provider_webhook_events|provider_webhook_inbox|provider_references|settlement_evidence|transfer_execution|funding_intents|transactions|portfolios|ledger_|reconciliation_|SUPABASE_|SECRET|https?:/i,
  );
  assert.match(executable, /Deno\.serve\(\s*\(\)\s*=>/);
});

test('configuration pins the guard and retains JWT verification', () => {
  const config = readFileSync(new URL('supabase/config.toml', root), 'utf8');
  const section = config.match(/\[functions\.process-deposit\]([^[]*)/);
  assert.ok(section);
  assert.match(section[1], /verify_jwt\s*=\s*true/);
  assert.match(section[1], /entrypoint\s*=\s*"\.\/functions\/process-deposit\/index\.ts"/);
});

test('application, shared packages and CI cannot call or deploy the legacy deposit slug', () => {
  try {
    const matches = execFileSync(
      'git',
      [
        'grep',
        '-n',
        '-i',
        '-E',
        'crypto[-_]webhook|processdeposit',
        '--',
        'apps',
        'packages',
        '.github',
      ],
      { cwd: root, encoding: 'utf8' },
    );
    assert.fail(`Legacy deposit reference: ${matches}`);
  } catch (error) {
    if (error.status !== 1) throw error;
  }
});
