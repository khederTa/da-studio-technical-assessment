import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Restaurant, RestaurantSchema } from '../restaurants/schemas/restaurant.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService, TableAllocationEngine } from './bookings.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { RedisPreCheckService } from './redis-precheck.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    AuthModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, TableAllocationEngine, RedisPreCheckService],
  exports: [BookingsService],
})
export class BookingsModule {}