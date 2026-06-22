import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { EventsController } from './events.controller';
import { EventsPublicController } from './events.public.controller';
import { EventsService } from './events.service';

@Module({
  imports: [PermissionsModule],
  controllers: [EventsController, EventsPublicController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
