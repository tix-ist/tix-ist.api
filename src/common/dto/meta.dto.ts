/** Pagination metadata carried in `meta` for list responses. */
export class ResponseMetaDto {
  /** Cursor to fetch the next page, or `null` when there are no more results. */
  nextCursor!: string | null;
}
