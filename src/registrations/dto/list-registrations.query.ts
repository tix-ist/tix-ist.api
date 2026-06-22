import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListRegistrationsQuery {
  /** Max items per page (1–100, default 20). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /** Opaque cursor (a registration id) to fetch the page after it. */
  @IsOptional()
  @IsString()
  cursor?: string;

  /** Filter to a single ticket tier. */
  @IsOptional()
  @IsString()
  ticketTypeId?: string;
}
