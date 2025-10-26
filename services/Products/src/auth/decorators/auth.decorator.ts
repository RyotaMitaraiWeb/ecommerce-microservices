import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth/auth.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard),
    ApiBearerAuth('jwt'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
