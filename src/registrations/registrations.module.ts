import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { EventRegistrationsController } from './event-registrations.controller';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsPublicController } from './registrations.public.controller';
import { RegistrationsService } from './registrations.service';

@Module({
  imports: [PermissionsModule],
  controllers: [
    RegistrationsPublicController,
    EventRegistrationsController,
    RegistrationsController,
  ],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
