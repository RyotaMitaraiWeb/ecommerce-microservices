import { validate } from 'class-validator';
import { IsLegalName } from './validName.validator';

class TestUser {
  @IsLegalName()
  firstName!: string;
}

describe('IsLegalName Validator', () => {
  const legalNames = [
    'John',
    'Anne-Marie',
    "O'Connor",
    'Jean Claude',
    'José',
    'Zoë',
    'François',
    'Łukasz',
    'Nguyễn Văn',
    '张伟',
    'たろう',
    '민수',
    'أحمد',
    'Γιώργος',
    'Élodie',
    'Åsa',
    "D'Artagnan",
    'Jean-Claude Van Damme',
    'Шрек',
  ];

  const illegalNames = [
    '-John', // starts with hyphen
    'John-', // ends with hyphen
    ' John', // starts with space (even if trimmed normally)
    'John ', // ends with space
    'John  Doe', // double space
    'John123', // contains numbers
    'John!', // contains invalid punctuation
    'O@Connor', // invalid symbol
    '', // empty string
    ' ', // space only
    '--', // only hyphens
    'A-', // ends with hyphen
    '-A', // starts with hyphen
  ];

  describe('valid names', () => {
    it.each(legalNames)('should validate "%s" as legal', async (name) => {
      const user = new TestUser();
      user.firstName = name;
      const errors = await validate(user);
      expect(errors.length).toBe(0);
    });
  });

  describe('invalid names', () => {
    it.each(illegalNames)('should invalidate "%s" as illegal', async (name) => {
      const user = new TestUser();
      user.firstName = name;
      const errors = await validate(user);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
