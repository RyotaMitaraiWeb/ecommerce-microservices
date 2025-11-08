import { ExtractClaimsFromTokenErrors } from '../types/ExtractClaimsFromTokenErrors';

export const errorMessages: Record<ExtractClaimsFromTokenErrors, string> = {
  [ExtractClaimsFromTokenErrors.Unknown]:
    'Something went wrong with validating your token, please try again or get a new token',
  [ExtractClaimsFromTokenErrors.MalformedOrInvalidSignature]:
    'Invalid or malformed token',
  [ExtractClaimsFromTokenErrors.Expired]:
    'Token has expired, please authenticate again',
  [ExtractClaimsFromTokenErrors.NoToken]:
    'No token provided, please authenticate',
};
