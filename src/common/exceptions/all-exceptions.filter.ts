import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { flatten } from 'lodash';
import { ValidationError } from 'class-validator';
import { ValidationUtility } from '../utilities/validation.utility';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = this.getStatusCode(exception);
    let errorMessages = [];

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorMessages = this.parseMessages(res);
    } else if (this.isValidationError(exception)) {
      errorMessages = ValidationUtility.parseErrors(exception);
    } else if (Array.isArray(exception)) {
      for (const item of exception) {
        errorMessages = [...errorMessages, ...this.parseMessages(item)];
      }
    } else {
      errorMessages = this.parseMessages(exception);
    }

    if (status >= 500) {
      Logger.error(exception.message || exception.toString(), exception.stack, 'AllExceptionsFilter');
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      message: flatten(errorMessages),
      data: null,
    };

    httpAdapter.reply(response, responseBody, status);
  }

  private parseMessages(data: any): string[] {
    if (typeof data === 'string') return [data];
    if (Array.isArray(data)) return data;
    if (typeof data?.getMessages === 'function') return data.getMessages();
    if (typeof data?.getMessage === 'function') return [data.getMessage()];
    if (typeof data?.message === 'string') return [data.message];
    return [data?.toString() || 'Unexpected error'];
  }

  private getStatusCode(exception: any): number {
    if (this.isValidationError(exception)) return 400;
    if (exception instanceof HttpException) return exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private isValidationError(exception: any): boolean {
    return Array.isArray(exception) && exception.length > 0 && exception[0] instanceof ValidationError;
  }
}
