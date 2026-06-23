import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Ticket } from '@prisma/client';
import type { AuthUser } from '../auth/auth.types';
import {
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTag } from '../openapi/api-tags';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TicketsService } from './tickets.service';

/** Ticket item operations (`/tickets/{id}`); event access is checked in-service. */
@ApiTags(ApiTag.Tickets)
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  /**
   * Get a ticket with its tier and buyer.
   * @remarks Any active member of the ticket's event may view.
   */
  @Get(':id')
  @ApiStandardResponse(TicketResponseDto, { description: 'The ticket' })
  @ApiProblemResponse(403, 'Not a member of this event')
  @ApiProblemResponse(404, 'Ticket not found')
  getById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<Ticket> {
    return this.tickets.getById(user.id, id);
  }
}
