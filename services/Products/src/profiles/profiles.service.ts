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

    if (profile.deletedAt) {
      return Result.err(GetByIdErrors.IsDeleted);
    }

    if (!profile.confirmed) {
      return Result.err(GetByIdErrors.NotConfirmed);
    }

    return Result.ok(ProfileDto.MapToDto(profile));
  }

  async get(): Promise<Result<ProfileDto[], unknown>> {
    const profiles = await this.repository.find({
      where: {
        confirmed: true,
      },
    });

    return Result.ok(profiles.map((profile) => ProfileDto.MapToDto(profile)));
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

    if (profile.deletedAt) {
      return Result.err(CreateErrors.IsAlreadyDeleted);
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

    if (profile.deletedAt) {
      return Result.err(EditErrors.IsDeleted);
    }

    if (!profile.confirmed) {
      return Result.err(EditErrors.IsNotConfirmed);
    }

    profile.firstName = details.firstName;
    profile.lastName = details.lastName;

    await this.repository.save(profile);

    return Result.ok(undefined);
  }
}
