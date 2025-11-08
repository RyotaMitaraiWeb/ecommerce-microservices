import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';
import { UserClaimsDto } from '../dto/user-claims.dto';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    switch (context.getType()) {
      case 'http':
        return context.switchToHttp().getRequest<Request>().user;
      case 'rpc':
        return context.switchToRpc().getData<Record<string, UserClaimsDto>>()
          .user;
      default:
        throw new Error('Unsupported or invalid context type');
    }
  },
);
