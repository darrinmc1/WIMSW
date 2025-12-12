/**
 * Caching utility for API responses
 * Uses Upstash Redis in production, in-memory cache in development
 */

import { Redis } from '@upstash/redis';

// Cache configuration
const CACHE_TTL = {
  MARKET_RESEARCH: 60 * 60 * 24, // 24 hours (market data doesn't change frequently)
  ANALYZE_ITEM: 60 * 60 * 24 * 7, // 7 days (item analysis is deterministic)
  SHORT: 60 * 15, // 15 minutes
} as const;

/**
 * In-memory cache for development
 */
class MemoryCache {
  private cache = new Map<string, { value: any; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  // Cleanup expired entries periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
  }
}

/**
 * Get cache client (Redis in production, memory in development)
 */
function getCacheClient() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken || redisUrl === 'memory') {
    console.log('💾 Using in-memory cache (development mode)');
    const memCache = new MemoryCache();
    memCache.startCleanup();
    return memCache;
  }

  console.log('💾 Using Redis cache (production mode)');
  return new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

const cache = getCacheClient();

/**
 * Generate cache key from item details
 */
export function generateCacheKey(prefix: string, data: any): string {
  // Create a deterministic key from the data
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  const hash = simpleHash(sortedData);
  return `${prefix}:${hash}`;
}

/**
 * Simple hash function for cache keys
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await cache.get<T>(key);
    if (cached) {
      console.log(`✅ Cache hit: ${key}`);
    }
    return cached;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached data
 */
export async function setCached(
  key: string,
  value: any,
  ttlSeconds: number = CACHE_TTL.MARKET_RESEARCH
): Promise<void> {
  try {
    await cache.set(key, value, ttlSeconds);
    console.log(`💾 Cached: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete cached data
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await cache.del(key);
    console.log(`🗑️  Cache deleted: ${key}`);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Cached wrapper for market research
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.MARKET_RESEARCH,
  bustCache: boolean = false
): Promise<T> {
  // Check cache first (unless cache busting)
  if (!bustCache) {
    const cached = await getCached<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  // Cache miss - fetch fresh data
  console.log(`❌ Cache miss: ${key} - fetching fresh data`);
  const data = await fetchFn();

  // Store in cache for next time
  await setCached(key, data, ttlSeconds);

  return data;
}

export { CACHE_TTL };
