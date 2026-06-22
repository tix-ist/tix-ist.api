import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { EventTicketTypesController } from './event-ticket-types.controller';
import { TicketTypesController } from './ticket-types.controller';
import { TicketTypesPublicController } from './ticket-types.public.controller';
import { TicketTypesService } from './ticket-types.service';

@Module({
  imports: [PermissionsModule],
  controllers: [
    EventTicketTypesController,
    TicketTypesController,
    TicketTypesPublicController,
  ],
  providers: [TicketTypesService],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}
