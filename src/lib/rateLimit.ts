/**
 * rateLimit.ts — IP-based rate limiting using Redis sorted sets.
 *
 * Each request increments a counter for the caller's IP inside a sliding-window.
 * If the count exceeds the limit within the window, the request is rejected (429).
 *
 * Usage:
 *   const limited = await rateLimit(req, 'checkout', 5, 60);
 *   if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

import { redis } from './redis';

/**
 * @param req       - The incoming Request object
 * @param prefix    - Namespace for the counter key (e.g. 'checkout', 'login')
 * @param limit     - Max number of requests allowed in the window
 * @param windowSec - Rolling window in seconds
 * @returns true if the caller should be rate-limited (rejected), false if OK
 */
export async function rateLimit(
  req: Request,
  prefix: string,
  limit: number,
  windowSec: number
): Promise<boolean> {
  if (!redis) return false; // Fail open when Redis is unavailable

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const key = `rl:${prefix}:${ip}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const pipeline = redis.pipeline();
  // Remove entries older than the window
  pipeline.zremrangebyscore(key, '-inf', now - windowMs);
  // Add current request with score = timestamp
  pipeline.zadd(key, now, `${now}`);
  // Count requests in window
  pipeline.zcard(key);
  // Auto-expire the key so it doesn't pile up in Redis
  pipeline.expire(key, windowSec + 1);

  const results = await pipeline.exec();
  // zcard result is index 2 in the pipeline
  const count = (results?.[2]?.[1] as number) ?? 0;
  return count > limit;
}
