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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const booking_response_dto_1 = require("./dto/booking-response.dto");
const api_errors_decorator_1 = require("../common/decorators/api-errors.decorator");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async createBooking(createBookingDto, req) {
        const result = await this.bookingsService.createBooking(req.user.userId, createBookingDto);
        return {
            id: result._id.toString(),
            restaurantId: result.restaurantId,
            dateSlot: result.dateSlot,
            partySize: result.partySize,
            status: result.status,
        };
    }
    async getUserBookings(req) {
        const bookings = await this.bookingsService.findByUser(req.user.userId);
        return bookings.map(b => ({
            id: b._id.toString(),
            restaurantId: b.restaurantId,
            dateSlot: b.dateSlot,
            partySize: b.partySize,
            status: b.status,
        }));
    }
    async cancelBooking(id, req) {
        const result = await this.bookingsService.cancelBooking(id, req.user.userId);
        return {
            id: result._id.toString(),
            restaurantId: result.restaurantId,
            dateSlot: result.dateSlot,
            partySize: result.partySize,
            status: result.status,
        };
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Execute an atomic overbook-aware system reservation' }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Booking successfully processed and tracked.',
        type: booking_response_dto_1.BookingResponseDto
    }),
    (0, swagger_1.ApiConflictResponse)({ description: 'The booking requested cannot be fulfilled due to strict capacity exhaustion.' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'The structural format properties sent are invalid.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve all bookings for the authenticated user' }),
    (0, swagger_1.ApiOkResponse)({ type: [booking_response_dto_1.BookingResponseDto] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getUserBookings", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an existing booking and release table capacity' }),
    (0, swagger_1.ApiOkResponse)({ type: booking_response_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'The specified booking ID does not exist.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancelBooking", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, api_errors_decorator_1.ApiTooManyRequestsResponse)(),
    (0, api_errors_decorator_1.ApiUnauthorizedResponse)(),
    (0, throttler_1.Throttle)({ bookings: { limit: 10, ttl: 3600000, blockDuration: 3600000 } }),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map