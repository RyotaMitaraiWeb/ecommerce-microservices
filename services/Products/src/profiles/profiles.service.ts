import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileDto } from './dto/profile.dto';
import { GetByIdErrors } from './types/GetByIdErrors';
import { Result } from 'src/common/result/result';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateErrors } from './types/CreateErrors';
import { EditProfileDto } from './dto/edit-profile.dto';
import { EditErrors } from './types/EditErrors';
import { DeleteErrors } from './types/DeleteErrors';
import { Mapper } from 'src/common/mapper/Mapper';
import { InitializeProfileResultDto } from './dto/initialize-profile-result-dto';
import { InitializeProfileErrors } from './types/InitializeProfileErrors';
import { isEmailIsAlreadyTakenError } from './constants/errorChecks';
import { GetByEmailErrors } from './types/GetByEmailErrors';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly repository: Repository<Profile>,
  ) {}

  async getById(id: number): Promise<Result<ProfileDto, GetByIdErrors>> {
    const profile = await this.repository.findOneBy({ id });
    if (!profile) {
      return Result.err(GetByIdErrors.DoesNotExist);
    }

    if (!profile.confirmed) {
      return Result.err(GetByIdErrors.NotConfirmed);
    }

    return Result.ok(Mapper.profile.toDto(profile));
  }

  async getByEmail(
    email: string,
  ): Promise<Result<ProfileDto, GetByEmailErrors>> {
    const profile = await this.repository.findOneBy({ email });
    if (!profile) {
      return Result.err(GetByEmailErrors.DoesNotExist);
    }

    if (!profile.confirmed) {
      return Result.err(GetByEmailErrors.NotConfirmed);
    }

    return Result.ok(Mapper.profile.toDto(profile));
  }

  async get(): Promise<Result<ProfileDto[], unknown>> {
    const profiles = await this.repository.find({
      where: {
        confirmed: true,
      },
    });

    return Result.ok(profiles.map((profile) => Mapper.profile.toDto(profile)));
  }

  async initialize(
    email: string,
  ): Promise<Result<InitializeProfileResultDto, InitializeProfileErrors>> {
    try {
      const profile = this.repository.create({
        email,
        confirmed: false,
        firstName: '',
        lastName: '',
      });

      const saved = await this.repository.save(profile);
      const dto = Mapper.profile.toInitializeResultDto(saved);
      return Result.ok(dto);
    } catch (err) {
      if (isEmailIsAlreadyTakenError(err)) {
        return Result.err(InitializeProfileErrors.EmailAlreadyExists);
      }

      return Result.err(InitializeProfileErrors.Unknown);
    }
  }

  async create(
    details: CreateProfileDto,
    id: number,
    today: Date,
  ): Promise<Result<unknown, CreateErrors>> {
    const profile = await this.repository.findOneBy({ id });
    if (!profile) {
      return Result.err(CreateErrors.NoAccountWithSuchId);
    }

    if (profile.confirmed) {
      return Result.err(CreateErrors.IsConfirmed);
    }

    profile.confirmed = true;
    profile.firstName = details.firstName;
    profile.lastName = details.lastName;
    profile.createdAt = today;

    await this.repository.save(profile);

    return Result.ok(undefined);
  }

  async edit(
    details: EditProfileDto,
    id: number,
  ): Promise<Result<unknown, EditErrors>> {
    const profile = await this.repository.findOneBy({ id });
    if (!profile) {
      return Result.err(EditErrors.NoAccountWithSuchId);
    }

    if (!profile.confirmed) {
      return Result.err(EditErrors.IsNotConfirmed);
    }

    if (details.firstName) {
      profile.firstName = details.firstName;
    }

    if (details.lastName) {
      profile.lastName = details.lastName;
    }

    await this.repository.save(profile);

    return Result.ok(undefined);
  }

  async delete(id: number): Promise<Result<unknown, DeleteErrors>> {
    const profile = await this.repository.findOneBy({ id });
    if (!profile) {
      return Result.err(DeleteErrors.DoesNotExist);
    }

    return Result.ok(undefined);
  }
}
