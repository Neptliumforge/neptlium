import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextRequest, NextResponse } from 'next/server.js';

const root = resolve(import.meta.dirname, '..');
const nativeRequire = createRequire(import.meta.url);
// Execute real source with explicit in-process auth/navigation fixtures. No provider requests.
function load(file, mocks = {}) {
  const path = resolve(root, file);
  const source = ts.transpileModule(readFileSync(path, 'utf8'), {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  const require = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith('@/')) return load(`${name.slice(2)}.ts`, mocks);
    if (name.startsWith('.')) {
      const target = resolve(dirname(path), name);
      return load(`${target.slice(root.length + 1)}.ts`, mocks);
    }
    return nativeRequire(name);
  };
  new Function('require', 'module', 'exports', source)(require, module, module.exports);
  return module.exports;
}
const contract = load('app/(auth)/auth-utils.ts');
const { safeInternalPath, resolveReturnDestination, accountEntryHref, ACCOUNT_RETURN_HEADER } =
  contract;
const target = '/dashboard/activity?tab=recent&filter=a%2Fb';
const shell = ({ children }) => React.createElement('section', {}, children);
const mocksForPages = {
  '@/app/(auth)/components/ClerkAuthForm': { ClerkAuthForm: () => null },
  '@/lib/auth/provider': { clerkDevelopmentEnabled: () => false },
  '@/app/(auth)/components/AuthShell': { AuthShell: shell },
  '../components/AuthShell': { AuthShell: shell },
  '@neptlium/ui': { Button: ({ href, children }) => React.createElement('a', { href }, children) },
  'next/navigation': {
    redirect: (path) => {
      throw new Error(`redirect:${path}`);
    },
  },
};
function elements(node, type) {
  if (!node || typeof node !== 'object') return [];
  const children = React.Children.toArray(node.props?.children);
  return [
    ...(node.type === type ? [node] : []),
    ...children.flatMap((child) => elements(child, type)),
  ];
}

test('destination preserves legitimate path/query, strips fragments, and supports implemented pages', () => {
  assert.equal(safeInternalPath(target), target);
  assert.equal(safeInternalPath('/dashboard/activity#section'), '/dashboard/activity');
  assert.equal(
    safeInternalPath('/dashboard/research/company/BRK.B'),
    '/dashboard/research/company/BRK.B',
  );
  // Route additions cannot silently become unsupported returns.
  function pages(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? pages(resolve(dir, e.name))
        : e.name === 'page.tsx'
          ? [resolve(dir, e.name)]
          : [],
    );
  }
  for (const path of pages(resolve(root, 'app/dashboard'))) {
    const url = path
      .slice(resolve(root, 'app').length)
      .replace(/\/page\.tsx$/, '')
      .replace('[ticker]', 'TEST');
    assert.equal(safeInternalPath(url), url, url);
  }
});

test('missing, malformed, external, unsupported and sensitive destinations fail safely', () => {
  for (const value of [
    null,
    undefined,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/dashboard/%ZZ',
    '/dashboard/%E0%A4',
    '/dashboard/activity\n',
    '/dashboard/activity?x=%0a',
    '/dashboard/research/company/a%2Fb',
    '/dashboard/research/company/%255cfoo',
    '/auth/sign-in',
    '/auth/callback',
    '/api/account',
    '/dashboard/not-a-page',
    '/onboarding/missing',
    '/dashboard/activity?access_token=fixture',
    '/dashboard?code=fixture',
    '/dashboard?next=//evil.example',
  ]) {
    assert.equal(safeInternalPath(value), '/dashboard', String(value));
  }
});

test('canonical/legacy precedence, duplicate keys and record/URL parser inputs are deterministic', () => {
  assert.equal(resolveReturnDestination({ redirect_url: target }), target);
  assert.equal(resolveReturnDestination(new URLSearchParams({ next: target })), target);
  assert.equal(
    resolveReturnDestination({ next: target, redirect_url: '/dashboard/portfolio' }),
    target,
  );
  assert.equal(resolveReturnDestination({ next: '', redirect_url: target }), '/dashboard');
  assert.equal(
    resolveReturnDestination({ next: '//evil.example', redirect_url: target }),
    '/dashboard',
  );
  for (const params of [
    { next: [target, target] },
    { redirect_url: [target, target] },
    { next: target, redirect_url: [target, target] },
    new URLSearchParams(`next=${encodeURIComponent(target)}&next=/dashboard`),
  ]) {
    assert.equal(resolveReturnDestination(params), '/dashboard');
  }
  assert.equal(resolveReturnDestination({}), '/dashboard');
});

