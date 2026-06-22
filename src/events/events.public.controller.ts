import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Event } from '@prisma/client';
import {
  ApiPaginatedResponse,
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Paginated } from '../common/pagination/paginated';
import { ApiTag } from '../openapi/api-tags';
import { EventResponseDto } from './dto/event-response.dto';
import { ListEventsQuery } from './dto/list-events.query';
import { EventsService } from './events.service';

const DEFAULT_LIMIT = 20;

/** Anonymous discovery surface — only published, non-archived events are visible. */
@ApiTags(ApiTag.Events)
@Public()
@Controller('public/events')
export class EventsPublicController {
  constructor(private readonly events: EventsService) {}

  /**
   * List published events.
   * @remarks Public, no auth. Only published, non-archived events are returned.
   */
  @Get()
  @ApiPaginatedResponse(EventResponseDto, { description: 'Published events' })
  list(@Query() query: ListEventsQuery): Promise<Paginated<Event>> {
    return this.events.listPublished({
      limit: query.limit ?? DEFAULT_LIMIT,
      cursor: query.cursor,
    });
  }

  /**
   * Get a published event by slug.
   * @remarks Drafts and archived events are hidden behind a 404.
   */
  @Get(':slug')
  @ApiStandardResponse(EventResponseDto, { description: 'The event' })
  @ApiProblemResponse(404, 'Event not found or not published')
  getBySlug(@Param('slug') slug: string): Promise<Event> {
    return this.events.getPublishedBySlug(slug);
  }
}
