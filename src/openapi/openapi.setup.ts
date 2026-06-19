import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Request, Response } from 'express';
import { buildDocumentConfig } from './document-config';

/**
 * Builds the OpenAPI document from the @nestjs/swagger decorators and serves it:
 *   - raw spec at GET /openapi.json
 *   - Scalar API reference UI at GET /reference
 *
 * Call only outside production (the reference is dev/staging-facing).
 */
export function setupOpenApi(app: INestApplication): void {
  const document = SwaggerModule.createDocument(app, buildDocumentConfig());

  const http = app.getHttpAdapter();
  http.get('/openapi.json', (_req: Request, res: Response) => {
    res.json(document);
  });

  app.use('/reference', apiReference({ content: document }));
}
