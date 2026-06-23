import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    // PrismaClient resolves the datasource url at construction.
    process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
    service = new PrismaService();
  });

  it('connects on module init', async () => {
    const connect = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('disconnects on module destroy', async () => {
    const disconnect = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
