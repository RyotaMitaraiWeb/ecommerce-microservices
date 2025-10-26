import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  JsonWebTokenError,
  JwtModule,
  JwtService,
  TokenExpiredError,
} from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExtractClaimsFromTokenErrors } from './types/ExtractClaimsFromTokenErrors';
import { Result } from 'src/common/result/result';
import { Mapper } from 'src/common/mapper/Mapper';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
      imports: [JwtModule, ConfigModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    const configService = module.get(ConfigService);
    jest
      .spyOn(configService, 'getOrThrow')
      .mockReturnValue('mysel wkemkl wmekl wekm lkwem klwem klwmel kmwek mwlk');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractUserClaims', () => {
    it('Returns a payload when successful', async () => {
      // Arrange
      const mockResult = Result.ok(
        Mapper.auth.toUserClaims({ Id: '1', Email: 'abc@abc.com' }),
      );

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockResult.value);

      // Act
      const result = await service.extractUserClaims('Bearer jwt');

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).toMatchObject(mockResult.value);
    });
    it('Returns correct error when a JsonWebTokenError is thrown', async () => {
      // Arrange
      const spy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new JsonWebTokenError('JsonWebTokenError'));

      // Act
      const result = await service.extractUserClaims('Bearer jwt');

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error).toBe(
        ExtractClaimsFromTokenErrors.MalformedOrInvalidSignature,
      );
      expect(spy).toHaveBeenCalled();
    });

    it.each(['', 'Bearer ', null, undefined])(
      'Returns correct error when an empty token is provided',
      async (token?: string | null) => {
        // Arrange
        const spy = jest.spyOn(jwtService, 'verifyAsync');

        // Act
        const result = await service.extractUserClaims(token);

        // Assert
        expect(result.isErr).toBe(true);
        expect(result.error).toBe(ExtractClaimsFromTokenErrors.NoToken);
        expect(spy).not.toHaveBeenCalled();
      },
    );

    it('Returns correct error for an expired token', async () => {
      // Arrange
      const spy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(
          new TokenExpiredError('TokenExpiredError', new Date()),
        );

      // Act
      const result = await service.extractUserClaims('Bearer jwt');

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error).toBe(ExtractClaimsFromTokenErrors.Expired);
      expect(spy).toHaveBeenCalled();
    });

    it('Returns correct error when a non-handled error is thrown', async () => {
      // Arrange
      const spy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('unknown'));

      // Act
      const result = await service.extractUserClaims('Bearer jwt');

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error).toBe(ExtractClaimsFromTokenErrors.Unknown);
      expect(spy).toHaveBeenCalled();
    });
  });
});
