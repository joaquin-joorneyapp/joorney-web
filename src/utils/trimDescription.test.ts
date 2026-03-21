import { describe, expect, it } from 'vitest';
import { trimDescription } from './trimDescription';

describe('trimDescription', () => {
  it('returns the text unchanged when under the limit', () => {
    expect(trimDescription('Short text', 160)).toBe('Short text');
  });

  it('trims at the last word boundary before the limit', () => {
    const text = 'The quick brown fox jumped over the lazy dog and kept running forever and ever';
    const result = trimDescription(text, 40);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(41);
    expect(result).not.toMatch(/\s…$/); // no trailing space before ellipsis
    expect(result).toBe('The quick brown fox jumped over the…');
  });

  it('returns empty string for null', () => {
    expect(trimDescription(null, 160)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(trimDescription(undefined, 160)).toBe('');
  });

  it('falls back to hard cut when no spaces', () => {
    expect(trimDescription('abcdefghijklmnopqrstuvwxyz', 10)).toBe('abcdefghij…');
  });
});
