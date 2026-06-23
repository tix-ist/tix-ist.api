import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { EventStatus } from '../events/event.constants';
import { TicketsService } from './tickets.service';

function setup() {
  const prisma = {
    ticket: { findUnique: jest.fn(), findMany: jest.fn() },
  } as any;
  const permissions = { checkEventAccess: jest.fn() } as any;
  const service = new TicketsService(prisma, permissions);
  return { service, prisma, permissions };
}

describe('TicketsService', () => {
  let c: ReturnType<typeof setup>;
  beforeEach(() => {
    c = setup();
  });

  describe('list', () => {
    it('scopes to the event, applies filters, derives nextCursor', async () => {
      c.prisma.ticket.findMany.mockResolvedValue([
        { id: 'tk1' },
        { id: 'tk2' },
        { id: 'tk3' },
      ]);
      const page = await c.service.list('e1', {
        limit: 2,
        ticketTypeId: 'tt1',
        isCheckedIn: false,
      });
      expect(c.prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eventId: 'e1', ticketTypeId: 'tt1', isCheckedIn: false },
          take: 3,
        }),
      );
      expect(page.items.map((t: any) => t.id)).toEqual(['tk1', 'tk2']);
      expect(page.nextCursor).toBe('tk3');
    });

    it('omits absent filters', async () => {
      c.prisma.ticket.findMany.mockResolvedValue([]);
      await c.service.list('e1', { limit: 10 });
      expect(c.prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { eventId: 'e1' } }),
      );
    });
  });

  describe('getById', () => {
    it('checks event access and returns the ticket', async () => {
      c.prisma.ticket.findUnique.mockResolvedValue({
        id: 'tk1',
        eventId: 'e1',
      });
      const ticket = await c.service.getById('u1', 'tk1');
      expect(c.permissions.checkEventAccess).toHaveBeenCalledWith('e1', 'u1');
      expect(ticket).toMatchObject({ id: 'tk1' });
    });

    it('404s when missing', async () => {
      c.prisma.ticket.findUnique.mockResolvedValue(null);
      await expect(c.service.getById('u1', 'nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getPublicByNumber', () => {
    it('returns the ticket for a published event', async () => {
      c.prisma.ticket.findUnique.mockResolvedValue({
        id: 'tk1',
        ticketNumber: 'TKT-X-Y',
        event: { status: EventStatus.Published, isArchived: false },
      });
      await expect(
        c.service.getPublicByNumber('TKT-X-Y'),
      ).resolves.toMatchObject({ id: 'tk1' });
    });

    it('404s on an unknown number', async () => {
      c.prisma.ticket.findUnique.mockResolvedValue(null);
      await expect(c.service.getPublicByNumber('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('404s when the event is not published', async () => {
      c.prisma.ticket.findUnique.mockResolvedValue({
        id: 'tk1',
        event: { status: EventStatus.Draft, isArchived: false },
      });
      await expect(
        c.service.getPublicByNumber('TKT-X-Y'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
