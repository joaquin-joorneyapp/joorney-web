import { fetchAllCities } from '@/fetchs/server/city';
import { fetchCityActivities } from '@/fetchs/server/activity';
import type { MetadataRoute } from 'next';

export const revalidate = 3600; // stays in sync with ISR pages

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
    }
  } catch {
    // return just the root entry if the API is unreachable
  }

  return entries;
}
