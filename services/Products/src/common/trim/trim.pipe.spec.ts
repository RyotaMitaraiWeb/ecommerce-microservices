import { TrimPipe } from './trim.pipe';

describe('TrimPipe', () => {
  let pipe: TrimPipe;

  beforeEach(() => {
    pipe = new TrimPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should trim a single string value', () => {
    const value = '   hello world   ';
    const transformedValue = pipe.transform(value);
    expect(transformedValue).toBe('hello world');
  });

  it('should not change a string with no whitespace', () => {
    const value = 'hello';
    const transformedValue = pipe.transform(value);
    expect(transformedValue).toBe('hello');
  });

  it('should return a non-string value unchanged', () => {
    const numberValue = 123;
    const booleanValue = true;
    const nullValue = null;
    const undefinedValue = undefined;

    expect(pipe.transform(numberValue)).toBe(123);
    expect(pipe.transform(booleanValue)).toBe(true);
    expect(pipe.transform(nullValue)).toBe(null);
    expect(pipe.transform(undefinedValue)).toBe(undefined);
  });

  it('should recursively trim string properties of an object', () => {
    const userDto = {
      firstName: '  John ',
      lastName: ' Doe ',
      age: 30,
      email: '  johndoe@example.com  ',
      address: {
        street: '  123 Main St  ',
        city: ' Any City ',
      },
    };

    const transformedDto = pipe.transform(userDto) as typeof userDto;
    expect(transformedDto.firstName).toBe('John');
    expect(transformedDto.lastName).toBe('Doe');
    expect(transformedDto.age).toBe(30);
    expect(transformedDto.email).toBe('johndoe@example.com');
  });

  it('should trim strings within a simple array', () => {
    const value = ['  hello ', ' world  ', ' test'];
    const transformedValue = pipe.transform(value);
    expect(transformedValue).toEqual(['hello', 'world', 'test']);
  });

  it('should handle mixed data types within an array', () => {
    const value = ['  hello ', 123, true, null];
    const transformedValue = pipe.transform(value);
    expect(transformedValue).toEqual(['hello', 123, true, null]);
  });

  it('should recursively trim strings in objects within an array', () => {
    const value = [
      {
        name: '  user1 ',
      },
      {
        name: '  user2  ',
      },
    ];
    const transformedValue = pipe.transform(value) as typeof value;
    expect(transformedValue[0].name).toBe('user1');
    expect(transformedValue[1].name).toBe('user2');
  });

  it('should recursively trim strings in nested arrays', () => {
    const value = ['  item1 ', ['  item2 ', ' item3 ']];
    const transformedValue = pipe.transform(value) as typeof value;
    expect(transformedValue[0]).toBe('item1');
    expect(transformedValue[1][0]).toBe('item2');
    expect(transformedValue[1][1]).toBe('item3');
  });
});
