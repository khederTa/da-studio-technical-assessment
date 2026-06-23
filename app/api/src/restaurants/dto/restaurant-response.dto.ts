import { ApiProperty } from '@nestjs/swagger';

export class RestaurantResponseDto {
  @ApiProperty({ example: '65f1c2a3b4e5f6a7b8c9d0e1' })
  id!: string;

  @ApiProperty({ example: 'The Gourmet Bistro' })
  name!: string;

  @ApiProperty({ example: 'An exquisite fine dining experience.' })
  description!: string;

  @ApiProperty({ example: 'Italian' })
  cuisine!: string;

  @ApiProperty({ example: '123 Luxury Lane' })
  location!: string;

  @ApiProperty({ example: 'Dubai' })
  city!: string;

  @ApiProperty({ example: 120 })
  maxCapacity!: number;

  @ApiProperty({ example: ['Valet Parking', 'Wi-Fi', 'Outdoor Seating'] })
  amenities!: string[];
}