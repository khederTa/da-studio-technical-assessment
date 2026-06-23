import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiConflictResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from '../common/decorators/api-errors.decorator';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@ApiTooManyRequestsResponse()
@ApiUnauthorizedResponse()
@Throttle({ bookings: { limit: 10, ttl: 3600000, blockDuration: 3600000 } })
@UseGuards(AuthGuard('jwt'))
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Execute an atomic overbook-aware system reservation' })
  @ApiCreatedResponse({ 
    description: 'Booking successfully processed and tracked.', 
    type: BookingResponseDto 
  })
  @ApiConflictResponse({ description: 'The booking requested cannot be fulfilled due to strict capacity exhaustion.' })
  @ApiBadRequestResponse({ description: 'The structural format properties sent are invalid.' })
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: { user: { userId: string } }
  ): Promise<BookingResponseDto> {
    const result = await this.bookingsService.createBooking(req.user.userId, createBookingDto);

    return {
      id: result._id.toString(),
      restaurantId: result.restaurantId,
      dateSlot: result.dateSlot,
      partySize: result.partySize,
      status: result.status,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all bookings for the authenticated user' })
  @ApiOkResponse({ type: [BookingResponseDto] })
  async getUserBookings(
    @Request() req: { user: { userId: string } }
  ): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingsService.findByUser(req.user.userId);
    return bookings.map(b => ({
      id: b._id.toString(),
      restaurantId: b.restaurantId,
      dateSlot: b.dateSlot,
      partySize: b.partySize,
      status: b.status,
    }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an existing booking and release table capacity' })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiNotFoundResponse({ description: 'The specified booking ID does not exist.' })
  async cancelBooking(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } }
  ): Promise<BookingResponseDto> {
    const result = await this.bookingsService.cancelBooking(id, req.user.userId);
    return {
      id: result._id.toString(),
      restaurantId: result.restaurantId,
      dateSlot: result.dateSlot,
      partySize: result.partySize,
      status: result.status,
    };
  }
}
