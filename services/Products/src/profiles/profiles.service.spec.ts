import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetByIdErrors } from './types/GetByIdErrors';
import {
  createProfileBody,
  editProfileBody,
  profile,
  unconfirmedProfile,
} from './test-utils/mocks';
import { profileRepositoryStub } from './test-utils/stubs';
import { ProfileDto } from './dto/profile.dto';
import { CreateErrors } from './types/CreateErrors';
import { EditErrors } from './types/EditErrors';
import { DeleteErrors } from './types/DeleteErrors';

// Prevent state mutation from polluting our tests;
const unconfirmedProfileCopy = { ...unconfirmedProfile };
function provideUnconfirmedProfile() {
  return { ...unconfirmedProfileCopy };
}

const confirmedProfileCopy = { ...profile };
function provideConfirmedProfile() {
  return { ...confirmedProfileCopy };
}

describe('ProfilesService', () => {
  let service: ProfilesService;
  let repository: Repository<Profile>;
  const today = new Date(Date.now());

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesService, profileRepositoryStub],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    repository = module.get(getRepositoryToken(Profile));
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('get', () => {
    it('Returns an array of profiles', async () => {
      // Arrange
      jest.spyOn(repository, 'find').mockResolvedValueOnce([profile]);

      // Act
      const result = await service.get();

      // Assert
      expect(result.value).toEqual(
        [profile].map((p) => ProfileDto.mapToDto(p)),
      );
    });

    it('Works correctly when the result is an empty array', async () => {
      // Arrange
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

      // Act
      const result = await service.get();

      // Assert
      expect(result.value).toEqual([]);
    });
  });

  describe('create', () => {
    it('Returns "profile does not exist" error if no profile with the given ID can be found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);

      // Act
      const result = await service.create(createProfileBody, 1, today);

      // Assert
      expect(result.error).toBe(CreateErrors.NoAccountWithSuchId);
    });

    it('Returns "confirmed" error if the profile is confirmed', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(profile);

      // Act
      const result = await service.create(editProfileBody, 1, today);

      // Assert
      expect(result.error).toBe(CreateErrors.IsConfirmed);
    });

    it('Returns success if the profile was created successfully', async () => {
      // Arrange
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValueOnce(provideUnconfirmedProfile());

      // Act
      const result = await service.create(createProfileBody, 1, today);

      // Assert
      expect(result.isOk).toBe(true);
    });
  });

  describe('edit', () => {
    it('Returns "profile does not exist" error if no profile with the given ID can be found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);

      // Act
      const result = await service.edit(editProfileBody, 1);

      // Assert
      expect(result.error).toBe(EditErrors.NoAccountWithSuchId);
    });

    it('Returns "not confirmed" error if the profile is not confirmed', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(unconfirmedProfile);

      // Act
      const result = await service.edit(editProfileBody, 15);
      console.log(result);

      // Assert
      expect(result.error).toBe(EditErrors.IsNotConfirmed);
    });

    it('Returns success if the profile was edited successfully', async () => {
      // Arrange
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValueOnce(provideConfirmedProfile());

      // Act
      const result = await service.edit(editProfileBody, 1);

      // Assert
      expect(result.isOk).toBe(true);
    });
  });

  describe('delete', () => {
    it('Returns a "does not exist" error if no profile can be found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(result.error).toBe(DeleteErrors.DoesNotExist);
    });

    it('Returns success if a profile is deleted', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(profile);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(result.value).toBeUndefined();
    });
  });
});
