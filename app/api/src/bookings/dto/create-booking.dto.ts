import { IsNotEmpty, IsString, IsInt, Min, IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  restaurantId!: string;

  @IsNotEmpty()
  @IsISO8601({}, { message: 'Date slot field must conform to a strict ISO 8601 string.' })
  @Transform(({ value }) => {
    const targetDate = new Date(value);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Provided timestamp evaluation failed structural parsing.');
    }
    if (targetDate.getTime() < Date.now()) {
      throw new BadRequestException('Reservation schedules cannot be initialized for past date matrices.');
    }
    return value;
  })
  dateSlot!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Every tracking allocation requires at least 1 guest seat.' })
  partySize!: number;

  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;
}