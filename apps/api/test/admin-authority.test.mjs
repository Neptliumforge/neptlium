import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../dist/config.js';
import { executeAdminHttp } from '../dist/admin-http.js';

function fakeRepository(role = 'super_admin', sessionEmail = null) {
  const auditEntries = [];
  const approvals = [];
  return {
    auditEntries,
    approvals,
    getRole: async () => role,
    getSession: async (id) => ({
      id,
      email: sessionEmail,
      fullName: null,
      displayName: null,
      role: 'super_admin',
    }),
    getDashboard: async () => ({}),
    listUsers: async () => ({ rows: [], total: 0 }),
    getUser: async () => null,
    updateUserRole: async () => {},
    setCompliance: async () => {},
    listDeposits: async () => ({ rows: [], total: 0 }),
    listWithdrawals: async () => ({ rows: [], total: 0, totalAmount: 0 }),
    approveWithdrawal: async (...args) => {
      approvals.push(args);
    },
    listTransactions: async () => ({ rows: [], total: 0 }),
    listAllocations: async (_query, pending) => (pending ? [] : { rows: [], total: 0 }),
    listLoginHistory: async () => [],
    listTrustedDevices: async () => [],
    audit: async (...args) => {
      auditEntries.push(args);
    },
  };
}
const config = loadConfig({ NODE_ENV: 'test', API_ALLOWED_ORIGINS: 'http://localhost:3002' });
const base = { headers: { authorization: 'Bearer valid-token' }, clientAddress: '127.0.0.1' };
const authenticate = async (token) => (token === 'valid-token' ? { id: 'user-1' } : null);
const treasuryRepository = {
  list: async () => [{ id: 'destination-1', status: 'inactive' }],
};

for (const role of ['admin', 'manager', 'analyst', 'operator', 'user']) {
  test(`${role} role is rejected by General Platform Administrator authority`, async () => {
    const response = await executeAdminHttp(
      config,
      { ...base, method: 'GET', url: '/v1/admin/session' },
      { repository: fakeRepository(role), authenticate },
    );
    assert.equal(response.statusCode, 403);
    assert.equal(JSON.parse(response.body).error.code, 'admin_forbidden');
  });
}

test('exact super_admin may access privileged admin API', async () => {
  const response = await executeAdminHttp(
    config,
    { ...base, method: 'GET', url: '/v1/admin/session' },
    { repository: fakeRepository('super_admin'), authenticate },
  );
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).role, 'super_admin');
});

test('unauthenticated caller cannot reach privileged admin API', async () => {
  const response = await executeAdminHttp(
    config,
    { method: 'GET', url: '/v1/admin/session', headers: {}, clientAddress: '127.0.0.1' },
    { repository: fakeRepository(), authenticate },
  );
  assert.equal(response.statusCode, 401);
  assert.equal(JSON.parse(response.body).error.code, 'authentication_required');
});

test('treasury control plane enforces 401, 403, then permits platform admin domain access', async () => {
  const unauthenticated = await executeAdminHttp(
    config,
    {
      method: 'GET',
      url: '/v1/admin/treasury-destinations',
      headers: {},
      clientAddress: '127.0.0.1',
    },
    { repository: fakeRepository(), treasuryRepository, authenticate },
  );
  assert.equal(unauthenticated.statusCode, 401);

  const customer = await executeAdminHttp(
    config,
    { ...base, method: 'GET', url: '/v1/admin/treasury-destinations' },
    { repository: fakeRepository('user'), treasuryRepository, authenticate },
  );
  assert.equal(customer.statusCode, 403);

  const platformAdmin = await executeAdminHttp(
    config,
    { ...base, method: 'GET', url: '/v1/admin/treasury-destinations' },
    { repository: fakeRepository('super_admin'), treasuryRepository, authenticate },
  );
  assert.equal(platformAdmin.statusCode, 200);
  assert.equal(JSON.parse(platformAdmin.body)[0].id, 'destination-1');
});

test('admin preflight allows only configured production origin without authentication', async () => {
  const productionCors = loadConfig({
    NODE_ENV: 'production',
    API_ALLOWED_ORIGINS: 'https://app.neptlium.com,https://admin.neptlium.com',
  });
  const response = await executeAdminHttp(productionCors, {
    method: 'OPTIONS',
    url: '/v1/admin/session',
    headers: {
      origin: 'https://admin.neptlium.com',
      'access-control-request-method': 'GET',
    },
    clientAddress: '127.0.0.1',
  });
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers['access-control-allow-origin'], 'https://admin.neptlium.com');
  assert.match(response.headers['access-control-allow-methods'], /GET/);
  assert.equal(response.headers.vary, 'Origin');
});

