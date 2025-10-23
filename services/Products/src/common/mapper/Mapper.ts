import { PROFILE_MAPPER } from './props/PROFILE_MAPPER';
import { UserClaimsDto } from 'src/auth/dto/user-claims.dto';

const AUTH_MAPPER = {
  toUserClaims(payload: Record<string, string>) {
    const { email, id } = payload;

    if (!email) {
      throw new Error('No email found in the payload');
    }

    if (!id) {
      throw new Error('No ID found in the payload');
    }

    const userClaims = new UserClaimsDto();
    userClaims.email = email;
    userClaims.id = id;

    return userClaims;
  },
};

export class Mapper {
  static profile = PROFILE_MAPPER;
  static auth = AUTH_MAPPER;
}
