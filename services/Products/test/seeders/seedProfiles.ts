import { Profile } from 'src/profiles/entities/profile.entity';
import { DataSource, EntityTarget } from 'typeorm';

// Helper to create Profile instances
function createProfile(data: Profile): Profile {
  return Object.assign(new Profile(), data);
}

// Top-level exported profiles as real instances
export const profiles: Profile[] = [
  // Five normal profiles
  createProfile({
    id: 1,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    confirmed: true,
    createdAt: new Date('2020-01-15T08:30:00Z'),
  }),
  createProfile({
    id: 2,
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    confirmed: true,
    createdAt: new Date('2020-02-20T10:00:00Z'),
  }),
  createProfile({
    id: 3,
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie.brown@example.com',
    confirmed: true,
    createdAt: new Date('2020-03-05T14:15:00Z'),
  }),
  createProfile({
    id: 4,
    firstName: 'Diana',
    lastName: 'Evans',
    email: 'diana.evans@example.com',
    confirmed: true,
    createdAt: new Date('2020-04-12T09:45:00Z'),
  }),
  createProfile({
    id: 5,
    firstName: 'Ethan',
    lastName: 'Williams',
    email: 'ethan.williams@example.com',
    confirmed: true,
    createdAt: new Date('2020-05-25T16:20:00Z'),
  }),

  // Two deleted but confirmed profiles
  createProfile({
    id: 6,
    firstName: 'Fiona',
    lastName: 'Taylor',
    email: 'fiona.taylor@example.com',
    confirmed: true,
    createdAt: new Date('2020-05-01T12:00:00Z'),
    deletedAt: new Date('2020-06-15T10:30:00Z'),
  }),
  createProfile({
    id: 7,
    firstName: 'George',
    lastName: 'Miller',
    email: 'george.miller@example.com',
    confirmed: true,
    createdAt: new Date('2021-08-01T09:00:00Z'),
    deletedAt: new Date('2021-09-22T14:45:00Z'),
  }),

  // Two unconfirmed but non-deleted profiles
  createProfile({
    id: 8,
    firstName: 'Hannah',
    lastName: 'Davis',
    email: 'hannah.davis@example.com',
    confirmed: false,
    createdAt: new Date('2021-01-10T11:15:00Z'),
  }),
  createProfile({
    id: 9,
    firstName: 'Ian',
    lastName: 'Wilson',
    email: 'ian.wilson@example.com',
    confirmed: false,
    createdAt: new Date('2021-03-20T13:30:00Z'),
  }),

  // One deleted and unconfirmed profile
  createProfile({
    id: 10,
    firstName: 'Julia',
    lastName: 'Anderson',
    email: 'julia.anderson@example.com',
    confirmed: false,
    createdAt: new Date('2022-01-05T08:00:00Z'),
    deletedAt: new Date('2022-03-10T09:00:00Z'),
  }),
];

// Seeder function
export async function seedProfiles(dataSource: DataSource) {
  const profileMetadata = dataSource.entityMetadatas.find(
    (meta) => meta.name === Profile.name || meta.target === Profile,
  );

  if (!profileMetadata) {
    throw new Error('Profile entity not found in DataSource');
  }

  const profileRepository = dataSource.getRepository(
    profileMetadata.target as EntityTarget<Profile>,
  );

  await profileRepository.save(profiles);
}
