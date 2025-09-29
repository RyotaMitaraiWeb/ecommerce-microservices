// result.ts

export class Result<T, E> {
  private constructor(
    private readonly _isOk: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isOk(): boolean {
    return this._isOk;
  }

  get isErr(): boolean {
    return !this._isOk;
  }

  // --- Value accessors ---
  get value(): T {
    if (!this._isOk) {
      throw new Error('Tried to get value from an Err result');
    }
    return this._value as T;
  }

  get error(): E {
    if (this._isOk) {
      throw new Error('Tried to get error from an Ok result');
    }
    return this._error as E;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isOk) {
      return Result.ok(fn(this._value as T));
    }
    return Result.err(this._error as E);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isErr) {
      return Result.err(fn(this._error as E));
    }
    return Result.ok(this._value as T);
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isOk) {
      return fn(this._value as T);
    }
    return Result.err(this._error as E);
  }

  unwrapOr(defaultValue: T): T {
    return this.isOk ? (this._value as T) : defaultValue;
  }

  unwrapOrElse(fn: (error: E) => T): T {
    return this.isOk ? (this._value as T) : fn(this._error as E);
  }
}
