import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetByIdErrors } from './types/GetByIdErrors';
import {
  deletedProfile,
  profile,
  unconfirmedProfile,
} from './test-utils/mocks';
import { profileRepositoryStub } from './test-utils/stubs';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let repository: Repository<Profile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesService, profileRepositoryStub],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    repository = module.get(getRepositoryToken(Profile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getById', () => {
    it('Returns does not exist error if it returns null', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result.error).toBe(GetByIdErrors.DoesNotExist);
    });

    it('Returns deleted error if it returns a deleted profile', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(deletedProfile);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result.error).toBe(GetByIdErrors.IsDeleted);
    });

    it('Returns not confirmed error if the profile is not confirmed', async () => {
      // Arrange
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValueOnce(unconfirmedProfile);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result.error).toBe(GetByIdErrors.NotConfirmed);
    });

    it('Returns a profile if one is found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(profile);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result.value.firstName).toBe(profile.firstName);
      expect(result.value.lastName).toBe(profile.lastName);
      expect(result.value.id).toBe(profile.id);
      expect(result.value.joinDate).toBe(profile.createdAt);
    });
  });
});
