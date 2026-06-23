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
exports.BookingsService = exports.TableAllocationEngine = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ioredis_1 = __importDefault(require("ioredis"));
const booking_schema_1 = require("./schemas/booking.schema");
const restaurant_schema_1 = require("../restaurants/schemas/restaurant.schema");
const inventory_schema_1 = require("./schemas/inventory.schema");
const redis_precheck_service_1 = require("./redis-precheck.service");
const redis_constants_1 = require("../redis/redis.constants");
let TableAllocationEngine = class TableAllocationEngine {
    restaurantModel;
    inventoryModel;
    constructor(restaurantModel, inventoryModel) {
        this.restaurantModel = restaurantModel;
        this.inventoryModel = inventoryModel;
    }
    async getOrInitializeInventory(restaurantId, dateSlot, session) {
        const query = this.inventoryModel.findOne({ restaurantId, dateSlot });
        if (session) {
            query.session(session);
        }
        let inventory = await query.exec();
        if (!inventory) {
            const restaurantQuery = this.restaurantModel.findById(restaurantId);
            if (session) {
                restaurantQuery.session(session);
            }
            const restaurant = await restaurantQuery.exec();
            if (!restaurant) {
                throw new common_1.NotFoundException('Target restaurant profile does not exist.');
            }
            const availableTables = restaurant.tables.map((table) => ({
                size: table.size,
                totalTables: table.count,
                reservedTables: 0,
            }));
            try {
                const createdDocs = await this.inventoryModel.create([
                    {
                        restaurantId,
                        dateSlot,
                        availableTables,
                    },
                ], session ? { session } : {});
                inventory = createdDocs[0];
            }
            catch (error) {
                const mongoError = error;
                if (mongoError.code === 11000) {
                    const retryQuery = this.inventoryModel.findOne({ restaurantId, dateSlot });
                    if (session) {
                        retryQuery.session(session);
                    }
                    inventory = await retryQuery.exec();
                }
                else {
                    throw error;
                }
            }
        }
        if (!inventory) {
            throw new common_1.ConflictException('Failed to resolve or initialize slot inventory details.');
        }
        return inventory;
    }
    async allocateBestFitTable(restaurantId, dateSlot, partySize, session) {
        const inventory = await this.getOrInitializeInventory(restaurantId, dateSlot, session);
        const sortedCandidates = inventory.availableTables
            .filter((t) => t.size >= partySize && t.reservedTables < t.totalTables)
            .sort((a, b) => a.size - b.size);
        if (sortedCandidates.length === 0) {
            throw new common_1.ConflictException('Reservation rejected: No physical tables can accommodate this party size for the selected slot.');
        }
        for (const candidate of sortedCandidates) {
            const targetSize = candidate.size;
            const updateQuery = this.inventoryModel.findOneAndUpdate({
                restaurantId,
                dateSlot,
                'availableTables.size': targetSize,
                $expr: {
                    $lt: [
                        {
                            $arrayElemAt: [
                                '$availableTables.reservedTables',
                                { $indexOfArray: ['$availableTables.size', targetSize] },
                            ],
                        },
                        {
                            $arrayElemAt: [
                                '$availableTables.totalTables',
                                { $indexOfArray: ['$availableTables.size', targetSize] },
                            ],
                        },
                    ],
                },
            }, {
                $inc: { 'availableTables.$[elem].reservedTables': 1 },
            }, {
                new: true,
                arrayFilters: [{ 'elem.size': targetSize }],
            });
            if (session) {
                updateQuery.session(session);
            }
            const updatedInventory = await updateQuery.exec();
            if (updatedInventory) {
                return targetSize;
            }
        }
        throw new common_1.ConflictException('Race condition conflict: Selected configurations were filled by competing requests. Please try again.');
    }
    async releaseTableAllocation(restaurantId, dateSlot, tableSize) {
        await this.inventoryModel.findOneAndUpdate({
            restaurantId,
            dateSlot,
            'availableTables.size': tableSize,
        }, {
            $inc: { 'availableTables.$[elem].reservedTables': -1 },
        }, {
            arrayFilters: [{ 'elem.size': tableSize }],
        }).exec();
    }
};
exports.TableAllocationEngine = TableAllocationEngine;
exports.TableAllocationEngine = TableAllocationEngine = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(restaurant_schema_1.Restaurant.name)),
    __param(1, (0, mongoose_1.InjectModel)(inventory_schema_1.Inventory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TableAllocationEngine);
let BookingsService = class BookingsService {
    bookingModel;
    allocationEngine;
    preCheckService;
    redis;
    constructor(bookingModel, allocationEngine, preCheckService, redis) {
        this.bookingModel = bookingModel;
        this.allocationEngine = allocationEngine;
        this.preCheckService = preCheckService;
        this.redis = redis;
    }
    async createBooking(userId, dto, session) {
        const { restaurantId, dateSlot, partySize, idempotencyKey } = dto;
        const existingBookingQuery = this.bookingModel.findOne({ idempotencyKey });
        if (session) {
            existingBookingQuery.session(session);
        }
        const existingBooking = await existingBookingQuery.exec();
        if (existingBooking) {
            return existingBooking;
        }
        let preCheckResult = await this.preCheckService.preCheckAndLease(restaurantId, dateSlot, partySize);
        if (preCheckResult === -2) {
            const dbInventory = await this.allocationEngine.getOrInitializeInventory(restaurantId, dateSlot, session);
            const cachePayload = dbInventory.availableTables.map(t => ({
                size: t.size,
                totalTables: t.totalTables,
                reservedTables: t.reservedTables
            }));
            await this.preCheckService.seedCacheSlot(restaurantId, dateSlot, cachePayload);
            preCheckResult = await this.preCheckService.preCheckAndLease(restaurantId, dateSlot, partySize);
        }
        if (preCheckResult === -1) {
            throw new common_1.ConflictException('Reservation rejected: Target configuration capacity limits reached.');
        }
        let assignedTableSize;
        try {
            assignedTableSize = await this.allocationEngine.allocateBestFitTable(restaurantId, dateSlot, partySize, session);
        }
        catch (dbError) {
            await this.preCheckService.releaseLease(restaurantId, dateSlot, preCheckResult);
            throw dbError;
        }
        const newBooking = await this.bookingModel.create([
            {
                idempotencyKey,
                userId,
                restaurantId,
                dateSlot,
                partySize,
                assignedTableSize,
                status: 'CONFIRMED',
            },
        ], session ? { session } : {});
        await this.invalidateRestaurantCaches(restaurantId, dateSlot);
        return newBooking[0];
    }
    async findByUser(userId) {
        return this.bookingModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }
    async cancelBooking(bookingId, userId) {
        const booking = await this.bookingModel.findById(bookingId).exec();
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found.');
        }
        if (booking.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own bookings.');
        }
        if (booking.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Booking is already cancelled.');
        }
        await this.allocationEngine.releaseTableAllocation(booking.restaurantId.toString(), booking.dateSlot, booking.assignedTableSize);
        await this.preCheckService.invalidateSlot(booking.restaurantId.toString(), booking.dateSlot);
        await this.invalidateRestaurantCaches(booking.restaurantId.toString(), booking.dateSlot);
        booking.status = 'CANCELLED';
        return booking.save();
    }
    async invalidateRestaurantCaches(restaurantId, dateSlot) {
        if (dateSlot) {
            await this.redis.del(`availability:${restaurantId}:${dateSlot}`);
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(3, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        TableAllocationEngine,
        redis_precheck_service_1.RedisPreCheckService,
        ioredis_1.default])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map