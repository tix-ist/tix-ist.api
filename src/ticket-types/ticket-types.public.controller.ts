import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiTag } from '../openapi/api-tags';
import { TicketTypeResponseDto } from './dto/ticket-type-response.dto';
import {
  TicketTypesService,
  type TicketTypeWithAvailability,
} from './ticket-types.service';

/** Public registration view of a published event's available ticket tiers. */
@ApiTags(ApiTag.TicketTypes)
@Public()
@Controller('public/events/:slug/ticket-types')
export class TicketTypesPublicController {
  constructor(private readonly ticketTypes: TicketTypesService) {}

  /**
   * List on-sale, available ticket tiers for a published event.
   * @remarks Public, no auth. Sold-out and out-of-window tiers are omitted; drafts 404.
   */
  @Get()
  @ApiStandardResponse(TicketTypeResponseDto, {
    description: 'Available tiers',
    isArray: true,
  })
  @ApiProblemResponse(404, 'Event not found or not published')
  list(@Param('slug') slug: string): Promise<TicketTypeWithAvailability[]> {
    return this.ticketTypes.listPublicBySlug(slug);
  }
}
