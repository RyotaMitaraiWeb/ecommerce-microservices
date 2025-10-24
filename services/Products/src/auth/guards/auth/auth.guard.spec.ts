import { AuthGuard } from './auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Result } from 'src/common/result/result';
import { UserClaimsDto } from 'src/auth/dto/user-claims.dto';
import { AuthModule } from 'src/auth/auth.module';
import { ExtractClaimsFromTokenErrors } from 'src/auth/types/ExtractClaimsFromTokenErrors';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  const executionContext: ExecutionContext = {
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
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [AuthGuard],
    }).compile();

    guard = moduleRef.get(AuthGuard);
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

      await expect(
        async () => await guard.canActivate(executionContext),
      ).rejects.toThrow(UnauthorizedException);
    },
  );
});
