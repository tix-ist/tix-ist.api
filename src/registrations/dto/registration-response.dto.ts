import { TicketResponseDto } from '../../tickets/dto/ticket-response.dto';

/** A registration (order) as returned by the API. */
export class RegistrationResponseDto {
  /** Unique registration id (cuid). */
  id!: string;

  /** The event registered for. */
  eventId!: string;

  /** The ticket tier. */
  ticketTypeId!: string;

  /** Buyer email. */
  email!: string;

  /** Buyer name. */
  name!: string;

  /** Linked user id, or null for anonymous self-registration. */
  userId!: string | null;

  /** Number of admissions covered by this registration. */
  quantity!: number;

  /** `free` | `pending` | `paid` | `failed` | `refunded` (always `free` for now). */
  paymentStatus!: string;

  /** When the registration was made. */
  registeredAt!: Date;
}

/** A registration plus the admission tickets minted for it (registration confirmation). */
export class RegistrationConfirmationDto extends RegistrationResponseDto {
  /** One ticket per admission, each with its number and QR payload. */
  tickets!: TicketResponseDto[];
}
