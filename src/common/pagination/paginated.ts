/**
 * Sentinel a handler returns for cursor-paginated list endpoints. The global
 * TransformInterceptor maps it to `{ data: items, meta: { nextCursor } }`.
 */
export class Paginated<T> {
  constructor(
    public readonly items: T[],
    public readonly nextCursor: string | null = null,
  ) {}
}
