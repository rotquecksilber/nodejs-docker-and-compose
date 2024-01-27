import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ServerException } from '../exceptions/server.exception';
import { ErrorCode } from '../exceptions/error-codes';

@Catch(ServerException)
export class ServerExceptionFilter implements ExceptionFilter {
  catch(exception: ServerException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    const status = exception.getStatus();
    const message = exception.message || 'Internal server error';
    const errorCode: ErrorCode = exception.getErrorCode();
    const statusName = HttpStatus[status];

    response.status(status).json({
      errorCode: errorCode,
      statusCode: status,
      statusName: statusName,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
