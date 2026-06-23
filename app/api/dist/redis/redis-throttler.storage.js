"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisThrottlerStorage = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_constants_1 = require("./redis.constants");
let RedisThrottlerStorage = class RedisThrottlerStorage {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async increment(key, ttl, limit, blockDuration, throttlerName) {
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
        const count = results[0][1];
        let ttlSeconds = results[1][1];
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
};
exports.RedisThrottlerStorage = RedisThrottlerStorage;
exports.RedisThrottlerStorage = RedisThrottlerStorage = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default])
], RedisThrottlerStorage);
//# sourceMappingURL=redis-throttler.storage.js.map