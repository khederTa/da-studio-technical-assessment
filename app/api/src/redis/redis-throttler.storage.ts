import { Injectable, Inject } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const currentKey = `throttler:${key}:${throttlerName}`;
    const blockKey = `throttler:${key}:${throttlerName}:blocked`;

    const blockTtl = await this.redis.ttl(blockKey);
    if (blockTtl > 0) {
      const totalHits = await this.redis.get(currentKey);
      const timeToExpire = await this.redis.ttl(currentKey);
      return {
        totalHits: totalHits ? parseInt(totalHits, 10) : limit + 1,
        timeToExpire: Math.max(0, timeToExpire),
        isBlocked: true,
        timeToBlockExpire: blockTtl,
      };
    }

    const results = await this.redis
      .multi()
      .incr(currentKey)
      .ttl(currentKey)
      .exec();

    if (!results) {
      throw new Error('Redis rate limit transaction execution failed.');
    }

    const count = results[0][1] as number;
    let ttlSeconds = results[1][1] as number;

    if (ttlSeconds < 0) {
      ttlSeconds = Math.ceil(ttl / 1000);
      await this.redis.expire(currentKey, ttlSeconds);
    }

    let isBlocked = false;
    let timeToBlockExpire = 0;

    if (count > limit) {
      isBlocked = true;
      timeToBlockExpire = Math.ceil(blockDuration / 1000);
      await this.redis.set(blockKey, 1, 'EX', timeToBlockExpire);
    }

    return {
      totalHits: count,
      timeToExpire: Math.max(0, ttlSeconds),
      isBlocked,
      timeToBlockExpire,
    };
  }
}