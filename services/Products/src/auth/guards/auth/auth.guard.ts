import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import type { Request } from 'express';
import { errorMessages } from 'src/auth/constants/errorMessages';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    const request = context.switchToHttp().getRequest<Request>();
    const bearerToken = request.headers.authorization;

    const result = await this.authService.extractUserClaims(bearerToken);

    if (result.isErr) {
      throw new UnauthorizedException(errorMessages[result.error]);
    }

    return true;
  }
}
