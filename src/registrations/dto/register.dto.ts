import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  /**
   * The ticket tier to register for. Must belong to a published event and be free.
   * @example "clx0tier000001"
   */
  @IsString()
  @Matches(/^[a-z0-9]+$/i, { message: 'ticketTypeId must be a valid id' })
  ticketTypeId!: string;

  /**
   * Buyer email; the confirmation is addressed here.
   * @example "ada@example.com"
   */
  @IsEmail()
  email!: string;

  /**
   * Buyer name.
   * @example "Ada Lovelace"
   */
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  /**
   * How many admissions to register (defaults to 1). Capped by the event's
   * max-per-purchase and remaining availability.
   * @example 1
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quantity?: number;
}
