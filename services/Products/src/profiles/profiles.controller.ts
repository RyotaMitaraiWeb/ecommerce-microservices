import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id')
  public async getProfileById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.profilesService.getById(id);
    if (result.isErr) {
      throw new NotFoundException();
    }

    return result.value;
  }
}
