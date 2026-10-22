import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const native = createRequire(import.meta.url);
function load(path, mocks = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)(
    (name) => (Object.hasOwn(mocks, name) ? mocks[name] : native(name)),
    module,
    module.exports,
  );
  return module.exports;
}
const contract = load('../app/(auth)/auth-utils.ts');
function nodes(node, type) {
  if (!node || typeof node !== 'object') return [];
  return [
    ...(node.type === type ? [node] : []),
    ...React.Children.toArray(node.props?.children).flatMap((n) => nodes(n, type)),
  ];
}
function fixture(mode, outcome = 'complete') {
  const state = [];
  let index = 0;
  const calls = [];
  const fakeReact = {
    ...React,
    useState: (initial) => {
      const i = index++;
      if (!(i in state)) state[i] = initial;
      return [state[i], (value) => (state[i] = value)];
    },
  };
  const signUp = {
    status: null,
    create: async (args) => calls.push(['create', args]),
    update: async (args) => calls.push(['update', args]),
    prepareEmailAddressVerification: async (args) => calls.push(['prepare', args]),
    attemptEmailAddressVerification: async (args) => {
      calls.push(['verify', args]);
      if (outcome === 'expired') throw new Error('expired');
      return { status: outcome, createdSessionId: 'sess_safe' };
    },
    authenticateWithRedirect: async (args) => calls.push(['social', args]),
  };
  const signIn = {
    create: async () => ({
      supportedFirstFactors: [{ strategy: 'email_code', emailAddressId: 'email_id' }],
    }),
    prepareFirstFactor: async (args) => calls.push(['prepare', args]),
    attemptFirstFactor: async () => ({ status: outcome, createdSessionId: 'sess_safe' }),
    attemptSecondFactor: async () => ({ status: 'complete', createdSessionId: 'sess_safe' }),
    authenticateWithRedirect: signUp.authenticateWithRedirect,
  };
  const mocks = {
    react: fakeReact,
    '@clerk/nextjs': {
      useClerk: () => ({
        setActive: async (args) => calls.push(['activate', args]),
        authenticateWithMetamask: async (args) => calls.push(['wallet', args]),
      }),
    },
    '@clerk/nextjs/legacy': {
      useSignIn: () => ({ isLoaded: true, signIn }),
      useSignUp: () => ({ isLoaded: true, signUp }),
    },
    '@neptlium/ui': {
      Button: 'button',
      Field: 'div',
      Input: 'input',
      Label: 'label',
    },
    'next/link': { __esModule: true, default: 'a' },
    '../auth-utils': contract,
  };
  const { ClerkAuthForm } = load('../app/(auth)/components/ClerkAuthForm.tsx', mocks);
  let tree;
  const render = () => {
    index = 0;
    tree = ClerkAuthForm({ mode, returnTo: '/dashboard/activity?tab=recent' });
    return tree;
  };
  render();
  return {
    calls,
    signUp,
    render,
    form: () => nodes(tree, 'form')[0],
    input: () => nodes(tree, 'input')[0],
    buttons: () => nodes(tree, 'button'),
    html: () => renderToStaticMarkup(tree),
  };
}
test('custom email registration verifies the code before activating a session', async () => {
  const f = fixture('sign-up');
  f.input().props.onChange({ target: { value: 'owner@example.test' } });
  await new Promise(setImmediate);
  f.render();
  await f.form().props.onSubmit({ preventDefault() {} });
  await new Promise(setImmediate);
  f.render();
  assert.equal(f.calls[0][0], 'create');
  assert.equal(f.calls[1][0], 'prepare');
  assert.equal(
    f.calls.some((c) => c[0] === 'activate'),
    false,
  );
  f.input().props.onChange({ target: { value: '123456' } });
  await new Promise(setImmediate);
  f.render();
  const previous = globalThis.window;
  globalThis.window = { location: { assign: (url) => f.calls.push(['navigate', url]) } };
  try {
    await f.form().props.onSubmit({ preventDefault() {} });
  } finally {
    globalThis.window = previous;
  }
  assert.equal(f.calls[2][0], 'verify');
  assert.equal(f.calls[3][0], 'activate');
  assert.ok(f.calls[4][1].startsWith('/auth/complete?next='));
});
test('expired or incomplete email verification never activates a session', async () => {
  for (const outcome of ['expired', 'missing_requirements']) {
    const f = fixture('sign-up', outcome);
    f.input().props.onChange({ target: { value: 'owner@example.test' } });
    await new Promise(setImmediate);
    f.render();
    await f.form().props.onSubmit({ preventDefault() {} });
    await new Promise(setImmediate);
    f.render();
    f.input().props.onChange({ target: { value: '000000' } });
    await new Promise(setImmediate);
    f.render();
    await f.form().props.onSubmit({ preventDefault() {} });
    await new Promise(setImmediate);
    f.render();
    assert.equal(
      f.calls.some((c) => c[0] === 'activate'),
      false,
    );
    assert.match(f.html(), /role="alert"/);
  }
});
test('social continuation preserves validated destination and uses the dedicated callback', async () => {
  const f = fixture('sign-in');
  await f
    .buttons()
    .find((b) => b.props.children === 'Continue with Google')
    .props.onClick();
  const args = f.calls.find((c) => c[0] === 'social')[1];
  assert.equal(args.strategy, 'oauth_google');
  assert.ok(args.redirectUrl.startsWith('/auth/sso-callback?next='));
  assert.ok(args.redirectUrlComplete.startsWith('/auth/complete?next='));
});
test('wallet sign-in uses Clerk strategy without accepting keys or financial parameters', async () => {
  const f = fixture('sign-in');
  await f
    .buttons()
    .find((b) => b.props.children === 'Continue with MetaMask')
    .props.onClick();
  const args = f.calls.find((c) => c[0] === 'wallet')[1];
  assert.deepEqual(Object.keys(args), ['redirectUrl']);
  assert.match(f.html(), /verified email is required/);
});
