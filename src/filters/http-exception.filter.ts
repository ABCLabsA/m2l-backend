import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseUtil } from '../common/interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = '服务器内部错误';
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // 处理验证错误
        if ((exceptionResponse as any).message) {
          if (Array.isArray((exceptionResponse as any).message)) {
            message = (exceptionResponse as any).message.join(', ');
          } else {
            message = (exceptionResponse as any).message;
          }
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
      'ExceptionFilter',
    );

    // 如果是验证错误，记录请求体
    if (exception instanceof BadRequestException) {
      this.logger.error(`请求体: ${JSON.stringify(request.body)}`);
    }

    // 返回统一格式的错误响应
    response
      .status(status)
      .json(ApiResponseUtil.error(status, message));
  }
} 