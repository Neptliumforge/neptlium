import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
function load(path) {
  const exports = {};
  new Function(
    'exports',
    ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
  )(exports);
  return exports;
}
const { clerkDevelopmentEnabled } = load('../lib/auth/provider.ts');
const { linkMetaMask } = load('../lib/auth/wallet-link.ts');
const valid = {
  NEXT_PUBLIC_AUTH_PROVIDER: 'clerk',
  NEPTLIUM_AUTH_ENVIRONMENT: 'development',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_fixture',
  CLERK_SECRET_KEY: 'sk_test_fixture',
  NEPTLIUM_API_URL: 'http://localhost:3003',
};
test('App Clerk path is explicit and cannot target production or a remote API', () => {
  assert.equal(clerkDevelopmentEnabled({}), false);
  assert.equal(clerkDevelopmentEnabled(valid), true);
  for (const change of [
    { VERCEL_ENV: 'production' },
    { NEPTLIUM_AUTH_ENVIRONMENT: 'production' },
    { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_x' },
    { CLERK_SECRET_KEY: 'sk_live_x' },
    { NEPTLIUM_API_URL: 'https://api.neptlium.com' },
  ])
    assert.throws(() => clerkDevelopmentEnabled({ ...valid, ...change }));
});
const address = '0x' + 'a'.repeat(40);
function fixture(change = {}) {
  const calls = [];
  const wallet = {
    id: 'wallet',
    web3Wallet: address,
    verification: { status: 'unverified', message: null },
    prepareVerification: async () => {
      calls.push('sdk-signature');
      return { ...wallet, verification: { status: 'unverified', message: 'signed-by-sdk' } };
    },
    attemptVerification: async ({ signature }) => {
      assert.equal(signature, 'signed-by-sdk');
      calls.push('verify');
      return { ...wallet, verification: { status: 'verified', message: null } };
    },
  };
  const user = {
    primaryEmailAddress: { verification: { status: 'verified' } },
    web3Wallets: [],
    createWeb3Wallet: async () => wallet,
    reload: async () => calls.push('reload'),
    ...change,
  };
  const ethereum = {
    request: async ({ method }) => {
      calls.push(method);
      return [address];
    },
  };
  return { user, ethereum, calls, wallet };
}
test('wallet linking uses SDK-generated signature once and never requests a transaction', async () => {
  const f = fixture();
  await linkMetaMask(f.user, f.ethereum);
  assert.deepEqual(f.calls, [
    'eth_requestAccounts',
    'sdk-signature',
    'eth_accounts',
    'verify',
    'reload',
  ]);
});
test('wallet change, missing signature, rejection and another account wallet fail closed', async () => {
  const f = fixture();
  f.ethereum.request = async ({ method }) => [
    method === 'eth_accounts' ? '0x' + 'b'.repeat(40) : address,
  ];
  await assert.rejects(linkMetaMask(f.user, f.ethereum), /changed/);
  assert.equal(f.calls.includes('verify'), false);
  const noEmail = fixture({ primaryEmailAddress: null });
  await assert.rejects(linkMetaMask(noEmail.user, noEmail.ethereum), /Verified email/);
  assert.equal(noEmail.calls.length, 0);
  const rejected = fixture();
  rejected.wallet.prepareVerification = async () => {
    throw new Error('rejected');
  };
  await assert.rejects(linkMetaMask(rejected.user, rejected.ethereum), /rejected/);
  const duplicate = fixture({
    createWeb3Wallet: async () => {
      throw new Error('belongs to another account');
    },
  });
  await assert.rejects(linkMetaMask(duplicate.user, duplicate.ethereum), /another account/);
});
