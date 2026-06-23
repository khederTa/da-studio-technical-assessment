import { RestaurantsService } from './restaurants.service';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { CapacityQueryDto } from './dto/capacity-query.dto';
import { CapacityResponseDto } from './dto/capacity-response.dto';
export declare class RestaurantsController {
    private readonly restaurantsService;
    constructor(restaurantsService: RestaurantsService);
    getAllRestaurants(): Promise<RestaurantResponseDto[]>;
    getRestaurantById(id: string): Promise<RestaurantResponseDto>;
    getAvailability(id: string, query: CapacityQueryDto): Promise<CapacityResponseDto>;
}
