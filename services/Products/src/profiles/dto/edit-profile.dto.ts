import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';

export class EditProfileDto extends PartialType(CreateProfileDto) {
  get isEmpty() {
    return Object.values(this).filter(Boolean).length === 0;
  }
}
