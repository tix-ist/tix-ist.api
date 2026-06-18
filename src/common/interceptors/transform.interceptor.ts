import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Paginated } from '../pagination/paginated';

export interface StandardResponse<T> {
  data: T;
  meta?: { nextCursor: string | null };
}

/**
 * Wraps every controller success response in `{ data, meta? }`.
 * - `Paginated<T>` → `{ data: items, meta: { nextCursor } }`
 * - `undefined` (e.g. 204 No Content) → passed through unwrapped
 * - anything else → `{ data: value }`
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (value === undefined) return value;
        if (value instanceof Paginated) {
          return { data: value.items, meta: { nextCursor: value.nextCursor } };
        }
        return { data: value };
      }),
    );
  }
}
