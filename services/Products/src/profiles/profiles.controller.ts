import {
  Body,
  ConflictException,
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
  getProfileByEmailErrorMessages,
  getProfileErrorMessages,
  profileInitializationErrors,
} from './constants/errorMessages';
import { EditErrors } from './types/EditErrors';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { CreateErrors } from './types/CreateErrors';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { UserClaimsDto } from 'src/auth/dto/user-claims.dto';
import { GetByEmailErrors } from './types/GetByEmailErrors';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly clock: ClockService,
  ) {}

  @Auth()
  @Get('me')
  public async getMyProfile(@User() user: UserClaimsDto) {
    const result = await this.profilesService.getByEmail(user.email);

    if (result.isErr) {
      const errorMessage = getProfileByEmailErrorMessages[result.error];
      if (result.error === GetByEmailErrors.NotConfirmed) {
        throw new ConflictException(errorMessage);
      }

      throw new NotFoundException(errorMessage);
    }

    return result.value;
  }

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
  @Auth()
  public async handleProfileInit(@User() user: UserClaimsDto) {
    const email = user.email;
    const result = await this.profilesService.initialize(email);

    if (result.isErr) {
      throw new RpcException(profileInitializationErrors[result.error]);
    }

    return result.value;
  }

  @Post('confirm')
  @Auth()
  public async createProfile(
    @Body() details: CreateProfileDto,
    @User() user: UserClaimsDto,
  ) {
    const today = this.clock.now();
    const result = await this.profilesService.create(
      details,
      user.email,
      today,
    );

    if (result.isErr) {
      if (result.error === CreateErrors.IsConfirmed) {
        throw new ConflictException(createProfileErrorMessages[result.error]);
      }

      throw new NotFoundException(createProfileErrorMessages[result.error]);
    }

    return { email: user.email };
  }

  @Patch()
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async editProfile(
    @User() user: UserClaimsDto,
    @Body() details: EditProfileDto,
  ) {
    if (details.isEmpty) {
      return;
    }

    const result = await this.profilesService.edit(details, user.email);

    if (result.isErr) {
      if (result.error === EditErrors.IsNotConfirmed) {
        throw new ForbiddenException(editProfileErrorMessages[result.error]);
      }

      throw new NotFoundException(editProfileErrorMessages[result.error]);
    }
  }
}
