"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const configuration_1 = __importDefault(require("./config/configuration"));
const env_validation_1 = require("./config/env.validation");
const security_throttler_guard_1 = require("./common/guards/security-throttler.guard");
const auth_module_1 = require("./auth/auth.module");
const restaurants_module_1 = require("./restaurants/restaurants.module");
const health_module_1 = require("./health/health.module");
const bookings_module_1 = require("./bookings/bookings.module");
const redis_module_1 = require("./redis/redis.module");
const redis_constants_1 = require("./redis/redis.constants");
const redis_throttler_storage_1 = require("./redis/redis-throttler.storage");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validationSchema: env_validation_1.envValidationSchema,
                validationOptions: {
                    allowUnknown: true,
                    abortEarly: true,
                },
            }),
            mongoose_1.MongooseModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    uri: configService.getOrThrow('MONGO_URI'),
                }),
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [redis_module_1.RedisModule],
                inject: [redis_constants_1.REDIS_CLIENT],
                useFactory: (redisClient) => ({
                    storage: new redis_throttler_storage_1.RedisThrottlerStorage(redisClient),
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
            auth_module_1.AuthModule,
            restaurants_module_1.RestaurantsModule,
            bookings_module_1.BookingsModule,
            redis_module_1.RedisModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: security_throttler_guard_1.SecurityThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map