import { describe, expect, it } from '@jest/globals';
import { validate } from './env.validation';

const DB = 'postgresql://user:pass@localhost:5432/tixist?schema=public';

describe('validate (env)', () => {
  it('accepts a valid env and coerces PORT to a number', () => {
    const result = validate({
      NODE_ENV: 'production',
      PORT: '8080',
      LOG_LEVEL: 'info',
      DATABASE_URL: DB,
    });

    expect(result.NODE_ENV).toBe('production');
    expect(result.PORT).toBe(8080);
    expect(typeof result.PORT).toBe('number');
    expect(result.LOG_LEVEL).toBe('info');
    expect(result.DATABASE_URL).toBe(DB);
  });

  it('applies defaults when optional vars are missing', () => {
    const result = validate({ DATABASE_URL: DB });

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
  });

  it('throws on an invalid LOG_LEVEL', () => {
    expect(() =>
      validate({ DATABASE_URL: DB, LOG_LEVEL: 'verbose' }),
    ).toThrow();
  });

  it('throws on a non-numeric PORT', () => {
    expect(() =>
      validate({ DATABASE_URL: DB, PORT: 'not-a-number' }),
    ).toThrow();
  });

  it('throws on an out-of-range PORT', () => {
    expect(() => validate({ DATABASE_URL: DB, PORT: '70000' })).toThrow();
  });

  it('throws on an invalid NODE_ENV', () => {
    expect(() => validate({ DATABASE_URL: DB, NODE_ENV: 'staging' })).toThrow();
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => validate({})).toThrow();
  });

  it('throws when DATABASE_URL is not a postgres url', () => {
    expect(() => validate({ DATABASE_URL: 'mysql://nope' })).toThrow();
  });
});
