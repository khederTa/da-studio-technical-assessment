import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiBadRequestResponse() {
  return ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed or malformed payload.',
  });
}

export function ApiUnauthorizedResponse() {
  return ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials or missing token.',
  });
}

export function ApiTooManyRequestsResponse() {
  return ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded.',
  });
}