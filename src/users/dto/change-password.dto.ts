import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  /**
   * The current password, for verification.
   * @example "old-s3cret"
   */
  @IsString()
  currentPassword!: string;

  /**
   * The new password (min 6 characters). Stored as a bcrypt hash.
   * @example "new-s3cret"
   */
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
