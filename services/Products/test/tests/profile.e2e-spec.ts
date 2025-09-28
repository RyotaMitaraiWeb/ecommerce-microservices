import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { restartTables } from '../util/restartTables';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    app = global.__NESTAPP__;
  });

  beforeEach(async () => {
    await restartTables(global.__DATASOURCE__);
  });

  describe('endpoint "/{id}" (GET)', () => {
    it('Returns 404 if the profile cannot be found', async () => {
      const response = await request(app.getHttpServer()).get('/profile/1500');
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
