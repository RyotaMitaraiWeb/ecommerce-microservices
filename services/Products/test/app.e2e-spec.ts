import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { restartTables } from './util/restartTables';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    app = global.__NESTAPP__;
  });

  beforeEach(async () => {
    await restartTables(global.__DATASOURCE__);
  });

  it('Healthcheck test', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
