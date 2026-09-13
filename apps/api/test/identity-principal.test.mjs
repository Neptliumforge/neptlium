import assert from 'node:assert/strict';
import test from 'node:test';
import { SupabaseIdentityPrincipalResolver } from '../dist/identity-principal.js';

const principalId = '00000000-0000-4000-8000-000000000001';
const authSubject = '00000000-0000-4000-8000-000000000111';

function response(rows, ok = true) {
  return new Response(JSON.stringify(rows), {
    status: ok ? 200 : 503,
    headers: { 'content-type': 'application/json' },
  });
}

test('resolves an active Supabase Auth subject to the stable active Neptlium principal', async () => {
  const requests = [];
  const resolver = new SupabaseIdentityPrincipalResolver(
    'https://example.supabase.co',
    'server-secret',
    async (url, init) => {
      requests.push({ url: String(url), init });
      if (String(url).includes('identity_provider_subjects')) {
        return response([
          {
            principal_id: principalId,
            provider: 'SUPABASE_AUTH',
            provider_subject: authSubject,
            status: 'ACTIVE',
            linked_at: '2026-09-13T00:00:00.000Z',
          },
        ]);
      }
      return response([
        {
          id: principalId,
          status: 'ACTIVE',
          created_at: '2026-08-20T00:00:00.000Z',
          suspended_at: null,
          retired_at: null,
        },
      ]);
    },
  );

  const resolved = await resolver.resolveActivePrincipal('SUPABASE_AUTH', authSubject);
  assert.equal(resolved?.principal.id, principalId);
  assert.equal(resolved?.provider, 'SUPABASE_AUTH');
  assert.equal(resolved?.providerSubject, authSubject);
  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /status=eq\.ACTIVE/);
  assert.equal(new Headers(requests[0].init.headers).get('apikey'), 'server-secret');
});

test('fails closed for unknown, inactive, ambiguous, malformed, and unavailable identity state', async () => {
  const unknown = new SupabaseIdentityPrincipalResolver(
    'https://example.supabase.co',
    'server-secret',
    async () => response([]),
  );
  assert.equal(await unknown.resolveActivePrincipal('SUPABASE_AUTH', authSubject), null);

  const inactive = new SupabaseIdentityPrincipalResolver(
    'https://example.supabase.co',
    'server-secret',
    async (url) =>
      String(url).includes('identity_provider_subjects')
        ? response([
            {
              principal_id: principalId,
              provider: 'SUPABASE_AUTH',
              provider_subject: authSubject,
              status: 'ACTIVE',
              linked_at: '2026-09-13T00:00:00.000Z',
            },
          ])
        : response([]),
  );
  assert.equal(await inactive.resolveActivePrincipal('SUPABASE_AUTH', authSubject), null);

  const ambiguous = new SupabaseIdentityPrincipalResolver(
    'https://example.supabase.co',
    'server-secret',
    async () => response([{}, {}]),
  );
  await assert.rejects(
    () => ambiguous.resolveActivePrincipal('SUPABASE_AUTH', authSubject),
    (error) => error.code === 'identity_mapping_ambiguous',
  );

  await assert.rejects(
    () => unknown.resolveActivePrincipal('SUPABASE_AUTH', ` ${authSubject}`),
    (error) => error.code === 'invalid_identity_subject',
  );

  const unavailable = new SupabaseIdentityPrincipalResolver(
    'https://example.supabase.co',
    'server-secret',
    async () => response([], false),
  );
  await assert.rejects(
    () => unavailable.resolveActivePrincipal('SUPABASE_AUTH', authSubject),
    (error) => error.code === 'identity_storage_unavailable',
  );
});
