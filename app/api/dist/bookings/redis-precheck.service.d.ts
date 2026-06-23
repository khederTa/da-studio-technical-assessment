import { OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisPreCheckService implements OnModuleInit {
    private readonly redis;
    private allocatorScriptSha;
    private releaseScriptSha;
    private readonly allocatorScriptContent;
    private readonly releaseScriptContent;
    constructor(redis: Redis);
    onModuleInit(): Promise<void>;
    preCheckAndLease(restaurantId: string, dateSlot: string, partySize: number): Promise<number>;
    releaseLease(restaurantId: string, dateSlot: string, assignedTableSize: number): Promise<void>;
    invalidateSlot(restaurantId: string, dateSlot: string): Promise<void>;
    seedCacheSlot(restaurantId: string, dateSlot: string, tableLayout: any[], ttlSeconds?: number): Promise<void>;
}
