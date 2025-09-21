import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfileDto } from './dto/ProfileDto';
import { ClockService } from 'src/clock/clock.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly clock: ClockService,
  ) {}

  @Get(':id')
  public async getProfileById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProfileDto> {
    const result = await this.profilesService.getById(id);
    if (result.isErr) {
      throw new NotFoundException();
    }

    return result.value;
  }

  @Get()
  public async getAllProfiles(): Promise<ProfileDto[]> {
    const result = await this.profilesService.get();
    return result.value;
  }

  @Post(':id')
  public async createProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() details: CreateProfileDto,
  ) {
    const today = this.clock.now();
    const result = await this.profilesService.create(details, id, today);

    if (result.isErr) {
      throw new NotFoundException();
    }

    return { id };
  }
}
