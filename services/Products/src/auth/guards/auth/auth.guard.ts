import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { errorMessages } from 'src/auth/constants/errorMessages';
import { RpcException } from '@nestjs/microservices';
import { UnauthorizedRpcErrorResponse } from 'src/common/rpc/errors/UnauthorizedRpcErrorResponse';
import { extractBearerTokenFromExecutionContext } from 'src/auth/util/extractBearerTokenFromExecutionContext';
import { Result } from 'src/common/result/result';
import { ExtractClaimsFromTokenErrors } from 'src/auth/types/ExtractClaimsFromTokenErrors';
import { UserClaimsDto } from 'src/auth/dto/user-claims.dto';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    const bearerToken = extractBearerTokenFromExecutionContext(context);

    const result = await this.authService.extractUserClaims(bearerToken);

    if (result.isErr) {
      this.handleUnauthenticatedError(result, context);
    }

    this.attachUser(context, result.value);

    return true;
  }

  private handleUnauthenticatedError(
    result: Result<unknown, ExtractClaimsFromTokenErrors>,
    context: ExecutionContext,
  ) {
    const requestType = context.getType();

    switch (requestType) {
      case 'http':
        throw new UnauthorizedException(errorMessages[result.error]);
      case 'rpc':
        throw new RpcException(
          new UnauthorizedRpcErrorResponse(errorMessages[result.error]),
        );
      default:
        throw new Error('Unsupported or invalid request type');
    }
  }

  private attachUser(context: ExecutionContext, user: UserClaimsDto) {
    switch (context.getType()) {
      case 'http':
        context.switchToHttp().getRequest<Request>().user = user;
        break;
      case 'rpc':
        context.switchToRpc().getData<Record<string, unknown>>().user = user;
        break;
      default:
        throw new Error('Unsupported or invalid context type');
    }
  }
}
