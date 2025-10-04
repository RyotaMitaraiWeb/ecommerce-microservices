import { InitializeProfileResultDto } from 'src/profiles/dto/initialize-profile-result-dto';
import { ProfileDto } from 'src/profiles/dto/profile.dto';
import { Profile } from 'src/profiles/entities/profile.entity';

export const PROFILE_MAPPER = {
  toDto(profile: Profile) {
    const dto = new ProfileDto();
    dto.id = profile.id;
    dto.firstName = profile.firstName;
    dto.lastName = profile.lastName;
    dto.joinDate = profile.createdAt;

    return dto;
  },

  toInitializeResultDto(profile: Profile) {
    const dto = new InitializeProfileResultDto();
    dto.id = profile.id;
    dto.email = profile.email;

    return dto;
  },
};
