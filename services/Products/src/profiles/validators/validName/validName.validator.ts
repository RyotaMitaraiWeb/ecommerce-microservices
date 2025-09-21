import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const NAME_REGEX = /^[\p{L}](?:[\p{L}\p{M}']*(?:[- ][\p{L}\p{M}']+)*)?$/u;

@ValidatorConstraint({ async: false })
class IsLegalNameConstraint implements ValidatorConstraintInterface {
  validate(name: never) {
    if (typeof name !== 'string') return false;
    return NAME_REGEX.test(name);
  }

  defaultMessage() {
    return 'Name must start and end with a letter and can only contain letters, spaces, hyphens, or apostrophes.';
  }
}

/**
 * Decorator to validate a legal first name internationally.
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
