"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiBadRequestResponse = ApiBadRequestResponse;
exports.ApiUnauthorizedResponse = ApiUnauthorizedResponse;
exports.ApiTooManyRequestsResponse = ApiTooManyRequestsResponse;
const swagger_1 = require("@nestjs/swagger");
function ApiBadRequestResponse() {
    return (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Validation failed or malformed payload.',
    });
}
function ApiUnauthorizedResponse() {
    return (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid credentials or missing token.',
    });
}
function ApiTooManyRequestsResponse() {
    return (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too Many Requests - Rate limit exceeded.',
    });
}
//# sourceMappingURL=api-errors.decorator.js.map