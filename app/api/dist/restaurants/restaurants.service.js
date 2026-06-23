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
exports.RestaurantsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ioredis_1 = __importDefault(require("ioredis"));
const restaurant_schema_1 = require("./schemas/restaurant.schema");
const booking_schema_1 = require("../bookings/schemas/booking.schema");
const redis_constants_1 = require("../redis/redis.constants");
const AVAILABILITY_CACHE_TTL = 30;
let RestaurantsService = class RestaurantsService {
    restaurantModel;
    bookingModel;
    redis;
    constructor(restaurantModel, bookingModel, redis) {
        this.restaurantModel = restaurantModel;
        this.bookingModel = bookingModel;
        this.redis = redis;
    }
    mapToResponseDto(doc) {
        const calculatedMaxCapacity = doc.tables?.reduce((sum, t) => sum + (t.size * t.count), 0) || 0;
        const complexDoc = doc;
        const zoneLocation = complexDoc.zone || complexDoc.location || 'Theme Park Zone';
        return {
            id: doc._id.toString(),
            name: doc.name,
            description: complexDoc.description || 'Theme park dining experience.',
            cuisine: complexDoc.cuisine || 'International',
            location: zoneLocation,
            city: complexDoc.city || 'Theme Park',
            maxCapacity: calculatedMaxCapacity,
            amenities: complexDoc.amenities || [],
        };
    }
    async findAll() {
        const restaurants = await this.restaurantModel.find().exec();
        return restaurants.map((doc) => this.mapToResponseDto(doc));
    }
    async findById(id) {
        const restaurant = await this.restaurantModel.findById(id).exec();
        if (!restaurant) {
            throw new common_1.NotFoundException(`Restaurant with ID "${id}" not found.`);
        }
        return this.mapToResponseDto(restaurant);
    }
    async checkCapacity(id, requestedAt) {
        const restaurant = await this.restaurantModel.findById(id).exec();
        if (!restaurant) {
            throw new common_1.NotFoundException(`Restaurant with ID "${id}" not found.`);
        }
        const totalCapacity = restaurant.tables?.reduce((sum, t) => sum + (t.size * t.count), 0) || 0;
        const dateSlot = requestedAt;
        const cacheKey = `availability:${id}:${dateSlot}`;
        const cached = await this.redis.get(cacheKey).catch(() => null);
        if (cached) {
            return JSON.parse(cached);
        }
        const confirmedBookings = await this.bookingModel.find({
            restaurantId: id,
            dateSlot,
            status: 'CONFIRMED',
        }).exec();
        const tableCounts = {};
        for (const b of confirmedBookings) {
            tableCounts[b.assignedTableSize] = (tableCounts[b.assignedTableSize] || 0) + 1;
        }
        let currentOccupancy = 0;
        for (const [size, count] of Object.entries(tableCounts)) {
            currentOccupancy += Number(size) * count;
        }
        const availableSeats = totalCapacity - currentOccupancy;
        const result = {
            restaurantId: restaurant._id.toString(),
            requestedAt,
            totalCapacity,
            currentOccupancy,
            availableSeats,
            hasVacancy: availableSeats > 0,
        };
        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', AVAILABILITY_CACHE_TTL).catch(() => { });
        return result;
    }
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(restaurant_schema_1.Restaurant.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(2, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        ioredis_1.default])
], RestaurantsService);
//# sourceMappingURL=restaurants.service.js.map