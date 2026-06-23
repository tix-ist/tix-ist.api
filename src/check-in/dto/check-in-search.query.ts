import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CheckInFilter } from '../check-in.service';

const FILTERS = Object.values(CheckInFilter);

export class CheckInSearchQuery {
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

  /** Case-insensitive match on ticket number, attendee email, or attendee name. */
  @IsOptional()
  @IsString()
  search?: string;

  /** Restrict to checked-in or not-yet-checked-in tickets. */
  @IsOptional()
  @IsIn(FILTERS)
  status?: CheckInFilter;
}
