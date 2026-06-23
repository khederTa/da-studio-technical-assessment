import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '60c72b2f9b1d8b2bad7f1234', description: 'The unique database ID' })
  id!: string;

  @ApiProperty({ example: 'Kheder Taleb', description: 'The full name of the user' })
  name!: string;

  @ApiProperty({ example: 'dev.kheder@example.com', description: 'The email address' })
  email!: string;

  @ApiProperty({ example: 'CASHIER', description: 'The user role' })
  role!: string;

  @ApiPropertyOptional({ example: '60c72b2f9b1d8b2bad7f1234', description: 'The associated scope user ID' })
  scopeUserId!: string;
}