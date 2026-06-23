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
exports.CapacityQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const common_1 = require("@nestjs/common");
class CapacityQueryDto {
    requestedAt;
}
exports.CapacityQueryDto = CapacityQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-15T19:00:00.000Z',
        description: 'The specific date and time slot to evaluate seating capacity (ISO 8601 format)',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'Requested slot must be a valid ISO 8601 date string.' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        const targetDate = new Date(value);
        if (isNaN(targetDate.getTime())) {
            throw new common_1.BadRequestException('Provided timestamp evaluation failed structural parsing.');
        }
        if (targetDate.getTime() < Date.now()) {
            throw new common_1.BadRequestException('Cannot check availability for past dates.');
        }
        return value;
    }),
    __metadata("design:type", String)
], CapacityQueryDto.prototype, "requestedAt", void 0);
//# sourceMappingURL=capacity-query.dto.js.map