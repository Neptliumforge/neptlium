import type { AtomicClerkProvisioningStore } from './clerk-provisioning-command.js';

/** Server-only RPC adapter. The trusted caller must supply independently verified
 * Clerk subject AND verified primary email from Clerk's server API.
 * Never call this with browser-submitted email or an unsigned JWT email claim.
 * A link_required response is a denial, not a successful provisioning result.
 */
export class SupabaseAtomicClerkProvisioningStore implements AtomicClerkProvisioningStore {
  constructor(
    private readonly url: string,
    private readonly serviceKey: string,
    private readonly verifiedPrimaryEmail: (subject: string) => Promise<string>,
    private readonly request: typeof fetch = fetch,
  ) {
    if (!/^https:\/\//.test(url) || !serviceKey) throw new Error('atomic Clerk store not configured');
  }

  async provisionVerifiedSubject(subject: string, idempotencyKey: string): Promise<{ principalId: string; replayed: boolean }> {
    const email = await this.verifiedPrimaryEmail(subject);
    if (typeof email !== 'string' || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim()))
      throw new Error('verified primary email unavailable');
    const response = await this.request(new URL('/rest/v1/rpc/bootstrap_clerk_identity_principal', this.url).toString(), {
      method: 'POST',
      headers: {
        apikey: this.serviceKey,
        authorization: `Bearer ${this.serviceKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ p_clerk_subject: subject, p_verified_email: email.trim(), p_request_id: idempotencyKey }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('atomic Clerk bootstrap unavailable');
    const data: unknown = await response.json().catch(() => null);
    if (!data || typeof data !== 'object' || !('status' in data) || !('profile_id' in data))
      throw new Error('atomic Clerk bootstrap denied');
    const result = data as { status: unknown; profile_id: unknown };
    if ((result.status !== 'created' && result.status !== 'existing') || typeof result.profile_id !== 'string')
      throw new Error('atomic Clerk bootstrap denied');
    return { principalId: result.profile_id, replayed: result.status === 'existing' };
  }
}
