import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { profileRepositoryStub } from './test-utils/stubs';
import { Result } from 'src/common/result/result';
import { GetByIdErrors } from './types/GetByIdErrors';
import { ProfileDto } from './dto/ProfileDto';
import { NotFoundException } from '@nestjs/common';
import { profile } from './test-utils/mocks';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profileService: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService, profileRepositoryStub],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profileService = module.get(ProfilesService);
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
});
