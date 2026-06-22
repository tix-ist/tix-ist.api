import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamMember } from '@prisma/client';
import { PermissionsService } from './permissions.service';
import { MembershipContext, ModuleName } from './permissions.types';
import { REQUIRE_MODULE_KEY } from './require-module.decorator';

interface RbacRequest {
  user?: { id?: string };
  params?: Record<string, string>;
  membership?: TeamMember;
  isOwner?: boolean;
}

/** The event id a guard authorizes against: `:eventId` route param, else `:id`. */
function eventIdOf(req: RbacRequest): string {
  const id = req.params?.eventId ?? req.params?.id;
  if (!id) throw new BadRequestException('Missing event id in route');
  return id;
}

function userIdOf(req: RbacRequest): string {
  const id = req.user?.id;
  if (!id) throw new ForbiddenException('Not authenticated');
  return id;
}

function attach(req: RbacRequest, ctx: MembershipContext): true {
  req.membership = ctx.membership;
  req.isOwner = ctx.isOwner;
  return true;
}

/** Requires the caller to be an ACTIVE member (owner or collaborator) of the event. */
@Injectable()
export class EventAccessGuard implements CanActivate {
  constructor(private readonly permissions: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RbacRequest>();
    const ctx = await this.permissions.checkEventAccess(
      eventIdOf(req),
      userIdOf(req),
    );
    return attach(req, ctx);
  }
}

/** Requires the `@RequireModule(...)` module: owners bypass, collaborators must hold it. */
@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(
    private readonly permissions: PermissionsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<ModuleName | undefined>(
      REQUIRE_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) {
      throw new Error('ModuleGuard used without @RequireModule(...)');
    }
    const req = context.switchToHttp().getRequest<RbacRequest>();
    const ctx = await this.permissions.checkModuleAccess(
      eventIdOf(req),
      userIdOf(req),
      required,
    );
    return attach(req, ctx);
  }
}

/** Requires the caller to be the event owner. */
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly permissions: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RbacRequest>();
    const ctx = await this.permissions.checkIsOwner(
      eventIdOf(req),
      userIdOf(req),
    );
    return attach(req, ctx);
  }
}
