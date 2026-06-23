import { Model } from 'mongoose';
import Redis from 'ioredis';
import { RestaurantDocument } from './schemas/restaurant.schema';
import { BookingDocument } from '../bookings/schemas/booking.schema';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { CapacityResponseDto } from './dto/capacity-response.dto';
export declare class RestaurantsService {
    private readonly restaurantModel;
    private readonly bookingModel;
    private readonly redis;
    constructor(restaurantModel: Model<RestaurantDocument>, bookingModel: Model<BookingDocument>, redis: Redis);
    private mapToResponseDto;
    findAll(): Promise<RestaurantResponseDto[]>;
    findById(id: string): Promise<RestaurantResponseDto>;
    checkCapacity(id: string, requestedAt: string): Promise<CapacityResponseDto>;
}
