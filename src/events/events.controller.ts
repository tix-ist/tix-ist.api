import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { Event } from '@prisma/client';
import type { AuthUser } from '../auth/auth.types';
import {
  ApiPaginatedResponse,
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Paginated } from '../common/pagination/paginated';
import { ApiTag } from '../openapi/api-tags';
import { CreateEventDto } from './dto/create-event.dto';
import {
  EventResponseDto,
  EventStatusCountsDto,
} from './dto/event-response.dto';
import { ListEventsQuery } from './dto/list-events.query';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

const DEFAULT_LIMIT = 20;

@ApiTags(ApiTag.Events)
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /**
   * Create an event.
   * @remarks The caller becomes the organizer/owner. The slug must be globally unique.
   */
  @Post()
  @HttpCode(201)
  @ApiStandardResponse(EventResponseDto, {
    status: 201,
    description: 'Created',
  })
  @ApiProblemResponse(409, 'Slug already in use')
  @ApiProblemResponse(400, 'Validation failed')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEventDto,
  ): Promise<Event> {
    return this.events.create(user.id, dto);
  }

  /**
   * List the caller's own events.
   * @remarks Newest first, cursor-paginated. Optionally filter by lifecycle status.
   */
  @Get()
  @ApiPaginatedResponse(EventResponseDto, {
    description: "The caller's events",
  })
  listMine(
    @CurrentUser() user: AuthUser,
    @Query() query: ListEventsQuery,
  ): Promise<Paginated<Event>> {
    return this.events.listMine(user.id, {
      limit: query.limit ?? DEFAULT_LIMIT,
      cursor: query.cursor,
      status: query.status,
    });
  }

  /**
   * Counts of the caller's events grouped by status.
   */
  @Get('status-counts')
  @ApiStandardResponse(EventStatusCountsDto, {
    description: 'Counts per status',
  })
  statusCounts(@CurrentUser() user: AuthUser): Promise<EventStatusCountsDto> {
    return this.events.statusCounts(user.id);
  }

  /**
   * Get one of the caller's events by id.
   */
  @Get(':id')
  @ApiStandardResponse(EventResponseDto, { description: 'The event' })
  @ApiProblemResponse(403, 'Not the owner')
  @ApiProblemResponse(404, 'Event not found')
  getById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<Event> {
    return this.events.getOwned(user.id, id);
  }

  /**
   * Update an event.
   * @remarks Patch any subset of fields. Changing the slug re-checks uniqueness.
   */
  @Patch(':id')
  @ApiStandardResponse(EventResponseDto, { description: 'The updated event' })
  @ApiProblemResponse(409, 'Slug already in use')
  @ApiProblemResponse(403, 'Not the owner')
  @ApiProblemResponse(404, 'Event not found')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ): Promise<Event> {
    return this.events.update(user.id, id, dto);
  }

  /**
   * Soft-archive an event.
   * @remarks Hides it from the public surface; reversible via restore.
   */
  @Post(':id/archive')
  @ApiStandardResponse(EventResponseDto, { description: 'The archived event' })
  @ApiProblemResponse(403, 'Not the owner')
  @ApiProblemResponse(404, 'Event not found')
  archive(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<Event> {
    return this.events.archive(user.id, id);
  }

  /**
   * Restore an archived event back to draft.
   */
  @Post(':id/restore')
  @ApiStandardResponse(EventResponseDto, { description: 'The restored event' })
  @ApiProblemResponse(403, 'Not the owner')
  @ApiProblemResponse(404, 'Event not found')
  restore(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<Event> {
    return this.events.restore(user.id, id);
  }

  /**
   * Permanently delete an event.
   * @remarks Cascades to all the event's child records. Cannot be undone.
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiProblemResponse(403, 'Not the owner')
  @ApiProblemResponse(404, 'Event not found')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.events.remove(user.id, id);
  }
}
