import { redis } from "../lib/redis";

export async function getCache<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
}

export async function setCache(key: string, value: unknown, ttlSeconds: number) {
    await redis.set(key, JSON.stringify(value), { expiration: { type: "EX", value: ttlSeconds } });
}
