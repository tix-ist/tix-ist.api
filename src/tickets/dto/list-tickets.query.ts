import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

/** Coerce `?flag=true|false` query strings to booleans. */
const toBool = ({ value }: { value: unknown }) =>
  value === 'true' ? true : value === 'false' ? false : value;

export class ListTicketsQuery {
  /** Max items per page (1–100, default 20). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /** Opaque cursor (a ticket id) to fetch the page after it. */
  @IsOptional()
  @IsString()
  cursor?: string;

  /** Filter to a single ticket tier. */
  @IsOptional()
  @IsString()
  ticketTypeId?: string;

  /** Filter by check-in state. */
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isCheckedIn?: boolean;

  /** Filter by assignment state. */
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isAssigned?: boolean;
}
