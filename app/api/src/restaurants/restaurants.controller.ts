import { Controller, Get, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { CapacityQueryDto } from './dto/capacity-query.dto';
import { CapacityResponseDto } from './dto/capacity-response.dto';
import { ApiTooManyRequestsResponse } from '../common/decorators/api-errors.decorator';

@ApiTags('Restaurants')
@ApiTooManyRequestsResponse()
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a list of all system restaurants' })
  @ApiOkResponse({ type: [RestaurantResponseDto] })
  async getAllRestaurants(): Promise<RestaurantResponseDto[]> {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get details of a specific restaurant by ID' })
  @ApiOkResponse({ type: RestaurantResponseDto })
  @ApiNotFoundResponse({ description: 'The specified restaurant ID does not exist.' })
  async getRestaurantById(@Param('id') id: string): Promise<RestaurantResponseDto> {
    return this.restaurantsService.findById(id);
  }

  @Get(':id/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Look up live seating availability and limits for a specific timeslot' })
  @ApiOkResponse({ type: CapacityResponseDto })
  @ApiNotFoundResponse({ description: 'The specified restaurant ID does not exist.' })
  async getAvailability(
    @Param('id') id: string,
    @Query() query: CapacityQueryDto,
  ): Promise<CapacityResponseDto> {
    return this.restaurantsService.checkCapacity(id, query.requestedAt);
  }
}
