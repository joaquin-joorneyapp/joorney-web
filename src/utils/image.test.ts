import { describe, it, expect } from 'vitest';
import { buildImageUrl } from './image';

const BASE = 'https://storage.googleapis.com/joorney-pictures/';

describe('buildImageUrl', () => {
  it('prepends the base URL to a relative path', () => {
    expect(buildImageUrl('cities/paris.jpg')).toBe(`${BASE}cities/paris.jpg`);
  });

  it('prepends the base URL to a nested path', () => {
    expect(buildImageUrl('a/b/c.png')).toBe(`${BASE}a/b/c.png`);
  });

  it('returns base URL with empty suffix when given an empty string', () => {
    expect(buildImageUrl('')).toBe(BASE);
  });
});
