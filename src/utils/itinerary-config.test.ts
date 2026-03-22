import { describe, expect, it } from 'vitest';
import { DURATIONS, THEMES, formatDays, parseDays } from './itinerary-config';

describe('parseDays', () => {
  it('parses supported durations', () => {
    expect(parseDays('3-days')).toBe(3);
    expect(parseDays('5-days')).toBe(5);
    expect(parseDays('7-days')).toBe(7);
  });

  it('returns null for unsupported duration', () => {
    expect(parseDays('4-days')).toBeNull();
    expect(parseDays('10-days')).toBeNull();
  });

  it('returns null for malformed slugs', () => {
    expect(parseDays('3days')).toBeNull();
    expect(parseDays('three-days')).toBeNull();
    expect(parseDays('')).toBeNull();
  });
});

describe('formatDays', () => {
  it('formats a number to the slug form', () => {
    expect(formatDays(3)).toBe('3-days');
    expect(formatDays(7)).toBe('7-days');
  });
});

describe('THEMES', () => {
  it('contains exactly four theme slugs', () => {
    expect(Object.keys(THEMES)).toEqual(['art', 'outdoor', 'food', 'history']);
  });

  it('art theme includes museum and art_gallery', () => {
    expect(THEMES.art.categoryNames).toContain('museum');
    expect(THEMES.art.categoryNames).toContain('art_gallery');
  });

  it('food theme includes restaurant, food, cafe, bar', () => {
    expect(THEMES.food.categoryNames).toEqual(
      expect.arrayContaining(['restaurant', 'food', 'cafe', 'bar']),
    );
  });
});

describe('DURATIONS', () => {
  it('contains 3, 5 and 7', () => {
    expect(DURATIONS).toEqual([3, 5, 7]);
  });
});
