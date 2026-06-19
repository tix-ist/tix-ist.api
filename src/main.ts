import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { resolveCorsOptions } from './common/security/cors';
import { setupOpenApi } from './openapi/openapi.setup';

async function bootstrap() {
  // bufferLogs so bootstrap logs are flushed through Pino once it's ready.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('NODE_ENV');
  const isProduction = nodeEnv === 'production';

  // --- Hardening ---
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  // Full helmet defaults in prod; CSP disabled elsewhere so Scalar /reference renders.
  app.use(helmet(isProduction ? {} : { contentSecurityPolicy: false }));
  app.enableCors(
    resolveCorsOptions(nodeEnv, config.get<string>('CORS_ORIGINS')),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();

  // --- Versioning: routes live under /v1 (health + docs stay version-neutral) ---
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Serve the Scalar API reference outside production only (after versioning so paths show /v1).
  if (!isProduction) {
    setupOpenApi(app);
  }

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
}

void bootstrap();
