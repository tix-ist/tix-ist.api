import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Resolves CORS options from the environment: any origin is reflected outside
 * production; in production only the comma-separated `CORS_ORIGINS` allowlist is
 * permitted (an empty/blank list denies all cross-origin requests).
 */
export function resolveCorsOptions(
  nodeEnv: string | undefined,
  corsOrigins: string | undefined,
): CorsOptions {
  if (nodeEnv !== 'production') {
    return { origin: true, credentials: true };
  }

  const allowlist = (corsOrigins ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  return {
    origin: allowlist.length > 0 ? allowlist : false,
    credentials: true,
  };
}
