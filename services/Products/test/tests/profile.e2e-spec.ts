import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { restartTables } from '../util/restartTables';
import { profiles } from '../seeders/seedProfiles';
import { ProfileDto } from 'src/profiles/dto/profile.dto';
import {
  editProfileErrorMessages,
  getProfileErrorMessages,
} from 'src/profiles/constants/erroMessages';
import { EditProfileDto } from 'src/profiles/dto/edit-profile.dto';
import { EditErrors } from 'src/profiles/types/EditErrors';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    app = global.__NESTAPP__;
  });

  beforeEach(async () => {
    await restartTables(global.__DATASOURCE__);
  });

  describe('endpoint "/{id}" (GET)', () => {
    it('Returns 200 if the profile was found', async () => {
      const profile = profiles.find((profile) => profile.id === 1)!;
      const response = await request(app.getHttpServer()).get('/profiles/1');
      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as ProfileDto;
      expect(body.firstName).toBe(profile.firstName);
      expect(body.lastName).toBe(profile.lastName);
      expect(new Date(body.joinDate).getTime()).toBe(
        profile.createdAt.getTime(),
      );
      expect(body.id).toBe(1);
    });

    it('Returns 404 if no profile with such ID can be found', async () => {
      const response = await request(app.getHttpServer()).get(
        '/profiles/1555555',
      );

      expect(response.status).toBe(HttpStatus.NOT_FOUND);

      const body = response.body as NotFoundException;
      expect(body.message).toBe(getProfileErrorMessages.doesNotExist);
    });

    it('Returns 404 if the profile is deleted', async () => {
      const profile = profiles.find((profile) => !profile.confirmed)!;

      const response = await request(app.getHttpServer()).get(
        `/profiles/${profile.id}`,
      );

      expect(response.status).toBe(HttpStatus.NOT_FOUND);

      const body = response.body as NotFoundException;
      expect(body.message).toBe(getProfileErrorMessages.doesNotExist);
    });

    it('Returns 404 if the profile is not confirmed', async () => {
      const profile = profiles.find((profile) => !!profile.deletedAt)!;

      const response = await request(app.getHttpServer()).get(
        `/profiles/${profile.id}`,
      );

      expect(response.status).toBe(HttpStatus.NOT_FOUND);

      const body = response.body as NotFoundException;
      expect(body.message).toBe(getProfileErrorMessages.doesNotExist);
    });
  });

  describe('endpoint "/" (GET)', () => {
    it('Returns a list of profiles', async () => {
      const validProfiles = profiles.filter(
        (profile) => !profile.deletedAt && profile.confirmed,
      );

      const response = await request(app.getHttpServer()).get('/profiles');
      expect(response.status).toBe(HttpStatus.OK);
      const body = response.body as ProfileDto[];

      expect(body.length).toBe(validProfiles.length);
    });
  });

  describe('endpoint "/{id}" (PATCH)', () => {
    it('Edits a profile successfully', async () => {
      const profile = profiles.find(
        (profile) => profile.confirmed && !profile.deletedAt,
      )!;

      const requestBody = new EditProfileDto();
      requestBody.firstName = 'Ryota';
      requestBody.lastName = 'Mitarai';

      const response = await request(app.getHttpServer())
        .patch(`/profiles/${profile.id}`)
        .send(requestBody);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const editedProfileResponse = await request(app.getHttpServer()).get(
        `/profiles/${profile.id}`,
      );

      const editedProfile = editedProfileResponse.body as ProfileDto;
      expect(editedProfile.firstName).toBe('Ryota');
      expect(editedProfile.lastName).toBe('Mitarai');
    });

    it('Returns 403 if the profile is not confirmed', async () => {
      const profile = profiles.find((profile) => !profile.confirmed)!;

      const requestBody = new EditProfileDto();
      requestBody.firstName = 'Ryota';
      requestBody.lastName = 'Mitarai';

      const response = await request(app.getHttpServer())
        .patch(`/profiles/${profile.id}`)
        .send(requestBody);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      const body = response.body as NotFoundException;

      expect(body.message).toBe(
        editProfileErrorMessages[EditErrors.IsNotConfirmed],
      );
    });

    it('Returns 404 if the profile is deleted', async () => {
      const profile = profiles.find((profile) => !!profile.deletedAt)!;

      const requestBody = new EditProfileDto();
      requestBody.firstName = 'Ryota';
      requestBody.lastName = 'Mitarai';

      const response = await request(app.getHttpServer())
        .patch(`/profiles/${profile.id}`)
        .send(requestBody);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      const body = response.body as NotFoundException;

      expect(body.message).toBe(
        editProfileErrorMessages[EditErrors.NoAccountWithSuchId],
      );
    });

    it('Returns 404 if no profile with the given ID is found', async () => {
      const requestBody = new EditProfileDto();
      requestBody.firstName = 'Ryota';
      requestBody.lastName = 'Mitarai';

      const response = await request(app.getHttpServer())
        .patch('/profiles/15555')
        .send(requestBody);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      const body = response.body as NotFoundException;

      expect(body.message).toBe(
        editProfileErrorMessages[EditErrors.NoAccountWithSuchId],
      );
    });
  });
});
