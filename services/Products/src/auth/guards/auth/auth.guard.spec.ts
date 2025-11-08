import { AuthGuard } from './auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Result } from 'src/common/result/result';
import { ExtractClaimsFromTokenErrors } from 'src/auth/types/ExtractClaimsFromTokenErrors';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import {
  httpExecutionContext,
  rpcExecutionContext,
  user,
} from 'src/auth/test-utils/mocks';
import { Request } from 'express';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  let request: Request;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthGuard, AuthService, JwtService, ConfigService],
    }).compile();

    guard = moduleRef.get(AuthGuard);
    authService = moduleRef.get(AuthService);
    request = {
      headers: {
        authorization: 'Bearer jwt',
      },
    } as Request;
  });

  it('should return true when AuthService validates the JWT (HTTP) and attaches it to the request', async () => {
    // Arrange

    const context = httpExecutionContext(request);
    jest
      .spyOn(authService, 'extractUserClaims')
      .mockResolvedValueOnce(Result.ok(user));

    // Act
    const result = await guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
    expect(request.user).toMatchObject(user);
  });

  it('should return true when AuthService validates the JWT (RPC)', async () => {
    // Arrange
    const data: Record<string, unknown> = {};
    const context = rpcExecutionContext(data);
    jest
      .spyOn(authService, 'extractUserClaims')
      .mockResolvedValueOnce(Result.ok(user));

    // Act
    const result = await guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
    expect(data.user).toMatchObject(user);
  });

  it.each([
    [
      ExtractClaimsFromTokenErrors.Expired,
      httpExecutionContext(),
      UnauthorizedException,
    ],
    [
      ExtractClaimsFromTokenErrors.MalformedOrInvalidSignature,
      httpExecutionContext(),
      UnauthorizedException,
    ],
    [
      ExtractClaimsFromTokenErrors.NoToken,
      httpExecutionContext(),
      UnauthorizedException,
    ],
    [
      ExtractClaimsFromTokenErrors.Unknown,
      httpExecutionContext(),
      UnauthorizedException,
    ],
    [ExtractClaimsFromTokenErrors.Expired, rpcExecutionContext(), RpcException],
    [
      ExtractClaimsFromTokenErrors.MalformedOrInvalidSignature,
      rpcExecutionContext(),
      RpcException,
    ],
    [ExtractClaimsFromTokenErrors.NoToken, rpcExecutionContext(), RpcException],
    [ExtractClaimsFromTokenErrors.Unknown, rpcExecutionContext(), RpcException],
  ])(
    'Throws correct exception for specific errors',
    async (
      error: ExtractClaimsFromTokenErrors,
      context: ExecutionContext,
      exception: typeof UnauthorizedException | typeof RpcException,
    ) => {
      // Arrange
      jest
        .spyOn(authService, 'extractUserClaims')
        .mockResolvedValueOnce(Result.err(error));

      // Act & Assert
      await expect(
        async () => await guard.canActivate(context),
      ).rejects.toThrow(exception);
    },
  );
});
