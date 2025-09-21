import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileDto } from './dto/ProfileDto';
import { GetByIdErrors } from './types/GetByIdErrors';
import { Result } from 'src/common/result/result';

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
}
