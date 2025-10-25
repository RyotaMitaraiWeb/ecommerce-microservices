import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import type { Request } from 'express';
import { errorMessages } from 'src/auth/constants/errorMessages';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { ConsumeMessage } from 'amqplib';
import { UnauthorizedRpcErrorResponse } from 'src/common/rpc/errors/UnauthorizedRpcErrorResponse';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    const requestType = context.getType();

    switch (requestType) {
      case 'http':
        await this.authenticateHttpRequest(context);
        break;
      case 'rpc':
        await this.authenticateRpcRequest(context);
        break;
    }

    return true;
  }

  private async authenticateHttpRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const bearerToken = request.headers.authorization;

    const result = await this.authService.extractUserClaims(bearerToken);

    if (result.isErr) {
      throw new UnauthorizedException(errorMessages[result.error]);
    }
  }

  private async authenticateRpcRequest(context: ExecutionContext) {
    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const message = rmqContext.getMessage() as ConsumeMessage;
    const headers = message.properties.headers;
    const bearerToken = headers?.authorization as string | undefined | null;

    const result = await this.authService.extractUserClaims(bearerToken);

    if (result.isErr) {
      throw new RpcException(
        new UnauthorizedRpcErrorResponse(errorMessages[result.error]),
      );
    }
  }
}
