import Redis from 'ioredis';
import { getSecret } from './secrets';

let redis: Redis | null = null;

async function getRedisClient(): Promise<Redis> {
  if (redis) return redis;

  const redisUrl = await getSecret('REDIS_URL');
  redis = new Redis(redisUrl);
  return redis;
}

/**
 * Wraps a fetch function with Redis caching.
 */
export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const client = await getRedisClient();
  const cached = await client.get(key);

  if (cached) {
    return JSON.parse(cached) as T;
  }

  const fresh = await fetchFn();
  await client.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  return fresh;
}

/**
 * Invalidates a specific cache key.
 */
export async function invalidateCache(key: string): Promise<void> {
  const client = await getRedisClient();
  await client.del(key);
}

/**
 * Invalidates all cache keys for a specific user.
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  const client = await getRedisClient();
  const stream = client.scanStream({
    match: `user:${userId}:*`,
    count: 100,
  });

  for await (const keys of stream) {
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}
