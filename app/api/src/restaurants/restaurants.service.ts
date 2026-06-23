import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { CapacityResponseDto } from './dto/capacity-response.dto';
import { REDIS_CLIENT } from '../redis/redis.constants';

const AVAILABILITY_CACHE_TTL = 30;

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  private mapToResponseDto(doc: RestaurantDocument): RestaurantResponseDto {
    const calculatedMaxCapacity = doc.tables?.reduce((sum, t) => sum + (t.size * t.count), 0) || 0;

    const complexDoc = doc as any;
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

  async findAll(): Promise<RestaurantResponseDto[]> {
    const restaurants = await this.restaurantModel.find().exec();
    return restaurants.map((doc) => this.mapToResponseDto(doc));
  }

  async findById(id: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found.`);
    }

    return this.mapToResponseDto(restaurant);
  }

  async checkCapacity(id: string, requestedAt: string): Promise<CapacityResponseDto> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found.`);
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

    const tableCounts: Record<number, number> = {};
    for (const b of confirmedBookings) {
      tableCounts[b.assignedTableSize] = (tableCounts[b.assignedTableSize] || 0) + 1;
    }

    let currentOccupancy = 0;
    for (const [size, count] of Object.entries(tableCounts)) {
      currentOccupancy += Number(size) * count;
    }

    const availableSeats = totalCapacity - currentOccupancy;
    const result: CapacityResponseDto = {
      restaurantId: restaurant._id.toString(),
      requestedAt,
      totalCapacity,
      currentOccupancy,
      availableSeats,
      hasVacancy: availableSeats > 0,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', AVAILABILITY_CACHE_TTL).catch(() => {});

    return result;
  }

}
