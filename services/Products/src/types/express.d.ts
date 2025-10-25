import { UserClaims } from 'src/auth/dto/user-claims.dto';

declare global {
  namespace Express {
    export interface Request {
      user?: UserClaims;
    }
  }
}
