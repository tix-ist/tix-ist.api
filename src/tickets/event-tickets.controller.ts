import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Ticket } from '@prisma/client';
import {
  ApiPaginatedResponse,
  ApiProblemResponse,
} from '../common/decorators/api-standard-response.decorator';
import { Paginated } from '../common/pagination/paginated';
import { ApiTag } from '../openapi/api-tags';
import { ModuleGuard } from '../permissions/event-rbac.guards';
import { Module } from '../permissions/permissions.types';
import { RequireModule } from '../permissions/require-module.decorator';
import { ListTicketsQuery } from './dto/list-tickets.query';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TicketsService } from './tickets.service';

const DEFAULT_LIMIT = 20;

/** Organizer view of an event's issued tickets (`/events/{eventId}/tickets`). */
@ApiTags(ApiTag.Tickets)
@ApiBearerAuth()
@Controller('events/:eventId/tickets')
export class EventTicketsController {
  constructor(private readonly tickets: TicketsService) {}

  /**
   * List the event's tickets.
   * @remarks Requires the ATTENDEES module. Newest first, cursor-paginated; filter by
   * tier, assignment and check-in state.
   */
  @Get()
  @UseGuards(ModuleGuard)
  @RequireModule(Module.Attendees)
  @ApiPaginatedResponse(TicketResponseDto, { description: 'Tickets' })
  @ApiProblemResponse(403, 'Missing ATTENDEES access')
  list(
    @Param('eventId') eventId: string,
    @Query() query: ListTicketsQuery,
  ): Promise<Paginated<Ticket>> {
    return this.tickets.list(eventId, {
      limit: query.limit ?? DEFAULT_LIMIT,
      cursor: query.cursor,
      ticketTypeId: query.ticketTypeId,
      isCheckedIn: query.isCheckedIn,
      isAssigned: query.isAssigned,
    });
  }
}
