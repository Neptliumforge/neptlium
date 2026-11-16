import type { ClerkAccountCollisionStore } from './clerk-account-collision.js';

/** Server-only, read-only collision lookup. Never expose the service key to a browser. */
export class SupabaseClerkAccountCollisionStore implements ClerkAccountCollisionStore {
  constructor(
    private readonly url: string,
    private readonly serviceKey: string,
    private readonly request: typeof fetch = fetch,
  ) {
    if (!/^https:\/\//.test(url) || !serviceKey) throw new Error('identity collision store is not configured');
  }

  async findProfilesByNormalizedEmail(email: string): Promise<readonly { id: string }[]> {
    // This is only a preliminary read. A database transaction must recheck
    // collisions while holding appropriate locks before inserting an identity.
    const query = new URL('/rest/v1/profiles', this.url);
    query.searchParams.set('select', 'id,email');
    query.searchParams.set('limit', '1000');
    let response: Response;
    try {
      response = await this.request(query.toString(), {
        headers: { apikey: this.serviceKey, authorization: `Bearer ${this.serviceKey}` },
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new Error('identity collision lookup unavailable');
    }
    if (!response.ok) throw new Error('identity collision lookup unavailable');
    const rows: unknown = await response.json().catch(() => null);
    if (!Array.isArray(rows) || rows.length >= 1000) throw new Error('identity collision lookup incomplete');
    if (!rows.every(row => row && typeof row === 'object' && typeof row.id === 'string' && typeof row.email === 'string'))
      throw new Error('invalid identity collision response');
    return rows.filter(row => (row.email as string).trim().toLowerCase() === email).map(row => ({ id: row.id as string }));
  }
}
