import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Ticket } from '@prisma/client';
import type { AuthUser } from '../auth/auth.types';
import {
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTag } from '../openapi/api-tags';
import { ModuleGuard } from '../permissions/event-rbac.guards';
import { Module } from '../permissions/permissions.types';
import { RequireModule } from '../permissions/require-module.decorator';
import {
  CheckInMetricsDto,
  CheckInResultDto,
} from './dto/check-in-response.dto';
import { CheckInDto } from './dto/check-in.dto';
import { TicketResponseDto } from '../tickets/dto/ticket-response.dto';
import {
  CheckInMetrics,
  CheckInResult,
  CheckInService,
} from './check-in.service';

/** On-site check-in for an event (`/events/{eventId}/check-in`); all CHECKIN-gated. */
@ApiTags(ApiTag.CheckIn)
@ApiBearerAuth()
@UseGuards(ModuleGuard)
@RequireModule(Module.Checkin)
@Controller('events/:eventId/check-in')
export class EventCheckInController {
  constructor(private readonly checkIn: CheckInService) {}

  /**
   * Check a ticket in by number or QR payload.
   * @remarks Requires the CHECKIN module. **Idempotent** — an already-checked-in ticket
   * returns success with `alreadyCheckedIn: true` and is not re-stamped.
   */
  @Post()
  @HttpCode(200)
  @ApiStandardResponse(CheckInResultDto, { description: 'Check-in result' })
  @ApiProblemResponse(400, 'Neither ticket number nor QR provided')
  @ApiProblemResponse(403, 'Missing CHECKIN access')
  @ApiProblemResponse(404, 'Ticket not found for this event')
  check(
    @CurrentUser() user: AuthUser,
    @Param('eventId') eventId: string,
    @Body() dto: CheckInDto,
  ): Promise<CheckInResult> {
    return this.checkIn.checkIn(user.id, eventId, dto);
  }

  /**
   * Look up a ticket by number for the confirmation step before checking in.
   * @remarks Requires the CHECKIN module.
   */
  @Get('ticket/:ticketNumber')
  @ApiStandardResponse(TicketResponseDto, { description: 'The ticket' })
  @ApiProblemResponse(403, 'Missing CHECKIN access')
  @ApiProblemResponse(404, 'Ticket not found for this event')
  ticket(
    @Param('eventId') eventId: string,
    @Param('ticketNumber') ticketNumber: string,
  ): Promise<Ticket> {
    return this.checkIn.getByNumber(eventId, ticketNumber);
  }

  /**
   * Live check-in statistics and the most recent check-ins.
   * @remarks Requires the CHECKIN module.
   */
  @Get('metrics')
  @ApiStandardResponse(CheckInMetricsDto, { description: 'Check-in metrics' })
  @ApiProblemResponse(403, 'Missing CHECKIN access')
  metrics(@Param('eventId') eventId: string): Promise<CheckInMetrics> {
    return this.checkIn.metrics(eventId);
  }
}
