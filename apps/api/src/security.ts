import { ApiError } from './errors.js';
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
