import 'tsconfig-paths/register';
import NodeEnvironment from 'jest-environment-node';
import {
  StartedPostgreSqlContainer,
  PostgreSqlContainer,
} from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { Profile } from '../src/profiles/entities/profile.entity';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';

declare global {
  var __POSTGRESCONTAINER__: StartedPostgreSqlContainer;
  var __DATASOURCE__: DataSource;
  var __NESTAPP__: INestApplication<App>;
}

class CustomEnvironment extends NodeEnvironment {
  constructor(config: any, context: any) {
    super(config, context);
  }

  private readonly password = 'kklwqlkQAas!';
  private readonly username = 'testuser';
  private readonly db = 'testdb';

  private container: StartedPostgreSqlContainer;
  private dataSource: DataSource;
  private app: INestApplication<App>;

  async setup() {
    await this.initializeContainer();
    await this.initializeDb();
    await this.startApp();
    await super.setup();
  }

  async teardown() {
    await this.container.stop();
    await this.app.close();
    await super.teardown();
  }

  private async initializeContainer() {
    console.log('\n');
    console.log('Initializing Postgres container...');
    const container = await new PostgreSqlContainer('postgres:17')
      .withDatabase(this.db)
      .withUsername(this.username)
      .withPassword(this.password)
      .withExposedPorts(5432)
      .start();

    this.global.__POSTGRESCONTAINER__ = container;
    this.container = container;
    console.log('Postgres container initialized successfully');
  }

  private async initializeDb() {
    const dataSource = new DataSource({
      type: 'postgres',
      host: this.container.getHost(),
      port: this.container.getMappedPort(5432),
      username: this.username,
      password: this.password,
      database: this.db,
      entities: [Profile],
      synchronize: true,
    });

    await dataSource.initialize();

    this.global.__DATASOURCE__ = dataSource;
    this.dataSource = dataSource;

    console.log('Datasource initialized successfully');
  }

  private async startApp() {
    console.log('Initializing app...');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(this.dataSource)
      .compile();

    const app: INestApplication<App> = moduleFixture.createNestApplication();
    this.global.__NESTAPP__ = app;
    this.app = app;
    await app.init();
    console.log('App initialized successfully');
  }
}

export default CustomEnvironment;
