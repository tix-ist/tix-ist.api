import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Ticket } from '@prisma/client';
import { Paginated } from '../common/pagination/paginated';
import { EventStatus } from '../events/event.constants';
import { PermissionsService } from '../permissions/permissions.service';
import { PrismaService } from '../prisma/prisma.service';

interface ListParams {
  limit: number;
  cursor?: string;
  ticketTypeId?: string;
  isCheckedIn?: boolean;
  isAssigned?: boolean;
}

/** A ticket as returned by the public number-lookup, with light event context. */
const PUBLIC_SELECT = {
  id: true,
  ticketNumber: true,
  qrCodeData: true,
  isAssigned: true,
  isCheckedIn: true,
  checkedInAt: true,
  ticketType: { select: { name: true } },
  event: {
    select: {
      name: true,
      slug: true,
      startDate: true,
      status: true,
      isArchived: true,
    },
  },
} satisfies Prisma.TicketSelect;

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: PermissionsService,
  ) {}

  /** Tickets for an event (organizer/team; ATTENDEES module), newest first. */
  async list(eventId: string, params: ListParams): Promise<Paginated<Ticket>> {
    const { limit, cursor, ticketTypeId, isCheckedIn, isAssigned } = params;
    const where: Prisma.TicketWhereInput = {
      eventId,
      ...(ticketTypeId && { ticketTypeId }),
      ...(isCheckedIn !== undefined && { isCheckedIn }),
      ...(isAssigned !== undefined && { isAssigned }),
    };
    const rows = await this.prisma.ticket.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
    });
    const nextCursor = rows.length > limit ? (rows.pop()?.id ?? null) : null;
    return new Paginated(rows, nextCursor);
  }

  /** A single ticket; caller must be a member of its event. */
  async getById(callerId: string, id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        ticketType: { select: { name: true } },
        registration: { select: { email: true, name: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    await this.permissions.checkEventAccess(ticket.eventId, callerId);
    return ticket;
  }

  /**
   * Public lookup by ticket number (attendee self-service). Returns light event
   * context; hidden behind a 404 unless the event is published.
   */
  async getPublicByNumber(ticketNumber: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketNumber },
      select: PUBLIC_SELECT,
    });
    if (
      !ticket ||
      ticket.event.status !== EventStatus.Published ||
      ticket.event.isArchived
    ) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }
}
