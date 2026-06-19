import { describe, expect, it } from '@jest/globals';
import { resolveCorsOptions } from './cors';

describe('resolveCorsOptions', () => {
  it('reflects any origin in development', () => {
    expect(resolveCorsOptions('development', undefined).origin).toBe(true);
  });

  it('reflects any origin in test', () => {
    expect(resolveCorsOptions('test', undefined).origin).toBe(true);
  });

  it('restricts to the parsed allowlist in production', () => {
    const opts = resolveCorsOptions(
      'production',
      'https://a.example.com, https://b.example.com',
    );
    expect(opts.origin).toEqual([
      'https://a.example.com',
      'https://b.example.com',
    ]);
  });

  it('denies all origins in production when no allowlist is given', () => {
    expect(resolveCorsOptions('production', undefined).origin).toBe(false);
    expect(resolveCorsOptions('production', '   ').origin).toBe(false);
  });

  it('enables credentials', () => {
    expect(resolveCorsOptions('development', undefined).credentials).toBe(true);
  });
});
