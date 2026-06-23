import { TicketResponseDto } from '../../tickets/dto/ticket-response.dto';

/** Result of a check-in attempt. */
export class CheckInResultDto {
  /** True if the ticket was already checked in (idempotent no-op). */
  alreadyCheckedIn!: boolean;

  /** The (now) checked-in ticket. */
  ticket!: TicketResponseDto;
}

/** A recent check-in row in the metrics feed. */
export class RecentCheckInDto {
  /** The ticket number. */
  ticketNumber!: string;

  /** Attendee name, falling back to the buyer's. */
  name!: string;

  /** When it was checked in. */
  checkedInAt!: Date | null;
}

/** Live check-in statistics for an event. */
export class CheckInMetricsDto {
  /** Total tickets issued for the event. */
  totalTickets!: number;

  /** How many have been checked in. */
  checkedInCount!: number;

  /** How many remain. */
  notCheckedInCount!: number;

  /** Checked-in share, 0–100. */
  checkInPercentage!: number;

  /** The 10 most recent check-ins. */
  recentCheckIns!: RecentCheckInDto[];
}
