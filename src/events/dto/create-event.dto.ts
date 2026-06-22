import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CustomFieldDefinitionDto } from './custom-field-definition.dto';

export const LOCATION_TYPES = ['in-person', 'virtual', 'hybrid'] as const;
export const EVENT_STATUSES = ['draft', 'published', 'archived'] as const;
export const ASSIGNMENT_CUTOFF_TYPES = [
  'event_start',
  '1h_before',
  '24h_before',
  'custom',
] as const;

export class CreateEventDto {
  /**
   * Event name.
   * @example "Tixist Conf 2026"
   */
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name!: string;

  /**
   * Long description (markdown allowed).
   * @example "A one-day conference about event tooling."
   */
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  /**
   * URL-friendly identifier; globally unique. Lowercase letters, numbers and hyphens.
   * @example "tixist-conf-2026"
   */
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase letters, numbers and hyphens only',
  })
  @MinLength(3)
  @MaxLength(100)
  slug!: string;

  /** Where the event happens. */
  @IsIn(LOCATION_TYPES)
  locationType!: (typeof LOCATION_TYPES)[number];

  /**
   * Physical address (required for in-person/hybrid).
   * @example "10 Marina Rd, Lagos"
   */
  @IsOptional()
  @IsString()
  locationAddress?: string;

  /**
   * Virtual join URL (required for virtual/hybrid).
   * @example "https://meet.example.com/tixist"
   */
  @IsOptional()
  @IsUrl()
  locationUrl?: string;

  /**
   * IANA timezone the event is scheduled in.
   * @example "Africa/Lagos"
   */
  @IsString()
  timezone!: string;

  /** Start instant (UTC). */
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  /** End instant (UTC); must be after the start. */
  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  /** Lifecycle status; defaults to draft. */
  @IsOptional()
  @IsIn(EVENT_STATUSES)
  status?: (typeof EVENT_STATUSES)[number];

  /** When ticket assignment closes. */
  @IsOptional()
  @IsIn(ASSIGNMENT_CUTOFF_TYPES)
  assignmentCutoffType?: (typeof ASSIGNMENT_CUTOFF_TYPES)[number];

  /** Custom cutoff instant, used when `assignmentCutoffType` is `custom`. */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  assignmentCutoffTime?: Date;

  /** Maximum tickets in a single purchase. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxTicketsPerPurchase?: number;

  /** Custom registration field definitions. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDefinitionDto)
  customFields?: CustomFieldDefinitionDto[];
}
