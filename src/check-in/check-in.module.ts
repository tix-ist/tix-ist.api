import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { CheckInService } from './check-in.service';
import { EventCheckInController } from './event-check-in.controller';

@Module({
  imports: [PermissionsModule],
  controllers: [EventCheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}
