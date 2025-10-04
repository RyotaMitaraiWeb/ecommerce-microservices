import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfileDto } from './dto/profile.dto';
import { ClockService } from 'src/clock/clock.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import {
  createProfileErrorMessages,
  editProfileErrorMessages,
  getProfileErrorMessages,
  profileInitializationErrors,
} from './constants/errorMessages';
import { EditErrors } from './types/EditErrors';
import {
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { ProfileInitPayload } from './types/profile-init';
import { Channel } from 'amqplib';

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
      throw new NotFoundException(getProfileErrorMessages.doesNotExist);
    }

    return result.value;
  }

  @Get()
  public async getAllProfiles(): Promise<ProfileDto[]> {
    const result = await this.profilesService.get();
    return result.value;
  }

  @MessagePattern('init_profile')
  public async handleProfileInit(@Payload() data: ProfileInitPayload) {
    const email = data.email;
    const result = await this.profilesService.initialize(email);

    if (result.isErr) {
      throw new RpcException(profileInitializationErrors.unknown);
    }

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
      throw new NotFoundException(createProfileErrorMessages[result.error]);
    }

    return { id };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async editProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() details: EditProfileDto,
  ) {
    const result = await this.profilesService.edit(details, id);

    if (result.isErr) {
      if (result.error === EditErrors.IsNotConfirmed) {
        throw new ForbiddenException(editProfileErrorMessages[result.error]);
      }

      throw new NotFoundException(editProfileErrorMessages[result.error]);
    }
  }
}

export function getChannel(context: RmqContext): Channel {
  return context.getChannelRef() as Channel;
}
