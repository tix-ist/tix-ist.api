export class UserResponseDto {
  /** Unique user identifier (cuid). */
  id!: string;

  /** Email address (may be null for accounts without one). */
  email!: string | null;

  /** Display name (may be null). */
  name!: string | null;
}
