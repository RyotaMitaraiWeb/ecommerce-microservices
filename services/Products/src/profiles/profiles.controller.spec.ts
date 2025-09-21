import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { profileRepositoryStub } from './test-utils/stubs';
import { Result } from 'src/common/result/result';
import { GetByIdErrors } from './types/GetByIdErrors';
import { ProfileDto } from './dto/profile.dto';
import { NotFoundException } from '@nestjs/common';
import {
  createProfileBody,
  editProfileBody,
  profile,
} from './test-utils/mocks';
import { CreateErrors } from './types/CreateErrors';
import { ClockService } from 'src/clock/clock.service';
import { ClockModule } from 'src/clock/clock.module';
import { EditErrors } from './types/EditErrors';
import { DeleteErrors } from './types/DeleteErrors';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profileService: ProfilesService;
  let clock: ClockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService, profileRepositoryStub],
      imports: [ClockModule],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profileService = module.get(ProfilesService);
    clock = module.get(ClockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfileById', () => {
    it.each([
      [GetByIdErrors.DoesNotExist],
      [GetByIdErrors.IsDeleted],
      [GetByIdErrors.NotConfirmed],
    ])('Throws a 404 exception if an error is returned', async (error) => {
      // Arrange
      const mockResult = Result.err<ProfileDto, GetByIdErrors>(error);
      jest.spyOn(profileService, 'getById').mockResolvedValueOnce(mockResult);

      // Act & Assert
      await expect(() => controller.getProfileById(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Returns a profile if successful', async () => {
      // Arrange
      const mockResult = Result.ok<ProfileDto, GetByIdErrors>(
        ProfileDto.MapToDto(profile),
      );

      jest.spyOn(profileService, 'getById').mockResolvedValueOnce(mockResult);

      // Act
      const result = await controller.getProfileById(profile.id);

      // Assert
      expect(result).toEqual(mockResult.value);
    });
  });

  describe('getAllProfiles', () => {
    const noProfiles = [];

    it.each([[noProfiles], [[ProfileDto.MapToDto(profile)]]])(
      'Returns a list of profiles',
      async (profiles) => {
        // Arrange
        const mockResult = Result.ok(profiles);
        jest.spyOn(profileService, 'get').mockResolvedValueOnce(mockResult);

        // Act
        const result = await controller.getAllProfiles();

        // Assert
        expect(result).toEqual(profiles);
      },
    );
  });

  describe('createProfile', () => {
    it('Returns the provided ID if successful', async () => {
      // Arrange
      const mockResult = Result.ok<unknown, CreateErrors>(undefined);
      const mockDate = new Date('01/01/2020');

      jest.spyOn(clock, 'now').mockReturnValueOnce(mockDate);
      jest.spyOn(profileService, 'create').mockResolvedValueOnce(mockResult);

      // Act
      const result = await controller.createProfile(1, createProfileBody);

      // Assert
      expect(result.id).toBe(1);
    });

    it.each([
      [CreateErrors.IsAlreadyDeleted],
      [CreateErrors.NoAccountWithSuchId],
    ])(
      'Throws a 404 error if the service returns an error',
      async (error: CreateErrors) => {
        // Arrange
        const mockResult = Result.err(error);
        const mockDate = new Date('01/01/2020');

        jest.spyOn(clock, 'now').mockReturnValueOnce(mockDate);
        jest.spyOn(profileService, 'create').mockResolvedValueOnce(mockResult);

        // Act & Assert
        await expect(() =>
          controller.createProfile(1, createProfileBody),
        ).rejects.toThrow(NotFoundException);
      },
    );
  });

  describe('editProfile', () => {
    it('Returns undefined if successful', async () => {
      // Arrange
      const mockResult = Result.ok<unknown, EditErrors>(undefined);
      jest.spyOn(profileService, 'edit').mockResolvedValueOnce(mockResult);

      // Act
      const result = await controller.editProfile(1, editProfileBody);

      // Assert
      expect(result).toBeUndefined();
    });

    it.each([
      [EditErrors.IsDeleted],
      [EditErrors.IsNotConfirmed],
      [EditErrors.NoAccountWithSuchId],
    ])(
      'Throws a 404 error if the service returns an error',
      async (error: EditErrors) => {
        // Arrange
        const mockResult = Result.err(error);

        jest.spyOn(profileService, 'edit').mockResolvedValueOnce(mockResult);

        // Act & Assert
        await expect(() =>
          controller.editProfile(1, editProfileBody),
        ).rejects.toThrow(NotFoundException);
      },
    );
  });

  describe('deleteProfile', () => {
    it('Returns success if successful', async () => {
      // Arrange
      const mockResult = Result.ok<unknown, DeleteErrors>(undefined);
      jest.spyOn(profileService, 'delete').mockResolvedValueOnce(mockResult);

      // Act
      const result = await controller.deleteProfile(1);

      // Assert
      expect(result).toBeUndefined();
    });

    it('Throws a 404 exception if no profile is found', async () => {
      // Arrange
      const mockResult = Result.err(DeleteErrors.DoesNotExist);
      jest.spyOn(profileService, 'delete').mockResolvedValueOnce(mockResult);

      // Act & Assert
      await expect(() => controller.deleteProfile(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
