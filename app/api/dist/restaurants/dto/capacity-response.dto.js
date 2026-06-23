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
exports.CapacityResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CapacityResponseDto {
    restaurantId;
    requestedAt;
    totalCapacity;
    currentOccupancy;
    availableSeats;
    hasVacancy;
}
exports.CapacityResponseDto = CapacityResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1c2a3b4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], CapacityResponseDto.prototype, "restaurantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-15T19:00:00.000Z' }),
    __metadata("design:type", String)
], CapacityResponseDto.prototype, "requestedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120, description: 'Total capacity configuration of the restaurant' }),
    __metadata("design:type", Number)
], CapacityResponseDto.prototype, "totalCapacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Current allocated or reserved seats for this slot' }),
    __metadata("design:type", Number)
], CapacityResponseDto.prototype, "currentOccupancy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75, description: 'Remaining open seats available for booking' }),
    __metadata("design:type", Number)
], CapacityResponseDto.prototype, "availableSeats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Indicates if the restaurant can accommodate more guests' }),
    __metadata("design:type", Boolean)
], CapacityResponseDto.prototype, "hasVacancy", void 0);
//# sourceMappingURL=capacity-response.dto.js.map