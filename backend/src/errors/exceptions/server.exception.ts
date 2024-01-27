import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, code2message, code2status } from './error-codes';

export class ServerException extends HttpException {
  private readonly errorCode: ErrorCode;
  constructor(code: ErrorCode) {
    const message = code2message.get(code) || 'Unknown error';
    const status = code2status.get(code) || HttpStatus.INTERNAL_SERVER_ERROR;

    super(message, status);
    this.errorCode = code;
  }
  getErrorCode(): ErrorCode {
    return this.errorCode;
  }
}
