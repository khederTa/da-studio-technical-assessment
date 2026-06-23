import { Injectable, Inject, ConflictException, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';
import { REDIS_CLIENT } from '../redis/redis.constants';

@Injectable()
export class RedisPreCheckService implements OnModuleInit {
  private allocatorScriptSha!: string;
  private releaseScriptSha!: string;
  private readonly allocatorScriptContent: string;
  private readonly releaseScriptContent: string;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    const allocatorPath = path.join(__dirname, '../redis/scripts/allocator.lua');
    this.allocatorScriptContent = fs.readFileSync(allocatorPath, 'utf8');
    const releasePath = path.join(__dirname, '../redis/scripts/release-allocator.lua');
    this.releaseScriptContent = fs.readFileSync(releasePath, 'utf8');
  }

  async onModuleInit() {
    this.allocatorScriptSha = (await this.redis.script('LOAD', this.allocatorScriptContent)) as string;
    this.releaseScriptSha = (await this.redis.script('LOAD', this.releaseScriptContent)) as string;
  }

  async preCheckAndLease(restaurantId: string, dateSlot: string, partySize: number): Promise<number> {
    const cacheKey = `inventory:${restaurantId}:${dateSlot}`;

    try {
      const result = await this.redis.evalsha(this.allocatorScriptSha, 1, cacheKey, partySize);
      return Number(result);
    } catch (error: any) {
      if (error.message && error.message.includes('NOSCRIPT')) {
        this.allocatorScriptSha = (await this.redis.script('LOAD', this.allocatorScriptContent)) as string;
        const result = await this.redis.evalsha(this.allocatorScriptSha, 1, cacheKey, partySize);
        return Number(result);
      }
      throw error;
    }
  }

  async releaseLease(restaurantId: string, dateSlot: string, assignedTableSize: number): Promise<void> {
    const cacheKey = `inventory:${restaurantId}:${dateSlot}`;

    try {
      await this.redis.evalsha(this.releaseScriptSha, 1, cacheKey, assignedTableSize);
    } catch (error: any) {
      if (error.message && error.message.includes('NOSCRIPT')) {
        this.releaseScriptSha = (await this.redis.script('LOAD', this.releaseScriptContent)) as string;
        await this.redis.evalsha(this.releaseScriptSha, 1, cacheKey, assignedTableSize);
      }
    }
  }

  async invalidateSlot(restaurantId: string, dateSlot: string): Promise<void> {
    const cacheKey = `inventory:${restaurantId}:${dateSlot}`;
    await this.redis.del(cacheKey);
  }

  async seedCacheSlot(restaurantId: string, dateSlot: string, tableLayout: any[], ttlSeconds = 86400): Promise<void> {
    const cacheKey = `inventory:${restaurantId}:${dateSlot}`;
    await this.redis.set(cacheKey, JSON.stringify(tableLayout), 'EX', ttlSeconds);
  }
}