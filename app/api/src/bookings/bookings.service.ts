import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import Redis from 'ioredis';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { Restaurant, RestaurantDocument } from '../restaurants/schemas/restaurant.schema';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { RedisPreCheckService } from './redis-precheck.service';
import { REDIS_CLIENT } from '../redis/redis.constants';

@Injectable()
export class TableAllocationEngine {
  constructor(
    @InjectModel(Restaurant.name) private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Inventory.name) private readonly inventoryModel: Model<InventoryDocument>,
  ) {}

  async getOrInitializeInventory(
    restaurantId: string,
    dateSlot: string,
    session?: ClientSession,
  ): Promise<InventoryDocument> {
    const query = this.inventoryModel.findOne({ restaurantId, dateSlot });
    if (session) {
      query.session(session);
    }
    let inventory: InventoryDocument | null = await query.exec();

    if (!inventory) {
      const restaurantQuery = this.restaurantModel.findById(restaurantId);
      if (session) {
        restaurantQuery.session(session);
      }
      const restaurant = await restaurantQuery.exec();

      if (!restaurant) {
        throw new NotFoundException('Target restaurant profile does not exist.');
      }

      const availableTables = restaurant.tables.map((table) => ({
        size: table.size,
        totalTables: table.count,
        reservedTables: 0,
      }));

      try {
        const createdDocs = await this.inventoryModel.create(
          [
            {
              restaurantId,
              dateSlot,
              availableTables,
            },
          ],
          session ? { session } : {},
        );
        inventory = createdDocs[0] as unknown as InventoryDocument;
      } catch (error) {
        const mongoError = error as { code?: number };
        if (mongoError.code === 11000) {
          const retryQuery = this.inventoryModel.findOne({ restaurantId, dateSlot });
          if (session) {
            retryQuery.session(session);
          }
          inventory = await retryQuery.exec();
        } else {
          throw error;
        }
      }
    }

    if (!inventory) {
      throw new ConflictException('Failed to resolve or initialize slot inventory details.');
    }

    return inventory;
  }

  async allocateBestFitTable(
    restaurantId: string,
    dateSlot: string,
    partySize: number,
    session?: ClientSession,
  ): Promise<number> {
    const inventory = await this.getOrInitializeInventory(restaurantId, dateSlot, session);

    const sortedCandidates = inventory.availableTables
      .filter((t) => t.size >= partySize && t.reservedTables < t.totalTables)
      .sort((a, b) => a.size - b.size);

    if (sortedCandidates.length === 0) {
      throw new ConflictException(
        'Reservation rejected: No physical tables can accommodate this party size for the selected slot.',
      );
    }

    for (const candidate of sortedCandidates) {
      const targetSize = candidate.size;

      const updateQuery = this.inventoryModel.findOneAndUpdate(
        {
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
        },
        {
          $inc: { 'availableTables.$[elem].reservedTables': 1 },
        },
        {
          new: true,
          arrayFilters: [{ 'elem.size': targetSize }],
        },
      );

      if (session) {
        updateQuery.session(session);
      }

      const updatedInventory = await updateQuery.exec();

      if (updatedInventory) {
        return targetSize;
      }
    }

    throw new ConflictException(
      'Race condition conflict: Selected configurations were filled by competing requests. Please try again.',
    );
  }

  async releaseTableAllocation(
    restaurantId: string,
    dateSlot: string,
    tableSize: number,
  ): Promise<void> {
    await this.inventoryModel.findOneAndUpdate(
      {
        restaurantId,
        dateSlot,
        'availableTables.size': tableSize,
      },
      {
        $inc: { 'availableTables.$[elem].reservedTables': -1 },
      },
      {
        arrayFilters: [{ 'elem.size': tableSize }],
      },
    ).exec();
  }
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    private readonly allocationEngine: TableAllocationEngine,
    private readonly preCheckService: RedisPreCheckService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async createBooking(
    userId: string, 
    dto: { restaurantId: string; dateSlot: string; partySize: number; idempotencyKey: string }, 
    session?: ClientSession
  ): Promise<BookingDocument> {
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
      throw new ConflictException('Reservation rejected: Target configuration capacity limits reached.');
    }

    let assignedTableSize: number;
    try {
      assignedTableSize = await this.allocationEngine.allocateBestFitTable(
        restaurantId,
        dateSlot,
        partySize,
        session
      );
    } catch (dbError) {
      await this.preCheckService.releaseLease(restaurantId, dateSlot, preCheckResult);
      throw dbError;
    }

    const newBooking = await this.bookingModel.create(
      [
        {
          idempotencyKey,
          userId,
          restaurantId,
          dateSlot,
          partySize,
          assignedTableSize,
          status: 'CONFIRMED',
        },
      ],
      session ? { session } : {},
    );

    await this.invalidateRestaurantCaches(restaurantId, dateSlot);

    return newBooking[0];
  }

  async findByUser(userId: string): Promise<BookingDocument[]> {
    return this.bookingModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async cancelBooking(bookingId: string, userId: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings.');
    }
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled.');
    }

    await this.allocationEngine.releaseTableAllocation(
      booking.restaurantId.toString(),
      booking.dateSlot,
      booking.assignedTableSize,
    );

    await this.preCheckService.invalidateSlot(booking.restaurantId.toString(), booking.dateSlot);

    await this.invalidateRestaurantCaches(booking.restaurantId.toString(), booking.dateSlot);

    booking.status = 'CANCELLED';
    return booking.save();
  }

  private async invalidateRestaurantCaches(restaurantId: string, dateSlot?: string): Promise<void> {
    if (dateSlot) {
      await this.redis.del(`availability:${restaurantId}:${dateSlot}`);
    }
  }
}
