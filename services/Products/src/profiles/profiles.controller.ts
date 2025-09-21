import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfileDto } from './dto/ProfileDto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

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
}
