import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { 
  ApiBadRequestResponse, 
  ApiUnauthorizedResponse, 
  ApiTooManyRequestsResponse 
} from '../common/decorators/api-errors.decorator';

@ApiTags('Authentication')
@ApiTooManyRequestsResponse()
@Throttle({ login: { limit: 5, ttl: 900000, blockDuration: 900000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new system user' })
  @ApiCreatedResponse({ 
    description: 'The user account has been successfully generated.', 
    type: UserResponseDto
  })
  @ApiBadRequestResponse()
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and issue tokens' })
  @ApiOkResponse({ 
    description: 'Authentication successful.', 
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}