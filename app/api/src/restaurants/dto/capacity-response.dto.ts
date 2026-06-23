import { ApiProperty } from '@nestjs/swagger';

export class CapacityResponseDto {
  @ApiProperty({ example: '65f1c2a3b4e5f6a7b8c9d0e1' })
  restaurantId!: string;

  @ApiProperty({ example: '2026-07-15T19:00:00.000Z' })
  requestedAt!: string;

  @ApiProperty({ example: 120, description: 'Total capacity configuration of the restaurant' })
  totalCapacity!: number;

  @ApiProperty({ example: 45, description: 'Current allocated or reserved seats for this slot' })
  currentOccupancy!: number;

  @ApiProperty({ example: 75, description: 'Remaining open seats available for booking' })
  availableSeats!: number;

  @ApiProperty({ example: true, description: 'Indicates if the restaurant can accommodate more guests' })
  hasVacancy!: boolean;
}