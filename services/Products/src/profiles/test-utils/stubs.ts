import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';

export const profileRepositoryStub = {
  provide: getRepositoryToken(Profile),
  useValue: {
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};
