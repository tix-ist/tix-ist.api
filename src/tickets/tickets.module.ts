import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { EventTicketsController } from './event-tickets.controller';
import { TicketsController } from './tickets.controller';
import { TicketsPublicController } from './tickets.public.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [PermissionsModule],
  controllers: [
    EventTicketsController,
    TicketsController,
    TicketsPublicController,
  ],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