test('admin CORS also permits the configured authenticated app origin', async () => {
  const productionCors = loadConfig({ NODE_ENV: 'production' });
  const response = await executeAdminHttp(productionCors, {
    method: 'OPTIONS',
    url: '/v1/admin/session',
    headers: { origin: 'https://app.neptlium.com' },
    clientAddress: '127.0.0.1',
  });
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers['access-control-allow-origin'], 'https://app.neptlium.com');
});

test('admin route rejects disallowed browser origin and never emits wildcard CORS', async () => {
  const response = await executeAdminHttp(
    config,
    {
      ...base,
      method: 'GET',
      url: '/v1/admin/session',
      headers: { ...base.headers, origin: 'https://attacker.example' },
    },
    { repository: fakeRepository(), authenticate },
  );
  assert.equal(response.statusCode, 403);
  assert.equal(response.headers['access-control-allow-origin'], undefined);
  assert.equal(JSON.parse(response.body).error.code, 'forbidden');
});

test('legacy deposit completion remains fail closed and audited', async () => {
  const repository = fakeRepository();
  const response = await executeAdminHttp(
    config,
    {
      ...base,
      method: 'POST',
      url: '/v1/admin/deposits/deposit-1/complete',
      headers: { ...base.headers, 'idempotency-key': 'deposit-completion-1' },
      payload: '{}',
    },
    { repository, authenticate },
  );
  assert.equal(response.statusCode, 409);
  assert.equal(JSON.parse(response.body).error.code, 'deposit_completion_unavailable');
  assert.ok(
    repository.auditEntries.some((entry) => String(entry[1]).includes('deposit.complete.blocked')),
  );
});

test('canonical email identity alone is insufficient without persisted super_admin role', async () => {
  const response = await executeAdminHttp(
    config,
    { ...base, method: 'GET', url: '/v1/admin/session' },
    { repository: fakeRepository('admin', 'Neptlium@gmail.com'), authenticate },
  );
  assert.equal(response.statusCode, 403);
  assert.equal(JSON.parse(response.body).error.code, 'admin_forbidden');
});

test('governed withdrawal approval persists approval only and cannot manufacture submission or settlement', async () => {
  const repository = fakeRepository();
  const response = await executeAdminHttp(
    config,
    {
      ...base,
      method: 'POST',
      url: '/v1/admin/withdrawals/transfer-1/approve',
      headers: { ...base.headers, 'idempotency-key': 'approval-transfer-1' },
      payload: '{}',
    },
    { repository, authenticate },
  );
  assert.equal(response.statusCode, 200);
  assert.deepEqual(repository.approvals[0], [
    'transfer-1',
    'user-1',
    response.headers['x-request-id'],
    'approval-transfer-1',
  ]);
  const body = JSON.parse(response.body);
  assert.equal(body.status, 'approved');
  assert.equal(body.provider_submission, 'not_performed');
  assert.ok(repository.auditEntries.some((entry) => entry[1] === 'admin.withdrawal.approve'));
  assert.ok(
    repository.auditEntries.some(
      (entry) => entry[5]?.provider_submission === false && entry[5]?.settlement === false,
    ),
  );
});

test('withdrawal rejection remains fail closed until governed release policy is implemented', async () => {
  const repository = fakeRepository();
  const response = await executeAdminHttp(
    config,
    {
      ...base,
      method: 'POST',
      url: '/v1/admin/withdrawals/transfer-1/reject',
      headers: { ...base.headers, 'idempotency-key': 'rejection-transfer-1' },
      payload: '{}',
    },
    { repository, authenticate },
  );
  assert.equal(response.statusCode, 409);
  assert.equal(JSON.parse(response.body).error.code, 'withdrawal_rejection_unavailable');
  assert.ok(
    repository.auditEntries.some((entry) => String(entry[1]).includes('withdrawal.reject.blocked')),
  );
});

test('legacy allocation authorization remains fail closed and audited', async () => {
  const repository = fakeRepository();
  const response = await executeAdminHttp(
    config,
    {
      ...base,
      method: 'POST',
      url: '/v1/admin/allocations/allocation-1/approve',
      headers: { ...base.headers, 'idempotency-key': 'allocation-approval-1' },
      payload: '{}',
    },
    { repository, authenticate },
  );
  assert.equal(response.statusCode, 409);
  assert.equal(JSON.parse(response.body).error.code, 'allocation_authorization_unavailable');
  assert.ok(
    repository.auditEntries.some((entry) =>
      String(entry[1]).includes('allocation.approve.blocked'),
    ),
  );
});
