import { IsNotEmpty, IsString, IsEmail, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100, { message: 'Names must be constrained between 2 and 100 characters.' })
  @Matches(/^\p{L}+(?:[\s'-]\p{L}+)*$/u, { 
    message: 'Name can only contain alphabetic structures, spaces, hyphens, or apostrophes.' 
  })
  @Transform(({ value }) => typeof value === 'string' ? sanitizeHtml(value.trim(), { allowedTags: [], allowedAttributes: {} }) : value)
  name!: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'A structurally compliant email handle is required.' })
  @Transform(({ value }) => typeof value === 'string' ? sanitizeHtml(value.toLowerCase().trim(), { allowedTags: [], allowedAttributes: {} }) : value)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password must match complexity policies: minimum 8 characters, containing 1 uppercase letter and 1 number.',
  })
  password!: string;
}