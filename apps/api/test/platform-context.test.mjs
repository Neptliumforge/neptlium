import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePlatformContext } from '../dist/platform-context.js';

const principal = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', provider: 'SUPABASE_AUTH', providerSubject: '11111111-1111-4111-8111-111111111111' };
const orgId = '22222222-2222-4222-8222-222222222222';
const platformOwnerId = '33333333-3333-4333-8333-333333333333';

test('individual context resolves from Supabase subject, not internal principal id', async () => {
  let seenUserId;
  const repository = {
    ready: async () => true,
    resolveIndividual: async (userId) => { seenUserId = userId; return { platformOwnerId, owner: { type: 'individual', id: userId } }; },
    resolveOrganization: async () => { throw new Error('unexpected'); },
  };
  const context = await resolvePlatformContext(principal, repository);
  assert.equal(seenUserId, principal.providerSubject);
  assert.notEqual(seenUserId, principal.id);
  assert.equal(context.actorPrincipalId, principal.id);
});

test('organization context requires exact auth subject and separates operator approval', async () => {
  let seen;
  const repository = {
    ready: async () => true,
    resolveIndividual: async () => { throw new Error('unexpected'); },
    resolveOrganization: async (userId, organizationId) => {
      seen = { userId, organizationId };
      return { owner: { platformOwnerId, owner: { type: 'organization', id: organizationId } }, membership: { organizationId, userId, role: 'operator', status: 'active' } };
    },
  };
  const context = await resolvePlatformContext(principal, repository, orgId);
  assert.deepEqual(seen, { userId: principal.providerSubject, organizationId: orgId });
  assert.equal(context.permissions.operate, true);
  assert.equal(context.permissions.approve, false);
});
