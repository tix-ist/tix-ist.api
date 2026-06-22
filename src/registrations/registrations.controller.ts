import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Registration } from '@prisma/client';
import type { AuthUser } from '../auth/auth.types';
import {
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTag } from '../openapi/api-tags';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { RegistrationsService } from './registrations.service';

/** Registration item operations (`/registrations/{id}`); access checked in-service. */
@ApiTags(ApiTag.Registrations)
@ApiBearerAuth()
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  /**
   * Get a registration.
   * @remarks Any active member of the registration's event may view.
   */
  @Get(':id')
  @ApiStandardResponse(RegistrationResponseDto, {
    description: 'The registration',
  })
  @ApiProblemResponse(403, 'Not a member of this event')
  @ApiProblemResponse(404, 'Registration not found')
  getById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<Registration> {
    return this.registrations.getById(user.id, id);
  }

  /**
   * Cancel a registration, freeing its ticket slot.
   * @remarks Requires the ATTENDEES module. Hard-deletes the registration.
   */
  @Post(':id/cancel')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Cancelled' })
  @ApiProblemResponse(403, 'Missing ATTENDEES access')
  @ApiProblemResponse(404, 'Registration not found')
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.registrations.cancel(user.id, id);
  }
}
