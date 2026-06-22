import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TeamMember } from '@prisma/client';

/**
 * The caller's resolved team membership for the event, set by the RBAC guards
 * (`EventAccessGuard`/`ModuleGuard`/`OwnerGuard`). Undefined if no guard ran.
 */
export const CurrentMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ membership?: TeamMember }>();
    return req.membership;
  },
);
