import { Model, ClientSession } from 'mongoose';
import Redis from 'ioredis';
import { BookingDocument } from './schemas/booking.schema';
import { RestaurantDocument } from '../restaurants/schemas/restaurant.schema';
import { InventoryDocument } from './schemas/inventory.schema';
import { RedisPreCheckService } from './redis-precheck.service';
export declare class TableAllocationEngine {
    private readonly restaurantModel;
    private readonly inventoryModel;
    constructor(restaurantModel: Model<RestaurantDocument>, inventoryModel: Model<InventoryDocument>);
    getOrInitializeInventory(restaurantId: string, dateSlot: string, session?: ClientSession): Promise<InventoryDocument>;
    allocateBestFitTable(restaurantId: string, dateSlot: string, partySize: number, session?: ClientSession): Promise<number>;
    releaseTableAllocation(restaurantId: string, dateSlot: string, tableSize: number): Promise<void>;
}
export declare class BookingsService {
    private readonly bookingModel;
    private readonly allocationEngine;
    private readonly preCheckService;
    private readonly redis;
    constructor(bookingModel: Model<BookingDocument>, allocationEngine: TableAllocationEngine, preCheckService: RedisPreCheckService, redis: Redis);
    createBooking(userId: string, dto: {
        restaurantId: string;
        dateSlot: string;
        partySize: number;
        idempotencyKey: string;
    }, session?: ClientSession): Promise<BookingDocument>;
    findByUser(userId: string): Promise<BookingDocument[]>;
    cancelBooking(bookingId: string, userId: string): Promise<BookingDocument>;
    private invalidateRestaurantCaches;
}
