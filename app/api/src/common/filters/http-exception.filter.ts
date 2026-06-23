import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let errorResponseDetails: string | object = 'InternalServerError';

    if (exception instanceof HttpException) {
      const resDetails = exception.getResponse();
      if (typeof resDetails === 'object' && resDetails !== null) {
        message = (resDetails as any).message || JSON.stringify(resDetails);
        errorResponseDetails = (resDetails as any).error || resDetails;
      } else {
        message = resDetails;
      }
    } else if (exception instanceof Error) {
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
      this.logger.error(
        `💥 [${request.method}] ${request.url} failed with status ${status}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `⚠️ [${request.method}] ${request.url} rejected with status ${status} - Message: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorBody);
  }
}