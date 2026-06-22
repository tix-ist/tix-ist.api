import { SetMetadata } from '@nestjs/common';
import { ModuleName } from './permissions.types';

export const REQUIRE_MODULE_KEY = 'requireModule';

/**
 * Marks a route as requiring a specific event module. Pair with `ModuleGuard`:
 * owners bypass, collaborators must hold the module in their permissions.
 */
export const RequireModule = (module: ModuleName) =>
  SetMetadata(REQUIRE_MODULE_KEY, module);
