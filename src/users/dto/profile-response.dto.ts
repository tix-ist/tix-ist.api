/** The authenticated user's own profile, as returned by `/me`. */
export class ProfileResponseDto {
  /** Unique user identifier (cuid). */
  id!: string;

  /** Email address (may be null for accounts without one). */
  email!: string | null;

  /** Display name (may be null). */
  name!: string | null;

  /** Avatar image URL (may be null). */
  image!: string | null;

  /** When the email was verified, or null if still unverified. */
  emailVerified!: Date | null;

  /** Account creation timestamp. */
  createdAt!: Date;
}
