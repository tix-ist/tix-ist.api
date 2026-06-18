import { describe, expect, it } from '@jest/globals';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { Paginated } from '../pagination/paginated';
import { TransformInterceptor } from './transform.interceptor';

const ctx = {} as ExecutionContext;
const handlerOf = (value: unknown): CallHandler =>
  ({ handle: () => of(value) }) as CallHandler;

describe('TransformInterceptor', () => {
  const interceptor = new TransformInterceptor();

  it('wraps a plain value in { data }', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(ctx, handlerOf({ id: 1 })),
    );
    expect(result).toEqual({ data: { id: 1 } });
  });

  it('maps a Paginated result to { data, meta.nextCursor }', async () => {
    const page = new Paginated([{ id: 1 }], 'cursor-2');
    const result = await lastValueFrom(
      interceptor.intercept(ctx, handlerOf(page)),
    );
    expect(result).toEqual({
      data: [{ id: 1 }],
      meta: { nextCursor: 'cursor-2' },
    });
  });

  it('passes through undefined (no body) unwrapped', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(ctx, handlerOf(undefined)),
    );
    expect(result).toBeUndefined();
  });
});
