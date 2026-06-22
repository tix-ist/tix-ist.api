import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

function setup() {
  const prisma = {
    teamMember: { findFirst: jest.fn() },
  } as any;
  const service = new PermissionsService(prisma);
  return { service, prisma };
}

describe('PermissionsService', () => {
  let c: ReturnType<typeof setup>;
  beforeEach(() => {
    c = setup();
  });

  describe('checkEventAccess', () => {
    it('returns the membership for an active member', async () => {
      const member = {
        id: 'm1',
        role: 'COLLABORATOR',
        status: 'ACTIVE',
        modulePermissions: ['CFP'],
      };
      c.prisma.teamMember.findFirst.mockResolvedValue(member);

      const ctx = await c.service.checkEventAccess('e1', 'u1');

      expect(c.prisma.teamMember.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eventId: 'e1', userId: 'u1', status: 'ACTIVE' },
        }),
      );
      expect(ctx).toEqual({ membership: member, isOwner: false });
    });

    it('flags owners', async () => {
      c.prisma.teamMember.findFirst.mockResolvedValue({
        id: 'm1',
        role: 'OWNER',
        status: 'ACTIVE',
        modulePermissions: [],
      });
      const ctx = await c.service.checkEventAccess('e1', 'u1');
      expect(ctx.isOwner).toBe(true);
    });

    it('throws Forbidden when the user is not an active member', async () => {
      c.prisma.teamMember.findFirst.mockResolvedValue(null);
      await expect(
        c.service.checkEventAccess('e1', 'stranger'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('checkModuleAccess', () => {
    it('allows an owner regardless of module', async () => {
      c.prisma.teamMember.findFirst.mockResolvedValue({
        id: 'm1',
        role: 'OWNER',
        status: 'ACTIVE',
        modulePermissions: [],
      });
      await expect(
        c.service.checkModuleAccess('e1', 'u1', 'CFP'),
      ).resolves.toMatchObject({ isOwner: true });
    });

    it('allows a collaborator holding the module', async () => {
      c.prisma.teamMember.findFirst.mockResolvedValue({
        id: 'm1',
        role: 'COLLABORATOR',
        status: 'ACTIVE',
        modulePermissions: ['CFP', 'ATTENDEES'],
      });
      await expect(
        c.service.checkModuleAccess('e1', 'u1', 'CFP'),
      ).resolves.toMatchObject({ isOwner: false });
    });

    it('rejects a collaborator missing the module', async () => {
      c.prisma.teamMember.findFirst.mockResolvedValue({
        id: 'm1',
        role: 'COLLABORATOR',
        status: 'ACTIVE',
        modulePermissions: ['ATTENDEES'],
      });
      await expect(
        c.service.checkModuleAccess('e1', 'u1', 'CFP'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('checkIsOwner', () => {
    it('passes for the owner', async () => {
      c.prisma.teamMember.findFirst.mockResolvedValue({
        id: 'm1',
        role: 'OWNER',
        status: 'ACTIVE',
        modulePermissions: [],
      });
      await expect(c.service.checkIsOwner('e1', 'u1')).resolves.toMatchObject({
        isOwner: true,
      });
    });

    it('rejects a non-owner collaborator', async () => {
      c.prisma.teamMember.findFirst.mockResolvedValue({
        id: 'm1',
        role: 'COLLABORATOR',
        status: 'ACTIVE',
        modulePermissions: ['CFP'],
      });
      await expect(c.service.checkIsOwner('e1', 'u1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
