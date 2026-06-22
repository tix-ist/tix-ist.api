import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export const CUSTOM_FIELD_TYPES = [
  'text',
  'textarea',
  'select',
  'checkbox',
  'radio',
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

/** A single custom registration field definition stored on `Event.customFields`. */
export class CustomFieldDefinitionDto {
  /** Stable identifier for this field. */
  @IsString()
  id!: string;

  /** Display label shown on the registration form. */
  @IsString()
  label!: string;

  /** Input type. */
  @IsIn(CUSTOM_FIELD_TYPES)
  type!: CustomFieldType;

  /** Whether a response is required. */
  @IsBoolean()
  required!: boolean;

  /** Options for `select`/`radio`/`checkbox` types. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  /** Help text rendered below the field. */
  @IsOptional()
  @IsString()
  helpText?: string;
}
