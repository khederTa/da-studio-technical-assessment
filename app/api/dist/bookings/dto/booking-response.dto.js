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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class BookingResponseDto {
    id;
    restaurantId;
    dateSlot;
    partySize;
    status;
}
exports.BookingResponseDto = BookingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1c2a3b4e5f6a7b8c9d0f9' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1c2a3b4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "restaurantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-23T19:00:00.000Z' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "dateSlot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4 }),
    __metadata("design:type", Number)
], BookingResponseDto.prototype, "partySize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CONFIRMED' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "status", void 0);
//# sourceMappingURL=booking-response.dto.js.map