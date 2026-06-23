import { ApiProperty } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty({ example: '65f1c2a3b4e5f6a7b8c9d0f9' })
  id!: string;

  @ApiProperty({ example: '65f1c2a3b4e5f6a7b8c9d0e1' })
  restaurantId!: string;

  @ApiProperty({ example: '2026-06-23T19:00:00.000Z' })
  dateSlot!: string;

  @ApiProperty({ example: 4 })
  partySize!: number;

  @ApiProperty({ example: 'CONFIRMED' })
  status!: string;
}