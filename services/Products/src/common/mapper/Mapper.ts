import { PROFILE_MAPPER } from './props/PROFILE_MAPPER';
import { UserClaimsDto } from 'src/auth/dto/user-claims.dto';

const AUTH_MAPPER = {
  toUserClaims(payload: Record<string, string>) {
    const { Email, Id } = payload;

    if (!Email) {
      throw new Error('No email found in the payload');
    }

    if (!Id) {
      throw new Error('No ID found in the payload');
    }

    const userClaims = new UserClaimsDto();
    userClaims.email = Email;
    userClaims.id = Id;

    return userClaims;
  },
};

export class Mapper {
  static profile = PROFILE_MAPPER;
  static auth = AUTH_MAPPER;
}
