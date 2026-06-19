import { describe, expect, it } from '@jest/globals';
import { API_TAGS, ApiTag } from './api-tags';

describe('API_TAGS registry', () => {
  it('has unique tag names', () => {
    const names = API_TAGS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every tag a non-empty description', () => {
    for (const tag of API_TAGS) {
      expect(tag.name.length).toBeGreaterThan(0);
      expect(tag.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('has a registry entry for every ApiTag constant', () => {
    const names = new Set(API_TAGS.map((t) => t.name));
    for (const name of Object.values(ApiTag)) {
      expect(names.has(name)).toBe(true);
    }
  });
});
