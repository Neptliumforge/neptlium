import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildApp } from '../dist/app.js';
import { loadConfig } from '../dist/config.js';
import { MemoryRepository } from '../dist/repositories.js';
import { identityVerificationView, legalNameLocked } from '../dist/identity-verification.js';
import {
  accountStandingOf,
  onboardingStateOf,
  parseProfileUpdate,
} from '../dist/account-profile.js';

const auth = { authorization: 'Bearer owner-token' };

function createApp({ repository = new MemoryRepository(), identityVerification } = {}) {
  const config = loadConfig({ NODE_ENV: 'test', API_ALLOWED_ORIGINS: 'http://localhost:3001' });
  return buildApp({
    config,
    repository,
    ...(identityVerification ? { identityVerification } : {}),
    authenticate: async (token) =>
      token === 'owner-token' ? { id: 'owner-1', role: 'user' } : null,
  });
}

function provider(
  readiness,
  startSession = async () => ({
    customerActionUrl: 'https://verify.example.test/session/1',
    expiresAt: '2026-10-21T12:00:00.000Z',
  }),
) {
  return { identity: 'test', readiness: () => readiness, startSession };
}

function records(record, { configured = true } = {}) {
  return {
    configured,
    latest: async () => {
      if (record instanceof Error) throw record;
      return record;
    },
  };
}

test('account status, profile and verification endpoints require authentication', async () => {
  const app = await createApp();
  for (const [method, url] of [
    ['GET', '/v1/account/status'],
    ['POST', '/v1/account/profile'],
    ['POST', '/v1/account/identity-verification/sessions'],
  ]) {
    const response = await app.inject({ method, url, payload: { display_name: 'x' } });
    assert.equal(response.statusCode, 401, url);
    assert.equal(response.json().error.code, 'authentication_required');
  }
});

test('a new account reports onboarding not started and verification not enabled', async () => {
  const repository = new MemoryRepository();
  repository.profiles.set('owner-1', { provisionedAt: null, complianceStatus: 'pending' });
  const app = await createApp({ repository });
  const response = await app.inject({ method: 'GET', url: '/v1/account/status', headers: auth });
  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.deepEqual(body.onboarding, { state: 'NOT_STARTED', completed_at: null });
  assert.equal(body.standing, 'UNRESTRICTED');
  assert.deepEqual(body.identity_verification, {
    capability: 'NOT_ENABLED',
    record: { state: 'NOT_CONFIGURED' },
    can_start: false,
  });
});

test('onboarding progress persists and is reported separately from verification', async () => {
  const repository = new MemoryRepository();
  repository.profiles.set('owner-1', { provisionedAt: null });
  const app = await createApp({ repository });
  const saved = await app.inject({
    method: 'POST',
    url: '/v1/account/onboarding-draft',
    headers: auth,
    payload: { data: { firstName: 'Ada' }, step_index: 1 },
  });
  assert.equal(saved.statusCode, 200);
  const draft = await app.inject({
    method: 'GET',
    url: '/v1/account/onboarding-draft',
    headers: auth,
  });
  assert.deepEqual(draft.json(), { data: { firstName: 'Ada' }, stepIndex: 1 });
  const status = await app.inject({ method: 'GET', url: '/v1/account/status', headers: auth });
  assert.equal(status.json().onboarding.state, 'IN_PROGRESS');
  assert.equal(status.json().identity_verification.capability, 'NOT_ENABLED');

  repository.profiles.set('owner-1', { provisionedAt: '2026-10-21T00:00:00.000Z' });
  const completed = await app.inject({ method: 'GET', url: '/v1/account/status', headers: auth });
  assert.deepEqual(completed.json().onboarding, {
    state: 'COMPLETED',
    completed_at: '2026-10-21T00:00:00.000Z',
  });
  // Completing onboarding never implies verification.
  assert.deepEqual(completed.json().identity_verification.record, { state: 'NOT_CONFIGURED' });
});

test('compliance_status values never surface as verification outcomes', async () => {
  for (const complianceStatus of ['pending', 'active', 'verified', 'approved']) {
    const repository = new MemoryRepository();
    repository.profiles.set('owner-1', { complianceStatus });
    const app = await createApp({ repository });
    const body = (
      await app.inject({ method: 'GET', url: '/v1/account/status', headers: auth })
    ).json();
    assert.equal(body.identity_verification.record.state, 'NOT_CONFIGURED', complianceStatus);
    assert.equal(body.standing, 'UNRESTRICTED', complianceStatus);
  }
  assert.equal(accountStandingOf({ complianceStatus: 'suspended' }), 'RESTRICTED');
  assert.equal(accountStandingOf({ complianceStatus: 'revoked' }), 'RESTRICTED');
});

