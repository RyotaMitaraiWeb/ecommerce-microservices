import { AuthGuard } from './auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Result } from 'src/common/result/result';
import { UserClaimsDto } from 'src/auth/dto/user-claims.dto';
import { ExtractClaimsFromTokenErrors } from 'src/auth/types/ExtractClaimsFromTokenErrors';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  const httpExecutionContext: ExecutionContext = {
    switchToHttp() {
      return {
        getRequest() {
          return {
            headers: {
              authorization: 'Bearer jwt',
            },
          };
        },
      };
    },
    getType() {
      return 'http';
    },
  } as unknown as ExecutionContext;

  const rpcExecutionContext: ExecutionContext = {
    switchToRpc() {
      return {
        getContext() {
          return {
            getMessage() {
              return {
                properties: {
                  headers: {
                    authorization: 'Bearer jwt',
                  },
                },
              };
            },
          };
        },
      };
    },
    getType() {
      return 'rpc';
    },
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthGuard, AuthService, JwtService, ConfigService],
    }).compile();

    guard = moduleRef.get(AuthGuard);
    authService = moduleRef.get(AuthService);
  });

  it('should return true when AuthService validates the JWT (HTTP)', async () => {
    // Arrange
    jest
      .spyOn(authService, 'extractUserClaims')
      .mockResolvedValueOnce(Result.ok(new UserClaimsDto()));

    // Act
    const result = await guard.canActivate(httpExecutionContext);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true when AuthService validates the JWT (RPC)', async () => {
    // Arrange
    jest
      .spyOn(authService, 'extractUserClaims')
      .mockResolvedValueOnce(Result.ok(new UserClaimsDto()));

    // Act
    const result = await guard.canActivate(rpcExecutionContext);

    // Assert
    expect(result).toBe(true);
  });

  it.each([
    [
      ExtractClaimsFromTokenErrors.Expired,
      httpExecutionContext,
      UnauthorizedException,
    ],
    [
      ExtractClaimsFromTokenErrors.MalformedOrInvalidSignature,
      httpExecutionContext,
      UnauthorizedException,
    ],
    [
      ExtractClaimsFromTokenErrors.NoToken,
      httpExecutionContext,
      UnauthorizedException,
    ],
    [
      ExtractClaimsFromTokenErrors.Unknown,
      httpExecutionContext,
      UnauthorizedException,
    ],
    [ExtractClaimsFromTokenErrors.Expired, rpcExecutionContext, RpcException],
    [
      ExtractClaimsFromTokenErrors.MalformedOrInvalidSignature,
      rpcExecutionContext,
      RpcException,
    ],
    [ExtractClaimsFromTokenErrors.NoToken, rpcExecutionContext, RpcException],
    [ExtractClaimsFromTokenErrors.Unknown, rpcExecutionContext, RpcException],
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
