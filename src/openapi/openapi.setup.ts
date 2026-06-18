import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Request, Response } from 'express';

/**
 * Builds the OpenAPI document from the @nestjs/swagger decorators and serves it:
 *   - raw spec at GET /openapi.json
 *   - Scalar API reference UI at GET /reference
 *
 * Call only outside production (the reference is dev/staging-facing).
 */
export function setupOpenApi(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('tix-ist API')
    .setDescription('Standalone event-management API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const http = app.getHttpAdapter();
  http.get('/openapi.json', (_req: Request, res: Response) => {
    res.json(document);
  });

  app.use('/reference', apiReference({ content: document }));
}