test('verification session start fails closed when no provider is enabled', async () => {
  const app = await createApp();
  const response = await app.inject({
    method: 'POST',
    url: '/v1/account/identity-verification/sessions',
    headers: { ...auth, 'idempotency-key': 'verification-key-1' },
  });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'identity_verification_not_enabled');
});

test('a configured provider without a durable record store is not offered', async () => {
  const view = await identityVerificationView(
    { provider: provider('configured'), records: records(null, { configured: false }) },
    'owner-1',
  );
  assert.equal(view.capability, 'NOT_ENABLED');
  assert.equal(view.can_start, false);
});

test('verification state comes only from Neptlium records once an adapter is configured', async () => {
  const cases = [
    [null, { state: 'EMPTY' }, true],
    [
      { status: 'PENDING', updatedAt: '2026-10-21T00:00:00.000Z', actionRequiredReason: null },
      'PENDING',
      false,
    ],
    [
      {
        status: 'ACTION_REQUIRED',
        updatedAt: '2026-10-21T00:00:00.000Z',
        actionRequiredReason: 'Document image was unreadable',
      },
      'ACTION_REQUIRED',
      true,
    ],
    [
      { status: 'VERIFIED', updatedAt: '2026-10-21T00:00:00.000Z', actionRequiredReason: null },
      'VERIFIED',
      false,
    ],
    [
      { status: 'approved', updatedAt: 'x', actionRequiredReason: null },
      { state: 'UNAVAILABLE' },
      false,
    ],
    [new Error('store down'), { state: 'UNAVAILABLE' }, false],
  ];
  for (const [record, expected, canStart] of cases) {
    const view = await identityVerificationView(
      { provider: provider('configured'), records: records(record) },
      'owner-1',
    );
    assert.equal(view.capability, 'AVAILABLE');
    if (typeof expected === 'string') assert.equal(view.record.value.status, expected);
    else assert.deepEqual(view.record, expected);
    assert.equal(view.can_start, canStart);
  }
});

test('an available adapter starts a session with the caller idempotency key', async () => {
  const calls = [];
  const app = await createApp({
    identityVerification: {
      provider: provider('configured', async (input) => {
        calls.push(input);
        return {
          customerActionUrl: 'https://verify.example.test/s',
          expiresAt: '2026-10-21T12:00:00.000Z',
        };
      }),
      records: records(null),
    },
  });
  const missingKey = await app.inject({
    method: 'POST',
    url: '/v1/account/identity-verification/sessions',
    headers: auth,
  });
  assert.equal(missingKey.statusCode, 400);
  const response = await app.inject({
    method: 'POST',
    url: '/v1/account/identity-verification/sessions',
    headers: { ...auth, 'idempotency-key': 'verification-key-1' },
  });
  assert.equal(response.statusCode, 201);
  assert.deepEqual(calls, [{ principalId: 'owner-1', idempotencyKey: 'verification-key-1' }]);
  assert.equal(response.json().customer_action_url, 'https://verify.example.test/s');
});

test('verified or pending verification cannot be restarted', async () => {
  const app = await createApp({
    identityVerification: {
      provider: provider('configured'),
      records: records({
        status: 'VERIFIED',
        updatedAt: '2026-10-21T00:00:00.000Z',
        actionRequiredReason: null,
      }),
    },
  });
  const response = await app.inject({
    method: 'POST',
    url: '/v1/account/identity-verification/sessions',
    headers: { ...auth, 'idempotency-key': 'verification-key-1' },
  });
  assert.equal(response.statusCode, 409);
  assert.equal(response.json().error.code, 'identity_verification_not_startable');
});

test('profile updates persist owner-scoped and validate input', async () => {
  const repository = new MemoryRepository();
  const app = await createApp({ repository });
  const updated = await app.inject({
    method: 'POST',
    url: '/v1/account/profile',
    headers: auth,
    payload: { first_name: ' Ada ', last_name: 'Lovelace', display_name: 'Ada' },
  });
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.json().fullName, 'Ada Lovelace');
  assert.equal(updated.json().displayName, 'Ada');
  const context = await app.inject({ method: 'GET', url: '/v1/account/context', headers: auth });
  assert.equal(context.json().firstName, 'Ada');
  assert.equal(context.json().lastName, 'Lovelace');

  const cleared = await app.inject({
    method: 'POST',
    url: '/v1/account/profile',
    headers: auth,
    payload: { display_name: '' },
  });
  assert.equal(cleared.json().displayName, null);

  for (const payload of [
    {},
    { email: 'x@example.test' },
    { compliance_status: 'active' },
    { role: 'super_admin' },
    { first_name: '' },
    { first_name: 'x'.repeat(101) },
    { last_name: 42 },
    { display_name: 'bad\u0000name' },
  ]) {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/account/profile',
      headers: auth,
      payload,
    });
    assert.equal(response.statusCode, 422, JSON.stringify(payload));
  }
});

