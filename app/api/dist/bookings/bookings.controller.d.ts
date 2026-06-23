import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    createBooking(createBookingDto: CreateBookingDto, req: {
        user: {
            userId: string;
        };
    }): Promise<BookingResponseDto>;
    getUserBookings(req: {
        user: {
            userId: string;
        };
    }): Promise<BookingResponseDto[]>;
    cancelBooking(id: string, req: {
        user: {
            userId: string;
        };
    }): Promise<BookingResponseDto>;
}
