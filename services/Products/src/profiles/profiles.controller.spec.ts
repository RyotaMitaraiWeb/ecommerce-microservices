import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { profileRepositoryStub } from './test-utils/stubs';
import { Result } from 'src/common/result/result';
import { GetByIdErrors } from './types/GetByIdErrors';
import { ProfileDto } from './dto/profile.dto';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  createProfileBody,
  editProfileBody,
  profile,
} from './test-utils/mocks';
import { CreateErrors } from './types/CreateErrors';
import { ClockService } from 'src/clock/clock.service';
import { ClockModule } from 'src/clock/clock.module';
import { EditErrors } from './types/EditErrors';
import { Mapper } from 'src/common/mapper/Mapper';
import { InitializeProfileResultDto } from './dto/initialize-profile-result-dto';
import { ProfileInitPayload } from './types/profile-init';
import { RpcException } from '@nestjs/microservices';
import { InitializeProfileErrors } from './types/InitializeProfileErrors';
import { AuthModule } from 'src/auth/auth.module';
import { EditProfileDto } from './dto/edit-profile.dto';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profileService: ProfilesService;
  let clock: ClockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService, profileRepositoryStub],
      imports: [ClockModule, AuthModule],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profileService = module.get(ProfilesService);
    clock = module.get(ClockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfileById', () => {
    it.each([[GetByIdErrors.DoesNotExist], [GetByIdErrors.NotConfirmed]])(
      'Throws a 404 exception if an error is returned',
      async (error) => {
        // Arrange
        const mockResult = Result.err<ProfileDto, GetByIdErrors>(error);
        jest.spyOn(profileService, 'getById').mockResolvedValueOnce(mockResult);

        // Act & Assert
        await expect(() => controller.getProfileById(1)).rejects.toThrow(
          NotFoundException,
        );
      },
    );

    it('Returns a profile if successful', async () => {
      // Arrange
      const mockResult = Result.ok<ProfileDto, GetByIdErrors>(
        Mapper.profile.toDto(profile),
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

    it.each([[noProfiles], [[Mapper.profile.toDto(profile)]]])(
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

  describe('handleProfileInit', () => {
    it('Returns a DTO when successful', async () => {
      // Arrange
      const mockResult = Result.ok<
        InitializeProfileResultDto,
        InitializeProfileErrors
      >(Mapper.profile.toInitializeResultDto(profile));

      const data: ProfileInitPayload = {
        email: profile.email,
      };

      jest
        .spyOn(profileService, 'initialize')
        .mockResolvedValueOnce(mockResult);

      // Act
      const result = await controller.handleProfileInit(data);

      // Assert
      expect(result.id).toBe(profile.id);
      expect(result.email).toBe(profile.email);
    });

    it.each([
      InitializeProfileErrors.EmailAlreadyExists,
      InitializeProfileErrors.Unknown,
    ])(
      'Throws an RPC error if initialization fails for whatever reason',
      async (error) => {
        // Arrange
        const data: ProfileInitPayload = {
          email: profile.email,
        };

        const mockResult = Result.err<
          InitializeProfileResultDto,
          InitializeProfileErrors
        >(error);

        jest
          .spyOn(profileService, 'initialize')
          .mockResolvedValueOnce(mockResult);

        // Act & Assert
        await expect(() => controller.handleProfileInit(data)).rejects.toThrow(
          RpcException,
        );
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

    it('Throws a 404 error if the service returns NoAcccountWithSuch error', async () => {
      // Arrange
      const mockResult = Result.err(CreateErrors.NoAccountWithSuchId);
      const mockDate = new Date('01/01/2020');

      jest.spyOn(clock, 'now').mockReturnValueOnce(mockDate);
      jest.spyOn(profileService, 'create').mockResolvedValueOnce(mockResult);

      // Act & Assert
      await expect(() =>
        controller.createProfile(1, createProfileBody),
      ).rejects.toThrow(NotFoundException);
    });

    it('Throws a 409 error if the service returns Confirmed error', async () => {
      // Arrange
      const mockResult = Result.err(CreateErrors.IsConfirmed);
      const mockDate = new Date('01/01/2020');

      jest.spyOn(clock, 'now').mockReturnValueOnce(mockDate);
      jest.spyOn(profileService, 'create').mockResolvedValueOnce(mockResult);

      // Act & Assert
      await expect(() =>
        controller.createProfile(1, createProfileBody),
      ).rejects.toThrow(ConflictException);
    });
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

    it.each([{}, { firstName: '', lastName: undefined }, { lastName: null }])(
      'Handles correctly the cases where no viable request body is provided',
      async (requestBody: object) => {
        // Arrange
        const dto = new EditProfileDto();
        Object.assign(dto, requestBody);

        const spy = jest.spyOn(profileService, 'edit');

        // Act
        const result = await controller.editProfile(1, dto);

        // Assert
        expect(result).toBeUndefined();
        expect(spy).not.toHaveBeenCalled();
      },
    );

    it.each([
      [EditErrors.IsNotConfirmed, ForbiddenException],
      [EditErrors.NoAccountWithSuchId, NotFoundException],
    ])(
      'Throws a 404 error if the service returns an error',
      async (error: EditErrors, exception: typeof ForbiddenException) => {
        // Arrange
        const mockResult = Result.err(error);

        jest.spyOn(profileService, 'edit').mockResolvedValueOnce(mockResult);

        // Act & Assert
        await expect(() =>
          controller.editProfile(1, editProfileBody),
        ).rejects.toThrow(exception);
      },
    );
  });
});
