import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { nameErrorMessages } from 'src/profiles/constants/erroMessages';

const NAME_REGEX = /^[\p{L}](?:[\p{L}\p{M}']*(?:[- ][\p{L}\p{M}']+)*)?$/u;

@ValidatorConstraint({ async: false })
class IsLegalNameConstraint implements ValidatorConstraintInterface {
  validate(name: never) {
    if (typeof name !== 'string') return false;
    return NAME_REGEX.test(name);
  }

  defaultMessage() {
    return nameErrorMessages.illegal;
  }
}

/**
 * Decorator to validate a legal name internationally.
 */
export function IsLegalName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLegalNameConstraint,
    });
  };
}
