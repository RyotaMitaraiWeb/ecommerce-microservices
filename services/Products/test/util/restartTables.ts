import 'reflect-metadata';
import { seedProfiles } from '../seeders/seedProfiles';
import { DataSource } from 'typeorm';

export async function restartTables(dataSource: DataSource) {
  for (const entity of dataSource.entityMetadatas) {
    await dataSource.query(
      `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
    );
  }

  await seedProfiles(dataSource);
}