test('explicit onboarding return is bounded to dashboard and cannot recursively loop', () => {
  const entry = `/onboarding?next=${encodeURIComponent(target)}`;
  assert.equal(safeInternalPath(entry), entry);
  assert.equal(safeInternalPath('/onboarding?next=%2Fonboarding'), '/onboarding?next=%2Fdashboard');
  assert.equal(
    safeInternalPath('/onboarding?next=https%3A%2F%2Fevil.example'),
    '/onboarding?next=%2Fdashboard',
  );
  assert.equal(
    safeInternalPath('/onboarding?next=%2Fdashboard%3Ftoken%3Dfixture'),
    '/onboarding?next=%2Fdashboard',
  );
});

test('session-expired producer feeds the same Account consumer, including legacy and duplicates', async () => {
  const page = load('app/(auth)/session-expired/page.tsx', mocksForPages).default;
  for (const params of [
    { next: target },
    { redirect_url: target },
    { next: [target, target] },
    {},
  ]) {
    const html = renderToStaticMarkup(await page({ searchParams: Promise.resolve(params) }));
    const href = html.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&');
    const destination = resolveReturnDestination(new URL(href, 'https://app.example').searchParams);
    assert.equal(destination, resolveReturnDestination(params));
    assert.equal(href.includes('redirect_url'), false);
  }
});

test('server entry validates before passing form destination; legacy aliases preserve it', async () => {
  for (const mode of ['sign-in', 'sign-up']) {
    const entry = load(`app/auth/${mode}/page.tsx`, {
      ...mocksForPages,
      '@/app/(auth)/components/SupabaseAuthForm': { SupabaseAuthForm: 'fixture-form' },
    }).default;
    for (const params of [
      { next: target },
      { redirect_url: target },
      { next: '//evil.example' },
      {},
    ]) {
      const tree = await entry({ searchParams: Promise.resolve(params) });
      assert.equal(
        elements(tree, 'fixture-form')[0].props.returnTo,
        resolveReturnDestination(params),
      );
    }
    const legacy = load(`app/(auth)/${mode}/page.tsx`, mocksForPages).default;
    await assert.rejects(legacy({ searchParams: Promise.resolve({ next: target }) }), {
      message: `redirect:${accountEntryHref(mode, target)}`,
    });
  }
});

function formFixture(mode, returnTo, results = {}) {
  const state = [];
  const navigations = [];
  let stateIndex = 0;
  let creates = 0;
  let signupOptions;
  const fakeReact = {
    ...React,
    useEffect: () => {},
    useState: (initial) => {
      const index = stateIndex++;
      state[index] = typeof initial === 'function' ? initial() : initial;
      return [
        state[index],
        (value) => {
          state[index] = value;
        },
      ];
    },
  };
  const provider = {
    auth: {
      signInWithPassword: async () => ({ error: results.error ?? null }),
      signUp: async (options) => {
        signupOptions = options;
        return { error: results.error ?? null, data: { session: results.session ?? null } };
      },
    },
  };
  const { SupabaseAuthForm } = load('app/(auth)/components/SupabaseAuthForm.tsx', {
    react: fakeReact,
    'next/navigation': {
      useRouter: () => ({ replace: (path) => navigations.push(path), refresh() {} }),
    },
    'next/link': {
      __esModule: true,
      default: ({ href, children }) => React.createElement('a', { href }, children),
    },
    '@neptlium/lib/supabase/browser': {
      createSupabaseBrowserClient: () => {
        creates++;
        return provider;
      },
    },
  });
  const tree = SupabaseAuthForm({ mode, returnTo });
  return {
    tree,
    state,
    navigations,
    submit: () => elements(tree, 'form')[0].props.onSubmit({ preventDefault() {} }),
    creates: () => creates,
    signupOptions: () => signupOptions,
  };
}

test('both forms render before auth client creation and switch modes without losing the destination', () => {
  for (const mode of ['sign-in', 'sign-up']) {
    const fixture = formFixture(mode, target);
    const html = renderToStaticMarkup(fixture.tree);
    assert.match(html, /type="email"/);
    assert.match(html, /type="password"/);
    assert.match(html, /type="submit"/);
    assert.equal(fixture.creates(), 0);
    const nextMode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
    assert.ok(html.includes(accountEntryHref(nextMode, target).replaceAll('&', '&amp;')));
  }
});

