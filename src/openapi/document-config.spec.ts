import { describe, expect, it } from '@jest/globals';
import { API_TAGS } from './api-tags';
import { buildDocumentConfig } from './document-config';

describe('buildDocumentConfig', () => {
  it('registers every API tag with its description', () => {
    const doc = buildDocumentConfig();
    const tags = doc.tags ?? [];

    for (const tag of API_TAGS) {
      const found = tags.find((t) => t.name === tag.name);
      expect(found).toBeDefined();
      expect(found?.description).toBe(tag.description);
    }
  });

  it('declares a bearer security scheme', () => {
    const doc = buildDocumentConfig();
    expect(doc.components?.securitySchemes).toHaveProperty('bearer');
  });
});
