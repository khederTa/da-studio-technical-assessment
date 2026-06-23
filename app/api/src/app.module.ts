import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { SecurityThrottlerGuard } from './common/guards/security-throttler.guard';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { HealthModule } from './health/health.module';
import { BookingsModule } from './bookings/bookings.module';
import { RedisModule } from './redis/redis.module';
import { REDIS_CLIENT } from './redis/redis.constants';
import { RedisThrottlerStorage } from './redis/redis-throttler.storage';
import Redis from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
    }),

    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [REDIS_CLIENT],
      useFactory: (redisClient: Redis) => ({
        storage: new RedisThrottlerStorage(redisClient),
        throttlers: [
          {
            name: 'general',
            ttl: 60000,
            limit: 100,
            blockDuration: 60000,
          },
        ],
      }),
    }),

    AuthModule,

    RestaurantsModule,

    BookingsModule,

    RedisModule,

    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SecurityThrottlerGuard,
    },
  ],
})
export class AppModule {}