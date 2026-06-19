/** RFC 7807 problem details — the shape of every error response. */
export class ProblemDto {
  /**
   * URI reference identifying the problem type (RFC 7807). Defaults to `about:blank`.
   * @example "about:blank"
   */
  type!: string;

  /**
   * Short, human-readable summary of the problem type (the HTTP status text).
   * @example "Unauthorized"
   */
  title!: string;

  /**
   * HTTP status code.
   * @example 401
   */
  status!: number;

  /**
   * Human-readable explanation specific to this occurrence.
   * @example "Invalid credentials"
   */
  detail!: string;

  /**
   * The request path that produced the error.
   * @example "/auth/login"
   */
  instance!: string;

  /** Optional structured details, e.g. field-level validation messages. */
  errors?: Record<string, unknown>;
}
