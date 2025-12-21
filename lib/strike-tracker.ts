import { Redis } from '@upstash/redis';

const STRIKE_LIMIT = 3;
const STRIKE_EXPIRY = 3600; // 1 hour in seconds

// In-memory fallback for strike tracking
const inMemoryStrikes = new Map<string, { count: number; expiresAt: number }>();

/**
 * Get Redis client or null for in-memory fallback
 */
function getRedisClient(): Redis | null {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken || redisUrl === 'memory') {
    return null;
  }

  return new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

const redis = getRedisClient();

/**
 * Track invalid input attempts by identifier (IP or user ID)
 * Returns the current strike count after incrementing
 */
export async function trackStrike(identifier: string): Promise<number> {
  const key = `strikes:${identifier}`;

  try {
    if (redis) {
      // Use Redis for production
      const strikes = await redis.incr(key);

      // Set expiry on first strike
      if (strikes === 1) {
        await redis.expire(key, STRIKE_EXPIRY);
      }

      return strikes;
    } else {
      // Fallback to in-memory for development
      const now = Date.now();
      const existing = inMemoryStrikes.get(key);

      // Clean up expired entries
      if (existing && existing.expiresAt < now) {
        inMemoryStrikes.delete(key);
      }

      const current = inMemoryStrikes.get(key);
      if (current) {
        current.count++;
        return current.count;
      } else {
        inMemoryStrikes.set(key, {
          count: 1,
          expiresAt: now + (STRIKE_EXPIRY * 1000),
        });
        return 1;
      }
    }
  } catch (error) {
    console.error('Strike tracking error:', error);
    // Return 0 to allow the request if tracking fails
    return 0;
  }
}

/**
 * Get current strike count for an identifier
 */
export async function getStrikeCount(identifier: string): Promise<number> {
  const key = `strikes:${identifier}`;

  try {
    if (redis) {
      const strikes = await redis.get(key);
      return strikes ? parseInt(strikes as string, 10) : 0;
    } else {
      const now = Date.now();
      const existing = inMemoryStrikes.get(key);

      if (!existing || existing.expiresAt < now) {
        return 0;
      }

      return existing.count;
    }
  } catch (error) {
    console.error('Strike count retrieval error:', error);
    return 0;
  }
}

/**
 * Check if an identifier has exceeded the strike limit
 */
export async function isBlocked(identifier: string): Promise<boolean> {
  const count = await getStrikeCount(identifier);
  return count >= STRIKE_LIMIT;
}

/**
 * Reset strikes for an identifier (useful for testing or admin actions)
 */
export async function resetStrikes(identifier: string): Promise<void> {
  const key = `strikes:${identifier}`;

  try {
    if (redis) {
      await redis.del(key);
    } else {
      inMemoryStrikes.delete(key);
    }
  } catch (error) {
    console.error('Strike reset error:', error);
  }
}

/**
 * Get time remaining until strikes expire (in seconds)
 */
export async function getStrikeTimeRemaining(identifier: string): Promise<number> {
  const key = `strikes:${identifier}`;

  try {
    if (redis) {
      const ttl = await redis.ttl(key);
      return ttl > 0 ? ttl : 0;
    } else {
      const existing = inMemoryStrikes.get(key);
      if (!existing) return 0;

      const remaining = Math.floor((existing.expiresAt - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
  } catch (error) {
    console.error('Strike TTL retrieval error:', error);
    return 0;
  }
}

// Cleanup in-memory strikes periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of inMemoryStrikes.entries()) {
      if (value.expiresAt < now) {
        inMemoryStrikes.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
