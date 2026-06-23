import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class LoginDto {
  @ApiProperty({
    example: 'dev.kheder@example.com',
    description: 'The registered email address of the user account',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @Transform(({ value }) => typeof value === 'string' ? sanitizeHtml(value.toLowerCase().trim(), { allowedTags: [], allowedAttributes: {} }) : value)
  email!: string;

  @ApiProperty({
    example: 'P@ssword123!',
    description: 'The secure password corresponding to the user account',
  })
  @IsString()
  password!: string;
}