import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabasePlatformCoreRepository } from '../dist/platform-core-repository.js';

const userId = '11111111-1111-4111-8111-111111111111';
const orgId = '22222222-2222-4222-8222-222222222222';
const ownerId = '33333333-3333-4333-8333-333333333333';

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function requestFor(routes) {
  return async (url) => {
    const parsed = new URL(url);
    const match = routes.find(([fragment]) => parsed.pathname.includes(fragment) && parsed.search.includes(fragment.includes('platform_owners') ? 'owner_type=' : ''));
    if (match) return response(match[1]);
    for (const [fragment, payload] of routes) if (url.includes(fragment)) return response(payload);
    return response({ error: 'not found' }, 404);
  };
}

test('resolves an active individual owner exactly', async () => {
  const repo = new SupabasePlatformCoreRepository('https://example.supabase.co', 'service-key', requestFor([
    ['platform_owners', [{ id: ownerId, owner_type: 'individual', individual_user_id: userId, organization_id: null, status: 'active' }]],
  ]));
  const result = await repo.resolveIndividual(userId);
  assert.deepEqual(result, { platformOwnerId: ownerId, owner: { type: 'individual', id: userId } });
});

test('rejects inactive individual owner', async () => {
  const repo = new SupabasePlatformCoreRepository('https://example.supabase.co', 'service-key', requestFor([
    ['platform_owners', [{ id: ownerId, owner_type: 'individual', individual_user_id: userId, organization_id: null, status: 'suspended' }]],
  ]));
  await assert.rejects(() => repo.resolveIndividual(userId), (error) => error?.status === 403 && error?.code === 'platform_owner_inactive');
});

test('organization resolution requires exact active membership', async () => {
  const repo = new SupabasePlatformCoreRepository('https://example.supabase.co', 'service-key', requestFor([
    ['platform_owners', [{ id: ownerId, owner_type: 'organization', individual_user_id: null, organization_id: orgId, status: 'active' }]],
    ['organization_memberships', [{ organization_id: orgId, user_id: userId, role: 'approver', status: 'active' }]],
  ]));
  const result = await repo.resolveOrganization(userId, orgId);
  assert.equal(result.owner.platformOwnerId, ownerId);
  assert.deepEqual(result.owner.owner, { type: 'organization', id: orgId });
  assert.equal(result.membership.role, 'approver');
});

test('organization resolution denies missing cross-organization membership', async () => {
  const repo = new SupabasePlatformCoreRepository('https://example.supabase.co', 'service-key', requestFor([
    ['platform_owners', [{ id: ownerId, owner_type: 'organization', individual_user_id: null, organization_id: orgId, status: 'active' }]],
    ['organization_memberships', []],
  ]));
  await assert.rejects(() => repo.resolveOrganization(userId, orgId), (error) => error?.status === 404 && error?.code === 'organization_scope_not_found');
});

test('organization resolution denies suspended membership', async () => {
  const repo = new SupabasePlatformCoreRepository('https://example.supabase.co', 'service-key', requestFor([
    ['platform_owners', [{ id: ownerId, owner_type: 'organization', individual_user_id: null, organization_id: orgId, status: 'active' }]],
    ['organization_memberships', [{ organization_id: orgId, user_id: userId, role: 'operator', status: 'suspended' }]],
  ]));
  await assert.rejects(() => repo.resolveOrganization(userId, orgId), (error) => error?.status === 403 && error?.code === 'organization_membership_inactive');
});

test('readiness fails closed if a control-plane primitive is unavailable', async () => {
  const request = async (url) => url.includes('canonical_assets') ? response({ error: 'missing' }, 404) : response([]);
  const repo = new SupabasePlatformCoreRepository('https://example.supabase.co', 'service-key', request);
  assert.equal(await repo.ready(), false);
});
