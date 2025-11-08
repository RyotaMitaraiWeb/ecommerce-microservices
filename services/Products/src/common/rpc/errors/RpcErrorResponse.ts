import { HttpStatus } from '@nestjs/common';

export class RpcErrorResponse {
  statusCode: HttpStatus;
  message: string;

  constructor(message: string, statusCode: HttpStatus) {
    this.message = message;
    this.statusCode = statusCode;
  }
}
