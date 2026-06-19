import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * Registered email address.
   * @example "ada@example.com"
   */
  @IsEmail()
  email!: string;

  /**
   * Account password.
   * @example "s3cret-pw"
   */
  @IsString()
  @MinLength(6)
  password!: string;
}
