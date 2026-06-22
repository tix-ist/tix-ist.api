import { Module } from '@nestjs/common';
import { EventAccessGuard, ModuleGuard, OwnerGuard } from './event-rbac.guards';
import { PermissionsService } from './permissions.service';

/**
 * Event-scoped RBAC: the `PermissionsService` and the three guards
 * (`EventAccessGuard`/`ModuleGuard`/`OwnerGuard`). Feature modules import this to
 * `@UseGuards(...)` on their event-scoped routes.
 */
@Module({
  providers: [PermissionsService, EventAccessGuard, ModuleGuard, OwnerGuard],
  exports: [PermissionsService, EventAccessGuard, ModuleGuard, OwnerGuard],
})
export class PermissionsModule {}
