import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  /**
   * New display name.
   * @example "Ada Lovelace"
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * New email address; must be unique. Changing it resets email verification.
   * @example "ada@example.com"
   */
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * New avatar image URL.
   * @example "https://cdn.example.com/avatars/ada.png"
   */
  @IsOptional()
  @IsUrl()
  image?: string;
}
