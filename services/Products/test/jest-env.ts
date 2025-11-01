import 'tsconfig-paths/register';
import NodeEnvironment from 'jest-environment-node';
import {
  StartedPostgreSqlContainer,
  PostgreSqlContainer,
} from '@testcontainers/postgresql';
import {
  StartedRabbitMQContainer,
  RabbitMQContainer,
} from '@testcontainers/rabbitmq';
import { DataSource } from 'typeorm';
import { Profile } from '../src/profiles/entities/profile.entity';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { populateJwtEnvironmentVariables } from './util/jwt';

declare global {
  var __POSTGRESCONTAINER__: StartedPostgreSqlContainer;
  var __DATASOURCE__: DataSource;
  var __NESTAPP__: INestApplication<App>;
  var __RMQCLIENT__: ClientProxy;
}

class CustomEnvironment extends NodeEnvironment {
  private readonly password = 'kklwqlkQAas!';
  private readonly username = 'testuser';
  private readonly db = 'testdb';
  private readonly profileInitQueue = 'profile_init_queue';

  private container: StartedPostgreSqlContainer;
  private dataSource: DataSource;
  private app: INestApplication<App>;
  private rmq: StartedRabbitMQContainer;
  private rmqClient: ClientProxy;

  async setup() {
    try {
      await Promise.all([
        this.initializeContainer(),
        this.initializeRabbitMQ(),
      ]);
      await this.initializeDb();

      this.setEnvironmentVariables();
      await this.startRmqClient();

      await this.startApp();
      await super.setup();
    } catch (e) {
      console.error(e);
    }
  }

  async teardown() {
    await this.container.stop();
    await this.rmqClient.close();
    await this.app.close();
    await this.rmq.stop();
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

    // 🚀 Start the RMQ microservice listener
    const amqpUrl = this.rmq.getAmqpUrl();

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [amqpUrl],
        queue: this.profileInitQueue,
        queueOptions: { durable: false },
      },
    });

    await app.startAllMicroservices();
  }

  private async initializeRabbitMQ() {
    console.log('Starting RabbitMQ container...');
    this.rmq = await new RabbitMQContainer('rabbitmq:3')
      .withExposedPorts(5672)
      .withReuse()
      .start();

    console.log('started !!!');

    this.global.__RABBITCONTAINER__ = this.rmq;
    console.log(`RabbitMQ started: ${this.rmq.getAmqpUrl()}`);
  }

  private async startRmqClient() {
    console.log('Creating RMQ client proxy...');
    const amqpUrl = this.rmq.getAmqpUrl();

    this.rmqClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [amqpUrl],
        queue: this.profileInitQueue,
        queueOptions: { durable: false },
      },
    });

    await this.rmqClient.connect();

    this.global.__RMQCLIENT__ = this.rmqClient;
    console.log('RMQ client connected');
  }

  private setEnvironmentVariables() {
    process.env.RABBITMQ_URL = this.rmq.getAmqpUrl();
    process.env.RABBITMQ_QUEUE = this.profileInitQueue;
    populateJwtEnvironmentVariables();

    console.log('Environment variables set for NestJS app');
  }
}

export default CustomEnvironment;
