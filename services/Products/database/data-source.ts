import { DataSource } from 'typeorm';
import * as path from 'path';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['src/**/*.entity.ts'],
  migrationsTableName: 'custom_migration_table',
  synchronize: false,
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
});
