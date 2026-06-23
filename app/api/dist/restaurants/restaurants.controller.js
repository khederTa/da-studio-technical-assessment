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
exports.RestaurantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const restaurants_service_1 = require("./restaurants.service");
const restaurant_response_dto_1 = require("./dto/restaurant-response.dto");
const capacity_query_dto_1 = require("./dto/capacity-query.dto");
const capacity_response_dto_1 = require("./dto/capacity-response.dto");
const api_errors_decorator_1 = require("../common/decorators/api-errors.decorator");
let RestaurantsController = class RestaurantsController {
    restaurantsService;
    constructor(restaurantsService) {
        this.restaurantsService = restaurantsService;
    }
    async getAllRestaurants() {
        return this.restaurantsService.findAll();
    }
    async getRestaurantById(id) {
        return this.restaurantsService.findById(id);
    }
    async getAvailability(id, query) {
        return this.restaurantsService.checkCapacity(id, query.requestedAt);
    }
};
exports.RestaurantsController = RestaurantsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve a list of all system restaurants' }),
    (0, swagger_1.ApiOkResponse)({ type: [restaurant_response_dto_1.RestaurantResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getAllRestaurants", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a specific restaurant by ID' }),
    (0, swagger_1.ApiOkResponse)({ type: restaurant_response_dto_1.RestaurantResponseDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'The specified restaurant ID does not exist.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getRestaurantById", null);
__decorate([
    (0, common_1.Get)(':id/availability'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Look up live seating availability and limits for a specific timeslot' }),
    (0, swagger_1.ApiOkResponse)({ type: capacity_response_dto_1.CapacityResponseDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'The specified restaurant ID does not exist.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, capacity_query_dto_1.CapacityQueryDto]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getAvailability", null);
exports.RestaurantsController = RestaurantsController = __decorate([
    (0, swagger_1.ApiTags)('Restaurants'),
    (0, api_errors_decorator_1.ApiTooManyRequestsResponse)(),
    (0, common_1.Controller)('restaurants'),
    __metadata("design:paramtypes", [restaurants_service_1.RestaurantsService])
], RestaurantsController);
//# sourceMappingURL=restaurants.controller.js.map