import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiTag } from '../openapi/api-tags';
import { TicketPublicDto } from './dto/ticket-response.dto';
import { TicketsService } from './tickets.service';

/** Attendee self-service ticket lookup by number. */
@ApiTags(ApiTag.Tickets)
@Public()
@Controller('public/tickets')
export class TicketsPublicController {
  constructor(private readonly tickets: TicketsService) {}

  /**
   * Look up a ticket by its number.
   * @remarks Public, no auth — the ticket number is the holder's credential. Only tickets
   * of a published event are visible.
   */
  @Get(':ticketNumber')
  @ApiStandardResponse(TicketPublicDto, { description: 'The ticket' })
  @ApiProblemResponse(404, 'Ticket not found or event not published')
  getByNumber(@Param('ticketNumber') ticketNumber: string) {
    return this.tickets.getPublicByNumber(ticketNumber);
  }
}
