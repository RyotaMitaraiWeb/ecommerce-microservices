import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Result } from 'src/common/result/result';
import { UserClaimsDto } from './dto/user-claims.dto';
import { ExtractClaimsFromTokenErrors } from './types/ExtractClaimsFromTokenErrors';
import { Mapper } from 'src/common/mapper/Mapper';

@Injectable()
export class AuthService {
  private get jwtSecret() {
    return this.configService.getOrThrow<string>('PRODUCTS_JWT_SECRET');
  }

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async extractUserClaims(
    jwt?: string | null,
  ): Promise<Result<UserClaimsDto, ExtractClaimsFromTokenErrors>> {
    const token = this.removeBearer(jwt);

    if (!token) {
      return Result.err(ExtractClaimsFromTokenErrors.NoToken);
    }

    try {
      const payload = await this.jwtService.verifyAsync<Record<string, string>>(
        token,
        {
          secret: this.jwtSecret,
        },
      );

      const result = Mapper.auth.toUserClaims(payload);

      return Result.ok(result);
    } catch (e: unknown) {
      if (e instanceof TokenExpiredError) {
        return Result.err(ExtractClaimsFromTokenErrors.Expired);
      }

      if (e instanceof JsonWebTokenError) {
        return Result.err(
          ExtractClaimsFromTokenErrors.MalformedOrInvalidSignature,
        );
      }

      return Result.err(ExtractClaimsFromTokenErrors.Unknown);
    }
  }

  private removeBearer(bearerToken?: string | null) {
    if (!bearerToken) {
      return '';
    }

    if (!bearerToken.startsWith('Bearer ')) {
      return '';
    }

    return bearerToken.replace('Bearer ', '');
  }
}
