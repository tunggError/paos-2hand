import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn("REDIS_URL is not set. Admin features won't work locally unless configured.");
}

export const redis = redisUrl ? new Redis(redisUrl) : null;
