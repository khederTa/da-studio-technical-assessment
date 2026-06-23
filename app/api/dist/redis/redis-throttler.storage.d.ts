import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
export declare class RedisThrottlerStorage implements ThrottlerStorage {
    private readonly redis;
    constructor(redis: Redis);
    increment(key: string, ttl: number, limit: number, blockDuration: number, throttlerName: string): Promise<ThrottlerStorageRecord>;
}
