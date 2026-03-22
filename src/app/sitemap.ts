import { fetchCityActivities } from '@/fetchs/server/activity';
import { fetchAllCities } from '@/fetchs/server/city';
import { DURATIONS, THEME_SLUGS, formatDays } from '@/utils/itinerary-config';
import type { MetadataRoute } from 'next';

export const revalidate = 3600;

const BASE_URL = 'https://joorney.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'monthly', priority: 1.0, lastModified: new Date() },
  ];

  try {
    const cities = await fetchAllCities();
    for (const city of cities) {
      entries.push({
        url: `${BASE_URL}/cities/${city.name}/activities`,
        changeFrequency: 'weekly',
        priority: 0.8,
        lastModified: new Date(),
      });
      try {
        const activities = await fetchCityActivities(city.name);
        for (const activity of activities) {
          entries.push({
            url: `${BASE_URL}/cities/${city.name}/activities/${activity.name}`,
            changeFrequency: 'weekly',
            priority: 0.9,
            lastModified: new Date(),
          });
        }
      } catch {
        // skip this city's activities if the endpoint is unavailable
      }
      for (const days of DURATIONS) {
        entries.push({
          url: `${BASE_URL}/cities/${city.name}/itinerary/${formatDays(days)}`,
          changeFrequency: 'weekly',
          priority: 0.85,
          lastModified: new Date(),
        });
      }
      for (const days of DURATIONS) {
        for (const theme of THEME_SLUGS) {
          entries.push({
            url: `${BASE_URL}/cities/${city.name}/itinerary/${formatDays(days)}/${theme}`,
            changeFrequency: 'weekly',
            priority: 0.85,
            lastModified: new Date(),
          });
        }
      }
    }
  } catch {
    // return just the root entry if the API is unreachable
  }

  return entries;
}
