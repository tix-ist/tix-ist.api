import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  /**
   * Email address; used as the login identifier and must be unique.
   * @example "ada@example.com"
   */
  @IsEmail()
  email!: string;

  /**
   * Password (min 6 characters). Stored as a bcrypt hash, never in plaintext.
   * @example "s3cret-pw"
   */
  @IsString()
  @MinLength(6)
  password!: string;

  /**
   * Optional display name.
   * @example "Ada Lovelace"
   */
  @IsOptional()
  @IsString()
  name?: string;
}
