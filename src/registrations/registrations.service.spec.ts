import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';

const future = new Date('2999-01-01');
const past = new Date('2000-01-01');

function setup() {
  const tx = {
    $queryRaw: jest.fn(),
    event: { findUnique: jest.fn() },
    registration: { aggregate: jest.fn(), create: jest.fn() },
    ticket: { createMany: jest.fn(), findMany: jest.fn() },
  } as any;
  const prisma = {
    registration: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb(tx)),
  } as any;
  const permissions = {
    checkEventAccess: jest.fn(),
    checkModuleAccess: jest.fn(),
  } as any;
  const service = new RegistrationsService(prisma, permissions);
  return { service, prisma, permissions, tx };
}

/** A locked-tier row as returned by the FOR UPDATE query. */
function tier(overrides: Record<string, unknown> = {}) {
  return [
    {
      id: 'tt1',
      eventId: 'e1',
      price: 0n,
      quantity: 100,
      saleStart: null,
      saleEnd: null,
      ...overrides,
    },
  ];
}

function publishedEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    status: 'published',
    isArchived: false,
    maxTicketsPerPurchase: 10,
    name: 'Conf',
    slug: 'conf',
    ...overrides,
  };
}

const dto = { ticketTypeId: 'tt1', email: 'a@b.com', name: 'Ada' };

describe('RegistrationsService', () => {
  let c: ReturnType<typeof setup>;
  beforeEach(() => {
    c = setup();
  });

  describe('register', () => {
    function arrange(tierRow = tier(), event = publishedEvent(), sold = 0) {
      c.tx.$queryRaw.mockResolvedValue(tierRow);
      c.tx.event.findUnique.mockResolvedValue(event);
      c.tx.registration.aggregate.mockResolvedValue({
        _sum: { quantity: sold },
      });
      c.tx.registration.create.mockResolvedValue({ id: 'r1' });
      c.tx.ticket.createMany.mockResolvedValue({ count: 1 });
      c.tx.ticket.findMany.mockResolvedValue([{ id: 'tk1' }]);
    }

    it('registers for a free tier with capacity and returns minted tickets', async () => {
      arrange(tier(), publishedEvent(), 10);
      const reg = await c.service.register(dto);
      expect(c.tx.registration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventId: 'e1',
            ticketTypeId: 'tt1',
            email: 'a@b.com',
            name: 'Ada',
            quantity: 1,
            paymentStatus: 'free',
          }),
        }),
      );
      expect(reg).toEqual({ id: 'r1', tickets: [{ id: 'tk1' }] });
    });

    it('mints one ticket per requested quantity', async () => {
      arrange(tier(), publishedEvent(), 0);
      await c.service.register({ ...dto, quantity: 3 });
      const rows = c.tx.ticket.createMany.mock.calls[0][0].data;
      expect(rows).toHaveLength(3);
      expect(rows[0]).toMatchObject({
        registrationId: 'r1',
        eventId: 'e1',
        ticketTypeId: 'tt1',
      });
      expect(typeof rows[0].ticketNumber).toBe('string');
      expect(typeof rows[0].qrCodeData).toBe('string');
    });

    it('locks the tier row before counting (FOR UPDATE)', async () => {
      arrange();
      await c.service.register(dto);
      const sql = String(c.tx.$queryRaw.mock.calls[0][0]);
      expect(sql.toUpperCase()).toContain('FOR UPDATE');
    });

    it('blocks registration for a paid tier', async () => {
      arrange(tier({ price: 500000n }));
      await expect(c.service.register(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(c.tx.registration.create).not.toHaveBeenCalled();
    });

    it('rejects when sold out', async () => {
      arrange(tier({ quantity: 5 }), publishedEvent(), 5);
      await expect(c.service.register(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when the requested quantity exceeds remaining capacity', async () => {
      arrange(tier({ quantity: 5 }), publishedEvent(), 4);
      await expect(
        c.service.register({ ...dto, quantity: 2 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects quantity over the event max per purchase', async () => {
      arrange(tier(), publishedEvent({ maxTicketsPerPurchase: 2 }));
      await expect(
        c.service.register({ ...dto, quantity: 3 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects before the sale window opens', async () => {
      arrange(tier({ saleStart: future }));
      await expect(c.service.register(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects after the sale window closes', async () => {
      arrange(tier({ saleEnd: past }));
      await expect(c.service.register(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('404s for an unpublished event', async () => {
      arrange(tier(), publishedEvent({ status: 'draft' }));
      await expect(c.service.register(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('404s when the tier does not exist', async () => {
      arrange([]);
      await expect(c.service.register(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getById', () => {
    it('checks event access and returns the registration', async () => {
      c.prisma.registration.findUnique.mockResolvedValue({
        id: 'r1',
        eventId: 'e1',
      });
      const reg = await c.service.getById('u1', 'r1');
      expect(c.permissions.checkEventAccess).toHaveBeenCalledWith('e1', 'u1');
      expect(reg).toMatchObject({ id: 'r1' });
    });

    it('404s when missing', async () => {
      c.prisma.registration.findUnique.mockResolvedValue(null);
      await expect(c.service.getById('u1', 'nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('requires ATTENDEES and hard-deletes (freeing the slot)', async () => {
      c.prisma.registration.findUnique.mockResolvedValue({
        id: 'r1',
        eventId: 'e1',
      });
      await c.service.cancel('u1', 'r1');
      expect(c.permissions.checkModuleAccess).toHaveBeenCalledWith(
        'e1',
        'u1',
        'ATTENDEES',
      );
      expect(c.prisma.registration.delete).toHaveBeenCalledWith({
        where: { id: 'r1' },
      });
    });
  });
});
