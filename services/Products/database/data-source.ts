import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT_MIGRATIONS),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['src/**/*.entity.ts'],
  migrationsTableName: 'custom_migration_table',
  synchronize: false,
  migrations: ['database/migrations/*{.ts,.js}'],
  ssl: false,
});
