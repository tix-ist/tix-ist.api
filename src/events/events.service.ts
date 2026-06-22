import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { Paginated } from '../common/pagination/paginated';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

interface ListMineParams {
  limit: number;
  cursor?: string;
  status?: 'draft' | 'published' | 'archived';
}

interface ListPublishedParams {
  limit: number;
  cursor?: string;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create an event owned by the caller. Slug must be globally unique. */
  async create(userId: string, dto: CreateEventDto): Promise<Event> {
    await this.assertSlugFree(dto.slug);
    const { customFields, ...rest } = dto;
    return this.prisma.event.create({
      data: {
        ...rest,
        customFields: this.toJson(customFields),
        organizerId: userId,
      },
    });
  }

  /** The caller's own events, newest first, cursor-paginated. */
  async listMine(
    userId: string,
    params: ListMineParams,
  ): Promise<Paginated<Event>> {
    const { limit, cursor, status } = params;
    const where: Prisma.EventWhereInput = { organizerId: userId };
    if (status === 'archived') {
      where.isArchived = true;
    } else if (status) {
      where.status = status;
    }
    return this.page(where, limit, cursor);
  }

  /** Counts of the caller's events grouped by status. */
  async statusCounts(
    userId: string,
  ): Promise<{ draft: number; published: number; archived: number }> {
    const [draft, published, archived] = await Promise.all([
      this.prisma.event.count({
        where: { organizerId: userId, status: 'draft' },
      }),
      this.prisma.event.count({
        where: { organizerId: userId, status: 'published' },
      }),
      this.prisma.event.count({
        where: { organizerId: userId, status: 'archived' },
      }),
    ]);
    return { draft, published, archived };
  }

  /** Load an event the caller owns, or throw (404 missing / 403 not owner). */
  async getOwned(userId: string, id: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You do not have access to this event');
    }
    return event;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateEventDto,
  ): Promise<Event> {
    const current = await this.getOwned(userId, id);
    if (dto.slug && dto.slug !== current.slug) {
      await this.assertSlugFree(dto.slug);
    }
    const { customFields, ...rest } = dto;
    return this.prisma.event.update({
      where: { id },
      data: {
        ...rest,
        ...(customFields !== undefined && {
          customFields: this.toJson(customFields),
        }),
      },
    });
  }

  /** Soft-archive (hides from the public surface; reversible via restore). */
  async archive(userId: string, id: string): Promise<Event> {
    await this.getOwned(userId, id);
    return this.prisma.event.update({
      where: { id },
      data: { status: 'archived', isArchived: true },
    });
  }

  /** Restore an archived event back to draft for review. */
  async restore(userId: string, id: string): Promise<Event> {
    await this.getOwned(userId, id);
    return this.prisma.event.update({
      where: { id },
      data: { status: 'draft', isArchived: false },
    });
  }

  /** Permanently delete an owned event (cascades to its children). */
  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.prisma.event.delete({ where: { id } });
  }

  // --- public surface ---

  /** Published, non-archived events for public discovery. */
  listPublished(params: ListPublishedParams): Promise<Paginated<Event>> {
    return this.page(
      { status: 'published', isArchived: false },
      params.limit,
      params.cursor,
    );
  }

  /** A single published event by slug; drafts/archived are hidden behind a 404. */
  async getPublishedBySlug(slug: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({ where: { slug } });
    if (!event || event.status !== 'published' || event.isArchived) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  // --- helpers ---

  private async assertSlugFree(slug: string): Promise<void> {
    const existing = await this.prisma.event.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('An event with this slug already exists');
    }
  }

  private async page(
    where: Prisma.EventWhereInput,
    limit: number,
    cursor?: string,
  ): Promise<Paginated<Event>> {
    const rows = await this.prisma.event.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { startDate: 'desc' },
    });
    const nextCursor = rows.length > limit ? (rows.pop()?.id ?? null) : null;
    return new Paginated(rows, nextCursor);
  }

  private toJson(
    value: unknown,
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
    if (value === undefined) return undefined;
    if (value === null) return Prisma.JsonNull;
    return value;
  }
}
