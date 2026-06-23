import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiTag } from '../openapi/api-tags';
import { RegisterDto } from './dto/register.dto';
import { RegistrationConfirmationDto } from './dto/registration-response.dto';
import {
  RegistrationsService,
  type RegistrationWithTickets,
} from './registrations.service';

/** Public self-registration for a published event. */
@ApiTags(ApiTag.Registrations)
@Public()
@Controller('public/registrations')
export class RegistrationsPublicController {
  constructor(private readonly registrations: RegistrationsService) {}

  /**
   * Self-register for an event.
   * @remarks Public, no auth. Concurrency-safe (no overselling). Only free ticket tiers of
   * a published event are registrable until payment is available.
   */
  @Post()
  @HttpCode(201)
  @ApiStandardResponse(RegistrationConfirmationDto, {
    status: 201,
    description: 'Registered (returns the order and its minted tickets)',
  })
  @ApiProblemResponse(
    400,
    'Sold out, paid tier, outside sale window, or invalid quantity',
  )
  @ApiProblemResponse(404, 'Ticket type or published event not found')
  register(@Body() dto: RegisterDto): Promise<RegistrationWithTickets> {
    return this.registrations.register(dto);
  }
}
