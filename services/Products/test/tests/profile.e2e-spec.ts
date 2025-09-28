import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    app = global.__NESTAPP__;
  });

  beforeEach(async () => {
    await global.__DATASOURCE__.dropDatabase();
  });

  afterAll(async () => {
    await global.__POSTGRESCONTAINER__.stop();
    await global.__NESTAPP__.close();
  });

  describe('endpoint "/" (GET)', () => {
    it('Returns 404 if the profile cannot be found', async () => {
      const response = await request(app.getHttpServer()).get('/profile/1500');
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
