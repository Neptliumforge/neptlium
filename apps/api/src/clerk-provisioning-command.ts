import { verifyClerkJwtRs256, type ClerkJwtTrust } from './clerk-jwt-verifier.js';

/** Atomic persistence adapter, deliberately not implemented by generic REST inserts.
 * The implementation must use one reviewed database transaction with subject
 * uniqueness, principal lifecycle checks, and append-only audit evidence.
 */
export interface AtomicClerkProvisioningStore {
  provisionVerifiedSubject(subject: string, idempotencyKey: string): Promise<{
    principalId: string;
    replayed: boolean;
  }>;
}

export type ClerkProvisioningResult =
  | { readonly ok: true; readonly principalId: string; readonly replayed: boolean }
  | { readonly ok: false; readonly reason: 'not-preview' | 'invalid-token' | 'invalid-request' | 'storage-unavailable' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Never accepts a browser-supplied subject or principal ID. */
export async function provisionClerkPreviewIdentity(
  environment: string | undefined,
  token: string,
  idempotencyKey: string,
  trust: ClerkJwtTrust,
  store: AtomicClerkProvisioningStore,
): Promise<ClerkProvisioningResult> {
  if (environment !== 'preview') return { ok: false, reason: 'not-preview' };
  if (!/^[A-Za-z0-9:_-]{16,128}$/.test(idempotencyKey))
    return { ok: false, reason: 'invalid-request' };
  const verified = verifyClerkJwtRs256(token, trust);
  if (!verified.valid || !/^user_[A-Za-z0-9]{8,128}$/.test(verified.subject))
    return { ok: false, reason: 'invalid-token' };
  try {
    const result = await store.provisionVerifiedSubject(verified.subject, idempotencyKey);
    if (!result || !UUID.test(result.principalId) || typeof result.replayed !== 'boolean')
      return { ok: false, reason: 'storage-unavailable' };
    return { ok: true, principalId: result.principalId, replayed: result.replayed };
  } catch {
    return { ok: false, reason: 'storage-unavailable' };
  }
}
