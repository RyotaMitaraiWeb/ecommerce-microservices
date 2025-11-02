import {
  ConflictException,
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
  getProfileByEmailErrorMessages,
  getProfileErrorMessages,
} from 'src/profiles/constants/errorMessages';
import { EditProfileDto } from 'src/profiles/dto/edit-profile.dto';
import { EditErrors } from 'src/profiles/types/EditErrors';
import { ClientProxy } from '@nestjs/microservices';
import { InitializeProfileResultDto } from 'src/profiles/dto/initialize-profile-result-dto';
import { CreateProfileDto } from 'src/profiles/dto/create-profile.dto';
import { from, map, switchMap, tap } from 'rxjs';
import { generateJwt, populateJwtEnvironmentVariables } from '../util/jwt';
import { GetByEmailErrors } from 'src/profiles/types/GetByEmailErrors';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication<App>;
  let rmqClient: ClientProxy;

  beforeAll(() => {
    app = global.__NESTAPP__;
    rmqClient = global.__RMQCLIENT__;
    populateJwtEnvironmentVariables();
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

  describe('endpoint "/me" (GET', () => {
    it("Returns the user's profile when authenticated", async () => {
      const profile = profiles.find((p) => p.confirmed && !p.deletedAt)!;
      const jwt = generateJwt(profile.email, '12345');

      const response = await request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${jwt}`);

      expect(response.status).toBe(HttpStatus.OK);
      const responseBody = response.body as ProfileDto;
      expect(responseBody.id).toBe(profile.id);
      expect(responseBody.firstName).toBe(profile.firstName);
    });

    it('Returns 401 if the user is not authenticated', async () => {
      const response = await request(app.getHttpServer()).get('/profiles/me');

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Returns 409 if the profile is not confirmed', async () => {
      const profile = profiles.find((p) => !p.confirmed && !p.deletedAt)!;
      const jwt = generateJwt(profile.email, '12345');

      const response = await request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${jwt}`);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      const responseBody = response.body as ConflictException;
      expect(responseBody.message).toBe(
        getProfileByEmailErrorMessages[GetByEmailErrors.NotConfirmed],
      );
    });

    it('Returns 404 if the profile is deleted and unconfirmed', async () => {
      const profile = profiles.find((p) => !p.confirmed && p.deletedAt)!;
      const jwt = generateJwt(profile.email, '12345');

      const response = await request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${jwt}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      const responseBody = response.body as NotFoundException;
      expect(responseBody.message).toBe(
        getProfileByEmailErrorMessages[GetByEmailErrors.DoesNotExist],
      );
    });

    it('Returns 404 if the profile is deleted and confirmed', async () => {
      const profile = profiles.find((p) => p.confirmed && p.deletedAt)!;
      const jwt = generateJwt(profile.email, '12345');

      const response = await request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${jwt}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      const responseBody = response.body as NotFoundException;
      expect(responseBody.message).toBe(
        getProfileByEmailErrorMessages[GetByEmailErrors.DoesNotExist],
      );
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

  describe('Profile creation (pattern "init_profile" (RabbitMQ) and endpoint "/" (POST))', () => {
    it('Initializes and creates a profile successfully', (done) => {
      const payload = new CreateProfileDto();
      payload.firstName = 'Ryota';
      payload.lastName = 'Mitarai';

      rmqClient
        .send('init_profile', { email: 'myvalidemail@gmail.com' })
        .pipe(
          // Assert that initialization has been processed correctly
          tap((data: InitializeProfileResultDto) => {
            expect(data.email).toBe('myvalidemail@gmail.com');
          }),
          // Sending a POST request to finalize the profile
          switchMap((data) =>
            from(
              request(app.getHttpServer())
                .post(`/profiles/${data.id}`)
                .send(payload),
            ),
          ),
          // Ensure that the profile has been created
          tap((response) => {
            expect(response.status).toBe(HttpStatus.CREATED);
          }),
          // Check if the profile has been edited successfully
          map((response) => {
            const body = response.body as { id: number };
            return body.id;
          }),
          switchMap((id) =>
            from(request(app.getHttpServer()).get(`/profiles/${id}`)),
          ),
        )
        .subscribe((response) => {
          expect(response.status).toBe(HttpStatus.OK);
          const body = response.body as ProfileDto;
          expect(body.firstName).toBe('Ryota');
          expect(body.lastName).toBe('Mitarai');
          done();
        });
    });

    it('REST endpoint returns 404 if the profile does not exist', async () => {
      const payload = new CreateProfileDto();
      payload.firstName = 'Ryota';
      payload.lastName = 'Mitarai';

      const response = await request(app.getHttpServer())
        .post('/profiles/150000')
        .send(payload);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('REST endpoint returns 404 if the profile is deleted', async () => {
      const payload = new CreateProfileDto();
      payload.firstName = 'Ryota';
      payload.lastName = 'Mitarai';

      const profile = profiles.find((profile) => profile.deletedAt)!;

      const response = await request(app.getHttpServer())
        .post(`/profiles/${profile.id}`)
        .send(payload);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('REST endpoint returns 409 if the profile is already confirmed', async () => {
      const payload = new CreateProfileDto();
      payload.firstName = 'Ryota';
      payload.lastName = 'Mitarai';

      const profile = profiles.find(
        (profile) => profile.confirmed && !profile.deletedAt,
      )!;

      const response = await request(app.getHttpServer())
        .post(`/profiles/${profile.id}`)
        .send(payload);

      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it('REST endpoint returns 400 if first name is not valid', async () => {
      const payload = new CreateProfileDto();
      payload.firstName = '!Ryota'; // special symbols are not allowed
      payload.lastName = 'Mitarai';

      const profile = profiles.find(
        (profile) => !profile.confirmed && !profile.deletedAt,
      )!;

      const response = await request(app.getHttpServer())
        .post(`/profiles/${profile.id}`)
        .send(payload);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('REST endpoint returns 400 if last name is not valid', async () => {
      const payload = new CreateProfileDto();
      payload.firstName = 'Ryota';
      payload.lastName = '!Mitarai'; // special symbols are not allowed

      const profile = profiles.find(
        (profile) => !profile.confirmed && !profile.deletedAt,
      )!;

      const response = await request(app.getHttpServer())
        .post(`/profiles/${profile.id}`)
        .send(payload);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('endpoint "/{id}" (PATCH)', () => {
    it('Edits a profile successfully', async () => {
      const profile = profiles.find(
        (profile) => profile.confirmed && !profile.deletedAt,
      )!;

      const requestBody = new EditProfileDto();
      requestBody.firstName = 'Ryota';

      const response = await request(app.getHttpServer())
        .patch(`/profiles/${profile.id}`)
        .send(requestBody);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const editedProfileResponse = await request(app.getHttpServer()).get(
        `/profiles/${profile.id}`,
      );

      const editedProfile = editedProfileResponse.body as ProfileDto;
      expect(editedProfile.firstName).toBe('Ryota');
      expect(editedProfile.lastName).toBe(profile.lastName);
    });

    it('Handles the case where a non-viable body is provided', async () => {
      const profile = profiles.find(
        (profile) => profile.confirmed && !profile.deletedAt,
      )!;

      const response = await request(app.getHttpServer())
        .patch(`/profiles/${profile.id}`)
        .send({});

      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const editedProfileResponse = await request(app.getHttpServer()).get(
        `/profiles/${profile.id}`,
      );

      const editedProfile = editedProfileResponse.body as ProfileDto;
      expect(editedProfile.firstName).toBe(profile.firstName);
      expect(editedProfile.lastName).toBe(profile.lastName);
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

    it('Returns 400 if first name is not valid', async () => {
      const payload = new EditProfileDto();
      payload.firstName = '!Ryota'; // special symbols are not allowed

      const profile = profiles.find(
        (profile) => !profile.confirmed && !profile.deletedAt,
      )!;

      const response = await request(app.getHttpServer())
        .patch(`/profiles/${profile.id}`)
        .send(payload);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if last name is not valid', async () => {
      const payload = new EditProfileDto();
      payload.lastName = '!Mitarai'; // special symbols are not allowed

      const profile = profiles.find(
        (profile) => !profile.confirmed && !profile.deletedAt,
      )!;

      const response = await request(app.getHttpServer())
        .patch(`/profiles/${profile.id}`)
        .send(payload);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
