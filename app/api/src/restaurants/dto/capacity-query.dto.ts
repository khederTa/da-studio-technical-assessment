import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class CapacityQueryDto {
  @ApiProperty({
    example: '2026-07-15T19:00:00.000Z',
    description: 'The specific date and time slot to evaluate seating capacity (ISO 8601 format)',
  })
  @IsNotEmpty()
  @IsISO8601({}, { message: 'Requested slot must be a valid ISO 8601 date string.' })
  @Transform(({ value }) => {
    const targetDate = new Date(value);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Provided timestamp evaluation failed structural parsing.');
    }
    if (targetDate.getTime() < Date.now()) {
      throw new BadRequestException('Cannot check availability for past dates.');
    }
    return value;
  })
  requestedAt!: string;
}