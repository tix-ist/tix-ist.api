import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTicketTypeDto {
  /**
   * Tier name.
   * @example "General Admission"
   */
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  /**
   * Tier description.
   * @example "Standard entry to all sessions"
   */
  @IsString()
  @MaxLength(2000)
  description!: string;

  /**
   * Price in **minor units** (e.g. kobo for NGN). Integer ≥ 0; defaults to 0 (free).
   * @example 500000
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  /**
   * ISO 4217 currency code; defaults to NGN.
   * @example "NGN"
   */
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  /**
   * Total inventory for this tier.
   * @example 100
   */
  @IsInt()
  @Min(1)
  quantity!: number;

  /** When the tier goes on sale (UTC); null/absent = no start restriction. */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  saleStart?: Date;

  /** When the tier stops selling (UTC); null/absent = no end restriction. */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  saleEnd?: Date;
}
