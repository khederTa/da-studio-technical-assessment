import { Module, Global, Provider, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const redisInstance = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null, // Critical requirement for compatibility with queuing frameworks like BullMQ
      enableReadyCheck: true,
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Forces reconnection if an AWS/GCP Redis cluster promotes a replica during failure recovery
          return true; 
        }
        return false;
      },
    });

    redisInstance.on('error', (error) => {
      console.error(`❌ Redis Connection Error: ${error.message}`);
    });

    redisInstance.on('connect', () => {
      console.log('⚡ Redis connection successfully initiated.');
    });

    return redisInstance;
  },
};

@Global()
@Module({
  providers: [RedisProvider],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  // Enterprise Lifecycle Guard: Gracefully close active socket connections when the container terminates
  async onApplicationShutdown() {
    const client = this.moduleRef.get<Redis>(REDIS_CLIENT);
    if (client) {
      await client.quit();
      console.log('💤 Redis connection pool drained and terminated cleanly.');
    }
  }
}