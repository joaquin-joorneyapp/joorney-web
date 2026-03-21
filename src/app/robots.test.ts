import { describe, expect, it } from 'vitest';
import robots from './robots';

describe('robots', () => {
  it('disallows authenticated-only routes', () => {
    const result = robots();
    const disallowed = Array.isArray(result.rules)
      ? result.rules.flatMap((r: any) => [r.disallow].flat())
      : [(result.rules as any).disallow].flat();
    expect(disallowed).toContain('/home');
    expect(disallowed).toContain('/plans');
    expect(disallowed).toContain('/saved-plans');
    expect(disallowed).toContain('/cities/*/activities/manage');
  });

  it('includes the sitemap URL', () => {
    const result = robots();
    expect(result.sitemap).toBe('https://joorney.com/sitemap.xml');
  });
});
