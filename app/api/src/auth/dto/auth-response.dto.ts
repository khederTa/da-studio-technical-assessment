import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The issued runtime JSON Web Token',
  })
  access_token!: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'The authenticated user profile context',
  })
  user!: UserResponseDto;
}