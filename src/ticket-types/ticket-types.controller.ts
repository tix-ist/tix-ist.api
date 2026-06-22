import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { TicketType } from '@prisma/client';
import type { AuthUser } from '../auth/auth.types';
import {
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTag } from '../openapi/api-tags';
import { TicketTypeResponseDto } from './dto/ticket-type-response.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import {
  TicketTypesService,
  type TicketTypeWithAvailability,
} from './ticket-types.service';

/** Tier-level operations (`/ticket-types/{id}`); event access is checked in-service. */
@ApiTags(ApiTag.TicketTypes)
@ApiBearerAuth()
@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypes: TicketTypesService) {}

  /**
   * Get a ticket tier with availability.
   * @remarks Any active member of the tier's event may view.
   */
  @Get(':id')
  @ApiStandardResponse(TicketTypeResponseDto, { description: 'The tier' })
  @ApiProblemResponse(403, 'Not a member of this event')
  @ApiProblemResponse(404, 'Ticket type not found')
  getById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<TicketTypeWithAvailability> {
    return this.ticketTypes.getById(user.id, id);
  }

  /**
   * Update a ticket tier.
   * @remarks Requires the TICKETS module. Quantity can't drop below sold; price locks once sold.
   */
  @Patch(':id')
  @ApiStandardResponse(TicketTypeResponseDto, {
    description: 'The updated tier',
  })
  @ApiProblemResponse(403, 'Missing TICKETS access')
  @ApiProblemResponse(404, 'Ticket type not found')
  @ApiProblemResponse(
    400,
    'Quantity below sold, price locked, or bad sale window',
  )
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTicketTypeDto,
  ): Promise<TicketType> {
    return this.ticketTypes.update(user.id, id, dto);
  }

  /**
   * Delete a ticket tier.
   * @remarks Requires the TICKETS module. Blocked once the tier has registrations.
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiProblemResponse(403, 'Missing TICKETS access')
  @ApiProblemResponse(404, 'Ticket type not found')
  @ApiProblemResponse(400, 'Tier has registrations')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.ticketTypes.remove(user.id, id);
  }
}
