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
import { getProfileErrorMessages } from 'src/profiles/constants/erroMessages';

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
});
