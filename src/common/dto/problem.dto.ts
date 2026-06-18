/** RFC 7807 problem details — the shape of every error response. */
export class ProblemDto {
  type!: string;
  title!: string;
  status!: number;
  detail!: string;
  instance!: string;
  errors?: Record<string, unknown>;
}
