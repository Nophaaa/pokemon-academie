/**
 * Simple in-memory rate limiter for API routes.
 * Tracks request counts per IP within a sliding window.
 * Not suitable for multi-instance deployments — use Redis for that.
 */

const rateMap = new Map();

const CLEANUP_INTERVAL = 60_000; // Clean stale entries every 60s

// Periodic cleanup to prevent memory leaks
let cleanupTimer = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateMap) {
      if (now - entry.windowStart > entry.windowMs * 2) {
        rateMap.delete(key);
      }
    }
    if (rateMap.size === 0) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL);
  // Don't prevent Node.js from exiting
  if (cleanupTimer?.unref) cleanupTimer.unref();
}

/**
 * Check rate limit for a given request.
 * @param {Request} request — incoming Request object
 * @param {object} options
 * @param {number} options.limit — max requests per window (default: 60)
 * @param {number} options.windowMs — window duration in ms (default: 60000 = 1 min)
 * @returns {{ success: boolean, remaining: number, resetAt: number }}
 */
export function rateLimit(request, { limit = 60, windowMs = 60_000 } = {}) {
  ensureCleanup();

  // Extract IP from headers (works with Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const now = Date.now();
  const key = ip;

  let entry = rateMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now, windowMs };
    rateMap.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, limit - entry.count);
  const resetAt = entry.windowStart + windowMs;

  return {
    success: entry.count <= limit,
    remaining,
    resetAt,
  };
}

/**
 * Create rate-limited response headers.
 */
export function rateLimitHeaders(result) {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
