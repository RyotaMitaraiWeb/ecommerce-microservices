import { MaxLength, MinLength } from 'class-validator';
import {
  firstNameValidationRules,
  lastNameValidationRules,
} from '../constants/validationRules';
import { IsLegalName } from '../validators/validName/validName.validator';

export class CreateProfileDto {
  @MaxLength(firstNameValidationRules.maxLength)
  @MinLength(firstNameValidationRules.minLength)
  @IsLegalName()
  firstName: string;

  @MaxLength(lastNameValidationRules.maxLength)
  @MinLength(lastNameValidationRules.minLength)
  @IsLegalName()
  lastName: string;
}
