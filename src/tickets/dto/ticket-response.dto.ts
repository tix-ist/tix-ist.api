/** An admission ticket as returned to organizers. */
export class TicketResponseDto {
  /** Unique ticket id (cuid). */
  id!: string;

  /** The registration (order) this ticket belongs to. */
  registrationId!: string;

  /** The event. */
  eventId!: string;

  /** The ticket tier. */
  ticketTypeId!: string;

  /** Human-readable ticket number (e.g. `TKT-…`). */
  ticketNumber!: string;

  /** QR payload encoded in the ticket's QR code. */
  qrCodeData!: string;

  /** Whether the ticket has been assigned to an attendee. */
  isAssigned!: boolean;

  /** Linked attendee id, or null if unassigned (assignment lands in a later slice). */
  attendeeId!: string | null;

  /** Whether the ticket has been checked in. */
  isCheckedIn!: boolean;

  /** When the ticket was checked in, or null. */
  checkedInAt!: Date | null;

  /** Issuance timestamp. */
  createdAt!: Date;
}

/** Public, attendee-facing view of a ticket (by number). */
export class TicketPublicDto {
  /** Ticket id. */
  id!: string;

  /** Ticket number. */
  ticketNumber!: string;

  /** QR payload to render the attendee's QR code. */
  qrCodeData!: string;

  /** Whether the ticket has been assigned. */
  isAssigned!: boolean;

  /** Whether the ticket has been checked in. */
  isCheckedIn!: boolean;

  /** When checked in, or null. */
  checkedInAt!: Date | null;

  /** The tier name. */
  ticketType!: { name: string };

  /** Light event context. */
  event!: { name: string; slug: string; startDate: Date };
}
