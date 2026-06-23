import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Ticket } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CheckInInput {
  ticketNumber?: string;
  qrCodeData?: string;
}

export interface CheckInResult {
  /** True if the ticket was already checked in (idempotent no-op). */
  alreadyCheckedIn: boolean;
  ticket: Ticket;
}

export interface CheckInMetrics {
  totalTickets: number;
  checkedInCount: number;
  notCheckedInCount: number;
  checkInPercentage: number;
  recentCheckIns: Array<{
    ticketNumber: string;
    name: string;
    checkedInAt: Date | null;
  }>;
}

/** Attendee/buyer context attached to a checked-in ticket. */
const WITH_PEOPLE = {
  attendee: { select: { name: true, email: true } },
  registration: { select: { name: true, email: true } },
} satisfies Prisma.TicketInclude;

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check a ticket in by number or QR payload, scoped to the event. **Idempotent**:
   * an already-checked-in ticket returns success without re-stamping. Route-gated by
   * the CHECKIN module.
   */
  async checkIn(
    staffId: string,
    eventId: string,
    input: CheckInInput,
  ): Promise<CheckInResult> {
    const or: Prisma.TicketWhereInput[] = [];
    if (input.ticketNumber) or.push({ ticketNumber: input.ticketNumber });
    if (input.qrCodeData) or.push({ qrCodeData: input.qrCodeData });
    if (or.length === 0) {
      throw new BadRequestException('Provide a ticket number or QR code');
    }

    const ticket = await this.prisma.ticket.findFirst({
      where: { eventId, OR: or },
      include: WITH_PEOPLE,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.isCheckedIn) {
      return { alreadyCheckedIn: true, ticket };
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isCheckedIn: true,
        checkedInAt: new Date(),
        checkedInBy: staffId,
      },
      include: WITH_PEOPLE,
    });
    return { alreadyCheckedIn: false, ticket: updated };
  }

  /** Ticket details for the confirmation step before checking in (scoped to the event). */
  async getByNumber(eventId: string, ticketNumber: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { eventId, ticketNumber },
      include: WITH_PEOPLE,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  /** Live check-in statistics for the event, plus the 10 most recent check-ins. */
  async metrics(eventId: string): Promise<CheckInMetrics> {
    const [totalTickets, checkedInCount, recent] = await Promise.all([
      this.prisma.ticket.count({ where: { eventId } }),
      this.prisma.ticket.count({ where: { eventId, isCheckedIn: true } }),
      this.prisma.ticket.findMany({
        where: { eventId, isCheckedIn: true },
        orderBy: { checkedInAt: 'desc' },
        take: 10,
        include: {
          attendee: { select: { name: true } },
          registration: { select: { name: true } },
        },
      }),
    ]);

    return {
      totalTickets,
      checkedInCount,
      notCheckedInCount: totalTickets - checkedInCount,
      checkInPercentage:
        totalTickets > 0 ? (checkedInCount / totalTickets) * 100 : 0,
      recentCheckIns: recent.map((t) => ({
        ticketNumber: t.ticketNumber,
        name: t.attendee?.name ?? t.registration.name,
        checkedInAt: t.checkedInAt,
      })),
    };
  }
}
