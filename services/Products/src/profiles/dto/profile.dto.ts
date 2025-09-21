import { Profile } from '../entities/profile.entity';

export class ProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  joinDate: Date;

  static MapToDto(profile: Profile): ProfileDto {
    const dto = new ProfileDto();
    dto.id = profile.id;
    dto.firstName = profile.firstName;
    dto.lastName = profile.lastName;
    dto.joinDate = profile.createdAt;

    return dto;
  }
}