test('sign-in error/retry retains destination; success and safe default use validated return', async () => {
  const result = { error: new Error('isolated fixture') };
  const fixture = formFixture('sign-in', target, result);
  await fixture.submit();
  assert.deepEqual(fixture.navigations, []);
  assert.ok(fixture.state[2]);
  result.error = null;
  await fixture.submit();
  assert.deepEqual(fixture.navigations, [target]);
  const invalid = formFixture('sign-in', '//evil.example');
  await invalid.submit();
  assert.deepEqual(invalid.navigations, ['/dashboard']);
});

test('sign-up confirmation callback and immediate session retain the same destination', async () => {
  const previous = globalThis.window;
  globalThis.window = { location: { origin: 'https://app.example' } };
  try {
    for (const session of [null, { isolated: true }]) {
      const fixture = formFixture('sign-up', `/onboarding?next=${encodeURIComponent(target)}`, {
        session,
      });
      await fixture.submit();
      const callback = new URL(fixture.signupOptions().options.emailRedirectTo);
      assert.equal(callback.pathname, '/auth/callback');
      assert.equal(
        resolveReturnDestination(callback.searchParams),
        `/onboarding?next=${encodeURIComponent(target)}`,
      );
      assert.deepEqual(
        fixture.navigations,
        session ? [`/onboarding?next=${encodeURIComponent(target)}`] : [],
      );
    }
  } finally {
    globalThis.window = previous;
  }
});

test('callback missing-code, provider rejection and success revalidate and retain destination', async () => {
  for (const outcome of ['missing', 'error', 'success']) {
    let calls = 0;
    const { GET } = load('app/auth/callback/route.ts', {
      '@neptlium/lib/supabase/server': {
        createSupabaseServerClient: async () => ({
          auth: {
            exchangeCodeForSession: async () => {
              calls++;
              return { error: outcome === 'error' ? new Error('isolated') : null };
            },
          },
        }),
      },
    });
    const query = new URLSearchParams({ next: target });
    if (outcome !== 'missing') query.set('code', 'isolated-fixture-not-a-token');
    const response = await GET(new NextRequest(`https://app.example/auth/callback?${query}`));
    const location = new URL(response.headers.get('location'));
    assert.equal(calls, outcome === 'missing' ? 0 : 1);
    if (outcome === 'success') assert.equal(location.pathname + location.search, target);
    else {
      assert.equal(location.pathname, '/auth/sign-in');
      assert.equal(resolveReturnDestination(location.searchParams), target);
      assert.equal(
        location.searchParams.get('error'),
        outcome === 'missing' ? 'missing_auth_code' : 'auth_callback_failed',
      );
    }
    assert.equal(location.searchParams.has('code'), false);
  }
});

function proxyFixture(user) {
  let forwarded;
  const proxy = load('proxy.ts', {
    '@neptlium/lib/supabase/proxy': {
      refreshSupabaseSession: async (request) => {
        forwarded = new Headers(request.headers);
        const response = NextResponse.next({ request });
        response.cookies.set('fixture-refresh', 'not-a-session');
        return { response, user };
      },
    },
  });
  return { ...proxy, forwarded: () => forwarded };
}

test('expired session proxy preserves path/query, overwrites forged header and copies refreshed cookies', async () => {
  const fixture = proxyFixture(null);
  const request = new NextRequest(`https://app.example${target}`, {
    headers: { [ACCOUNT_RETURN_HEADER]: '/dashboard/administration' },
  });
  const response = await fixture.default(request);
  assert.equal(
    resolveReturnDestination(new URL(response.headers.get('location')).searchParams),
    target,
  );
  assert.equal(fixture.forwarded().get(ACCOUNT_RETURN_HEADER), target);
  assert.equal(response.cookies.get('fixture-refresh').value, 'not-a-session');
  assert.ok(
    fixture.config.matcher.includes('/dashboard/:path*'),
    'dotted company routes must run proxy',
  );
});

