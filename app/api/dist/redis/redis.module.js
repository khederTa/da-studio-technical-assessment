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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_constants_1 = require("./redis.constants");
const RedisProvider = {
    provide: redis_constants_1.REDIS_CLIENT,
    useFactory: () => {
        const redisInstance = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            reconnectOnError: (err) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
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
let RedisModule = class RedisModule {
    moduleRef;
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
    }
    async onApplicationShutdown() {
        const client = this.moduleRef.get(redis_constants_1.REDIS_CLIENT);
        if (client) {
            await client.quit();
            console.log('💤 Redis connection pool drained and terminated cleanly.');
        }
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [RedisProvider],
        exports: [redis_constants_1.REDIS_CLIENT],
    }),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], RedisModule);
//# sourceMappingURL=redis.module.js.map