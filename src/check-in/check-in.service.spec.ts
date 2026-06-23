import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CheckInService } from './check-in.service';

function setup() {
  const prisma = {
    ticket: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  } as any;
  const service = new CheckInService(prisma);
  return { service, prisma };
}

describe('CheckInService', () => {
  let c: ReturnType<typeof setup>;
  beforeEach(() => {
    c = setup();
  });

  describe('checkIn', () => {
    it('rejects when neither ticketNumber nor qrCodeData is given', async () => {
      await expect(c.service.checkIn('u1', 'e1', {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('404s when no matching ticket exists', async () => {
      c.prisma.ticket.findFirst.mockResolvedValue(null);
      await expect(
        c.service.checkIn('u1', 'e1', { ticketNumber: 'TKT-X' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('finds by ticketNumber or qrCodeData, scoped to the event', async () => {
      c.prisma.ticket.findFirst.mockResolvedValue({
        id: 'tk1',
        isCheckedIn: false,
      });
      c.prisma.ticket.update.mockResolvedValue({
        id: 'tk1',
        isCheckedIn: true,
      });
      await c.service.checkIn('u1', 'e1', { qrCodeData: 'qr-abc' });
      const where = c.prisma.ticket.findFirst.mock.calls[0][0].where;
      expect(where.eventId).toBe('e1');
      expect(where.OR).toContainEqual({ qrCodeData: 'qr-abc' });
    });

    it('stamps the check-in for a fresh ticket', async () => {
      c.prisma.ticket.findFirst.mockResolvedValue({
        id: 'tk1',
        isCheckedIn: false,
      });
      c.prisma.ticket.update.mockResolvedValue({
        id: 'tk1',
        isCheckedIn: true,
      });

      const result = await c.service.checkIn('staff1', 'e1', {
        ticketNumber: 'TKT-X',
      });

      expect(result.alreadyCheckedIn).toBe(false);
      expect(c.prisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tk1' },
          data: expect.objectContaining({
            isCheckedIn: true,
            checkedInBy: 'staff1',
          }),
        }),
      );
    });

    it('is idempotent for an already-checked-in ticket', async () => {
      c.prisma.ticket.findFirst.mockResolvedValue({
        id: 'tk1',
        isCheckedIn: true,
      });

      const result = await c.service.checkIn('staff1', 'e1', {
        ticketNumber: 'TKT-X',
      });

      expect(result.alreadyCheckedIn).toBe(true);
      expect(c.prisma.ticket.update).not.toHaveBeenCalled();
    });
  });

  describe('getByNumber', () => {
    it('returns the ticket scoped to the event', async () => {
      c.prisma.ticket.findFirst.mockResolvedValue({ id: 'tk1' });
      const ticket = await c.service.getByNumber('e1', 'TKT-X');
      expect(c.prisma.ticket.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eventId: 'e1', ticketNumber: 'TKT-X' },
        }),
      );
      expect(ticket).toMatchObject({ id: 'tk1' });
    });

    it('404s when missing', async () => {
      c.prisma.ticket.findFirst.mockResolvedValue(null);
      await expect(c.service.getByNumber('e1', 'nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('metrics', () => {
    it('computes counts and percentage', async () => {
      c.prisma.ticket.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4); // checked in
      c.prisma.ticket.findMany.mockResolvedValue([
        {
          ticketNumber: 'TKT-A',
          checkedInAt: new Date('2026-06-23'),
          attendee: { name: 'Ada' },
          registration: { name: 'Buyer' },
        },
      ]);

      const m = await c.service.metrics('e1');

      expect(m).toMatchObject({
        totalTickets: 10,
        checkedInCount: 4,
        notCheckedInCount: 6,
        checkInPercentage: 40,
      });
      expect(m.recentCheckIns[0]).toMatchObject({
        ticketNumber: 'TKT-A',
        name: 'Ada',
      });
    });

    it('reports 0% when there are no tickets', async () => {
      c.prisma.ticket.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      c.prisma.ticket.findMany.mockResolvedValue([]);
      const m = await c.service.metrics('e1');
      expect(m.checkInPercentage).toBe(0);
    });
  });
});
