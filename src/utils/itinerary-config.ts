export const DURATIONS = [3, 5, 7] as const;
export type Duration = (typeof DURATIONS)[number];

export const THEME_SLUGS = ['art', 'outdoor', 'food', 'history'] as const;
export type ThemeSlug = (typeof THEME_SLUGS)[number];

export interface ThemeConfig {
  label: string;
  categoryNames: string[];
}

export const THEMES: Record<ThemeSlug, ThemeConfig> = {
  art:     { label: 'Art & Culture', categoryNames: ['museum', 'art_gallery'] },
  outdoor: { label: 'Outdoor',       categoryNames: ['park', 'natural_feature'] },
  food:    { label: 'Food & Drink',  categoryNames: ['restaurant', 'food', 'cafe', 'bar'] },
  history: { label: 'History',       categoryNames: ['church', 'place_of_worship'] },
};

/** "3-days" → 3. Returns null for unrecognised or unsupported slugs. */
export function parseDays(slug: string): Duration | null {
  const match = slug.match(/^(\d+)-days$/);
  if (!match) return null;
  const n = Number(match[1]);
  return (DURATIONS as readonly number[]).includes(n) ? (n as Duration) : null;
}

/** 3 → "3-days" */
export function formatDays(n: number): string {
  return `${n}-days`;
}
