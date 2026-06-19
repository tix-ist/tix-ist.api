import { DocumentBuilder } from '@nestjs/swagger';
import { API_TAGS } from './api-tags';

/**
 * Builds the OpenAPI document configuration (title, description, version, bearer
 * auth, and the tag registry). Pure — no Nest app and no Scalar import — so it's
 * safe to unit-test in isolation.
 */
export function buildDocumentConfig() {
  const builder = new DocumentBuilder()
    .setTitle('tix-ist API')
    .setDescription(
      'Standalone event-management API for tix-ist. Success responses are wrapped in ' +
        '`{ data, meta? }`; errors use RFC 7807 `application/problem+json`.',
    )
    .setVersion('0.1.0')
    .addBearerAuth();

  for (const tag of API_TAGS) {
    builder.addTag(tag.name, tag.description);
  }

  return builder.build();
}
