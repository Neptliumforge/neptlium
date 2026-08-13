import { ApiError } from './errors.js';
import { createHash } from 'node:crypto';
export interface RateLimiter {
  consume(
    key: string,
    limit: number,
    windowMs: number,
    now?: number,
  ): Promise<{ remaining: number; resetAt: number }>;
}
export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();
  async consume(key: string, limit: number, windowMs: number, now = Date.now()) {
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
    }
    bucket.count++;
    if (bucket.count > limit)
      throw new ApiError(429, 'rate_limited', 'Request rate limit exceeded', {
        retry_after_seconds: Math.ceil((bucket.resetAt - now) / 1000),
      });
    return { remaining: limit - bucket.count, resetAt: bucket.resetAt };
  }
}

type Fetch = typeof fetch;

/** Distributed fixed-window limiter backed by the service-role-only Supabase RPC. */
export class SupabaseRateLimiter implements RateLimiter {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {
    if (!url || !serviceRoleKey) throw new Error('Distributed rate limiter requires server credentials');
  }

  async consume(key: string, limit: number, windowMs: number) {
    const opaqueKey = createHash('sha256').update(key).digest('hex');
    let response: Response;
    try {
      response = await this.request(`${this.url}/rest/v1/rpc/consume_api_rate_limit`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.serviceRoleKey}`,
          apikey: this.serviceRoleKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ p_key: opaqueKey, p_limit: limit, p_window_ms: windowMs }),
        signal: AbortSignal.timeout(3_000),
      });
    } catch {
      throw new ApiError(503, 'rate_limit_unavailable', 'Request rate limiting is unavailable');
    }
    if (!response.ok)
      throw new ApiError(503, 'rate_limit_unavailable', 'Request rate limiting is unavailable');
    const rows = await response.json().catch(() => undefined) as
      | Array<{ allowed?: unknown; remaining?: unknown; reset_at?: unknown }>
      | undefined;
    const row = rows?.[0];
    const resetAt = typeof row?.reset_at === 'string' ? Date.parse(row.reset_at) : NaN;
    if (!row || typeof row.allowed !== 'boolean' || typeof row.remaining !== 'number' || !Number.isFinite(resetAt))
      throw new ApiError(503, 'rate_limit_unavailable', 'Request rate limiting is unavailable');
    if (!row.allowed)
      throw new ApiError(429, 'rate_limited', 'Request rate limit exceeded', {
        retry_after_seconds: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)),
      });
    return { remaining: row.remaining, resetAt };
  }
}
