import { DatabaseError } from 'pg';
import { QueryFailedError } from 'typeorm';
import { pgUniqueConstraintErrorCode } from './errorCodes';

export function isEmailIsAlreadyTakenError(error: unknown) {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as DatabaseError).code === pgUniqueConstraintErrorCode
  );
}
