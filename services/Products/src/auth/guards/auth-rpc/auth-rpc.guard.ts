import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { ConsumeMessage } from 'amqplib';
import { AuthService } from 'src/auth/auth.service';
import { errorMessages } from 'src/auth/constants/errorMessages';
import { UnauthorizedRpcErrorResponse } from 'src/common/rpc/errors/UnauthorizedRpcErrorResponse';

@Injectable()
export class AuthRpcGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    return true;
  }
}
