import { HttpStatus } from '@nestjs/common';
import { RpcErrorResponse } from './RpcErrorResponse';

export class UnauthorizedRpcErrorResponse extends RpcErrorResponse {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