test('legal name is locked by pending or verified records and fails closed when unreadable', async () => {
  for (const [record, status, code] of [
    [{ status: 'PENDING', updatedAt: 'x', actionRequiredReason: null }, 409, 'legal_name_locked'],
    [{ status: 'VERIFIED', updatedAt: 'x', actionRequiredReason: null }, 409, 'legal_name_locked'],
    [new Error('store down'), 503, 'identity_verification_unavailable'],
  ]) {
    const app = await createApp({
      identityVerification: { provider: provider('configured'), records: records(record) },
    });
    const response = await app.inject({
      method: 'POST',
      url: '/v1/account/profile',
      headers: auth,
      payload: { last_name: 'Changed' },
    });
    assert.equal(response.statusCode, status);
    assert.equal(response.json().error.code, code);
    const displayOnly = await app.inject({
      method: 'POST',
      url: '/v1/account/profile',
      headers: auth,
      payload: { display_name: 'Still editable' },
    });
    assert.equal(displayOnly.statusCode, 200);
  }
  assert.equal(legalNameLocked({ state: 'NOT_CONFIGURED' }), false);
  assert.equal(legalNameLocked({ state: 'EMPTY' }), false);
});

test('onboarding state derivation is independent of verification and standing', () => {
  assert.equal(onboardingStateOf({ provisionedAt: null }, null), 'NOT_STARTED');
  assert.equal(
    onboardingStateOf({ provisionedAt: null }, { data: {}, stepIndex: 0 }),
    'NOT_STARTED',
  );
  assert.equal(
    onboardingStateOf({ provisionedAt: null }, { data: { a: 1 }, stepIndex: 0 }),
    'IN_PROGRESS',
  );
  assert.equal(onboardingStateOf({ provisionedAt: 'x' }, null), 'COMPLETED');
  assert.deepEqual(parseProfileUpdate({ display_name: null }), { displayName: null });
});

test('financial routes do not consult onboarding, verification or profile state', () => {
  const source = readFileSync(new URL('../src/financial-routes.ts', import.meta.url), 'utf8');
  for (const term of ['identityVerification', 'onboardingStateOf', 'provisionedAt', 'compliance']) {
    assert.doesNotMatch(source, new RegExp(term), term);
  }
});

test('durable profile update is owner-scoped, column-limited and fails closed on no row', async () => {
  const { SupabaseRepository } = await import('../dist/supabase-repository.js');
  const calls = [];
  const profileRow = {
    id: 'owner-1',
    email: 'ada@example.test',
    first_name: 'Ada',
    last_name: 'Lovelace',
    full_name: 'Ada Lovelace',
    display_name: 'Countess',
    investor_type: 'individual',
    organization_id: null,
    compliance_status: 'pending',
    provisioned_at: '2026-10-21T00:00:00.000Z',
  };
  let patchRows = [profileRow];
  const request = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method ?? 'GET', body: init.body });
    const body =
      String(url).includes('/profiles?') && init.method === 'PATCH'
        ? patchRows
        : String(url).includes('/user_roles?')
          ? [{ role: 'user' }]
          : [profileRow];
    return new Response(JSON.stringify(body), { status: 200 });
  };
  const repository = new SupabaseRepository('https://db.example.test', 'service-role', request);
  const result = await repository.updateProfile('owner-1', { displayName: 'Countess' });
  assert.equal(result.displayName, 'Countess');
  const patch = calls.find((call) => call.method === 'PATCH');
  assert.match(patch.url, /\/rest\/v1\/profiles\?id=eq\.owner-1&/);
  assert.deepEqual(JSON.parse(patch.body), { display_name: 'Countess' });

  calls.length = 0;
  await repository.updateProfile('owner-1', { lastName: 'Byron' });
  const namePatch = JSON.parse(calls.find((call) => call.method === 'PATCH').body);
  assert.deepEqual(namePatch, { last_name: 'Byron', full_name: 'Ada Byron' });

  patchRows = [];
  await assert.rejects(
    repository.updateProfile('owner-1', { displayName: 'x' }),
    (error) => error.code === 'account_not_provisioned',
  );
});