test('authenticated entry/refresh honors safe destination; root/default unchanged and untrusted header removed', async () => {
  const fixture = proxyFixture({ isolated: true });
  for (const mode of ['sign-in', 'sign-up']) {
    const response = await fixture.default(
      new NextRequest(`https://app.example${accountEntryHref(mode, target)}`),
    );
    assert.equal(response.headers.get('location'), `https://app.example${target}`);
  }
  const rootResponse = await fixture.default(new NextRequest('https://app.example/'));
  assert.equal(rootResponse.headers.get('location'), 'https://app.example/dashboard');
  await fixture.default(
    new NextRequest('https://app.example/auth/sign-in', {
      headers: { [ACCOUNT_RETURN_HEADER]: target },
    }),
  );
  assert.equal(fixture.forwarded().has(ACCOUNT_RETURN_HEADER), false);
});

test('server guard handles session loss after proxy and retains independent role denial', async () => {
  let user = null;
  const guards = load('lib/auth/guards.ts', {
    './session': { getSessionUser: async () => user, getCurrentProfile: async () => null },
    './return-context': { getRequestReturnPath: async () => target },
    '@/components/security/resolveRole': { resolveRole: async () => 'viewer' },
    '@neptlium/lib/rbac': { hasRole: () => false },
    'next/navigation': mocksForPages['next/navigation'],
  });
  await assert.rejects(guards.requireUser(), {
    message: `redirect:${accountEntryHref('sign-in', target)}`,
  });
  user = { id: 'isolated-principal' };
  assert.equal(await guards.requireUser(), user);
  await assert.rejects(guards.requireRole('admin'), { message: 'redirect:/dashboard' });
});

test('onboarding request context validates completion and already-provisioned server redirect', async () => {
  let header = `/onboarding?next=${encodeURIComponent(target)}`;
  const context = load('lib/auth/return-context.ts', {
    'next/headers': { headers: async () => new Headers({ [ACCOUNT_RETURN_HEADER]: header }) },
  });
  assert.equal(await context.getOnboardingReturnPath(), target);
  const page = load('app/onboarding/page.tsx', {
    '@/lib/auth': { requireUser: async () => ({ email: 'isolated@example.test' }) },
    '@/lib/auth/session': { getCurrentProfile: async () => ({ provisionedAt: 'fixture' }) },
    '@/lib/auth/return-context': context,
    './OnboardingWizard': { OnboardingWizard: 'fixture-wizard' },
    'next/navigation': mocksForPages['next/navigation'],
  }).default;
  await assert.rejects(page(), { message: `redirect:${target}` });
  header = '/onboarding?next=%2Fonboarding';
  assert.equal(await context.getOnboardingReturnPath(), '/dashboard');
});

test('onboarding completes to validated destination only after successful provisioning; retry retains it', async () => {
  for (const success of [true, false]) {
    let index = 0;
    const navigations = [];
    const calls = [];
    const initial = [
      1,
      { acceptedTerms: true, firstName: 'Isolated', lastName: 'Fixture', country: 'US' },
      true,
      null,
      false,
    ];
    const wrapper = ({ children }) => React.createElement('div', {}, children);
    const { OnboardingWizard } = load('app/onboarding/OnboardingWizard.tsx', {
      react: { ...React, useEffect() {}, useState: () => [initial[index++], () => {}] },
      'next/navigation': {
        useRouter: () => ({ refresh() {}, replace: (path) => navigations.push(path) }),
      },
      'next/link': { __esModule: true, default: wrapper },
      '@neptlium/ui': Object.fromEntries(
        ['Button', 'Field', 'FieldError', 'Input', 'Label'].map((name) => [name, wrapper]),
      ),
      '@neptlium/lib/validation': {
        onboardingPayloadSchema: { safeParse: (data) => ({ success: true, data }) },
      },
      './components/OnboardingShell': { OnboardingShell: wrapper },
      './components/OnboardingPanel': { OnboardingPanel: wrapper },
      './wizard-steps': { onboardingSteps: ['setup', 'confirm'] },
      './actions': {
        getOnboardingDraft: async () => {
          throw new Error('effect is not run');
        },
        saveOnboardingDraft: async () => {
          calls.push('save');
          return { ok: true };
        },
        submitProvisioning: async () => {
          calls.push('provision');
          return { ok: success, error: 'isolated failure' };
        },
      },
    });
    const tree = OnboardingWizard({ email: 'isolated@example.test', returnTo: target });
    await elements(tree, 'form')[0].props.onSubmit({ preventDefault() {} });
    assert.deepEqual(calls, ['save', 'provision']);
    assert.deepEqual(navigations, success ? [target] : []);
  }
});
