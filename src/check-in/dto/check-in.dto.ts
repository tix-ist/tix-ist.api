import { IsOptional, IsString } from 'class-validator';

/**
 * Identify the ticket to check in by **either** its number or its QR payload.
 * At least one must be present (enforced in the service).
 */
export class CheckInDto {
  /**
   * The ticket number (e.g. from manual entry).
   * @example "TKT-LXY-AB23CD45EF"
   */
  @IsOptional()
  @IsString()
  ticketNumber?: string;

  /**
   * The QR payload (from scanning).
   * @example "k8s2bGmF1tQx0pZ7nJ4cR6yL3wH8aD5eK2uN0iT9"
   */
  @IsOptional()
  @IsString()
  qrCodeData?: string;
}
