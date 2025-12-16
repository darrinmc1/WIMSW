/**
 * Rate limiting using Upstash Redis
 * This implementation works in serverless environments (Vercel, AWS Lambda, etc.)
 *
 * For development without Redis, set UPSTASH_REDIS_REST_URL to "memory" to use in-memory fallback
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * In-memory fallback for development (when Redis is not configured)
 */
class MemoryRatelimit {
  private store = new Map<string, { count: number; resetTime: number }>();
  private maxRequests: number;
  private interval: number;

  constructor(config: { maxRequests: number; window: string }) {
    this.maxRequests = config.maxRequests;
    // Parse window string like "60 s" or "1 m"
    const [value, unit] = config.window.split(" ");
    this.interval = parseInt(value) * (unit === "m" ? 60000 : 1000);

    // Clean up old entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (now > value.resetTime) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  async limit(identifier: string) {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.interval;
      this.store.set(identifier, { count: 1, resetTime });
      return {
        success: true,
        remaining: this.maxRequests - 1,
        reset: new Date(resetTime),
        limit: this.maxRequests,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: new Date(entry.resetTime),
        limit: this.maxRequests,
      };
    }

    entry.count++;
    this.store.set(identifier, entry);
    return {
      success: true,
      remaining: this.maxRequests - entry.count,
      reset: new Date(entry.resetTime),
      limit: this.maxRequests,
    };
  }
}

/**
 * Create Redis client or fallback to memory
 */
function createRateLimiter(maxRequests: number, windowString: string) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Use in-memory fallback if Redis is not configured or explicitly set to "memory"
  if (!redisUrl || !redisToken || redisUrl === "memory") {
    console.warn(
      "⚠️  Using in-memory rate limiting (not suitable for production). " +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production."
    );
    return new MemoryRatelimit({ maxRequests, window: windowString });
  }

  // Use Upstash Redis for production
  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, windowString as any), // Cast to any as Upstash Duration type is complex
    analytics: true,
    prefix: "wimsw",
  });
}

// Create rate limiters for different API endpoints
export const analyzeItemLimiter = createRateLimiter(5, "1 m"); // 5 requests per minute (authenticated users)
export const freeUserLimiter = createRateLimiter(2, "24 h"); // 2 requests per day (free/unauthenticated users)
export const marketResearchLimiter = createRateLimiter(10, "1 m"); // 10 requests per minute
export const generalLimiter = createRateLimiter(30, "1 m"); // 30 requests per minute

/**
 * Rate limit a request
 */
export async function rateLimit(
  identifier: string,
  limiter: typeof analyzeItemLimiter = generalLimiter
): Promise<{
  success: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}> {
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    resetTime: typeof result.reset === 'number' ? result.reset : result.reset.getTime(),
    limit: result.limit,
  };
}

/**
 * Get client identifier from request
 * Uses IP address with user-agent as fallback for better identification
 */
export function getClientIdentifier(req: Request): string {
  // Try to get IP from various headers (Vercel, Cloudflare, general)
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  const vercelIp = req.headers.get("x-vercel-forwarded-for");

  const ip =
    vercelIp ||
    cfConnectingIp ||
    forwarded?.split(",")[0].trim() ||
    realIp ||
    "unknown";

  // Add user-agent hash for better identification when IP is shared
  const userAgent = req.headers.get("user-agent") || "";
  const uaHash = userAgent ? simpleHash(userAgent).toString(36).slice(0, 6) : "";

  return `${ip}_${uaHash}`;
}

/**
 * Simple hash function for user-agent
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
