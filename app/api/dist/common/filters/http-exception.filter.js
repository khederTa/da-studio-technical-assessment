"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    logger = new common_1.Logger('HttpExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorResponseDetails = 'InternalServerError';
        if (exception instanceof common_1.HttpException) {
            const resDetails = exception.getResponse();
            if (typeof resDetails === 'object' && resDetails !== null) {
                message = resDetails.message || JSON.stringify(resDetails);
                errorResponseDetails = resDetails.error || resDetails;
            }
            else {
                message = resDetails;
            }
        }
        else if (exception instanceof Error) {
            message = process.env.NODE_ENV === 'development' ? exception.message : 'An unexpected error occurred.';
            errorResponseDetails = exception.name;
        }
        const errorBody = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error: errorResponseDetails,
            message: message,
        };
        if (status >= 500) {
            this.logger.error(`💥 [${request.method}] ${request.url} failed with status ${status}`, exception instanceof Error ? exception.stack : JSON.stringify(exception));
        }
        else {
            this.logger.warn(`⚠️ [${request.method}] ${request.url} rejected with status ${status} - Message: ${JSON.stringify(message)}`);
        }
        response.status(status).json(errorBody);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map