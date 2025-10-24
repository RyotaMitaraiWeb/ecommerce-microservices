import { AuthRpcGuard } from './auth-rpc.guard';
import { AuthService } from 'src/auth/auth.service';
import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Result } from 'src/common/result/result';
import { UserClaimsDto } from 'src/auth/dto/user-claims.dto';
import { ExtractClaimsFromTokenErrors } from 'src/auth/types/ExtractClaimsFromTokenErrors';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthGuard', () => {
  let guard: AuthRpcGuard;
  let authService: AuthService;

  const executionContext: ExecutionContext = {
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
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthRpcGuard, AuthService, JwtService, ConfigService],
    }).compile();

    guard = moduleRef.get(AuthRpcGuard);
    authService = moduleRef.get(AuthService);
  });

  it('should return true when AuthService validates the JWT', async () => {
    // Arrange
    jest
      .spyOn(authService, 'extractUserClaims')
      .mockResolvedValueOnce(Result.ok(new UserClaimsDto()));

    // Act
    const result = await guard.canActivate(executionContext);

    // Assert
    expect(result).toBe(true);
  });

  it.each([
    ExtractClaimsFromTokenErrors.Expired,
    ExtractClaimsFromTokenErrors.MalformedOrInvalidSignature,
    ExtractClaimsFromTokenErrors.NoToken,
    ExtractClaimsFromTokenErrors.Unknown,
  ])(
    'Throws correct exception for specific errors',
    async (error: ExtractClaimsFromTokenErrors) => {
      // Arrange
      jest
        .spyOn(authService, 'extractUserClaims')
        .mockResolvedValueOnce(Result.err(error));

      // Act & Assert

      await expect(
        async () => await guard.canActivate(executionContext),
      ).rejects.toThrow(RpcException);
    },
  );
});
