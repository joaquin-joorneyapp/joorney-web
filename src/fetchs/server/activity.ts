import { Activity } from '@/types/fetchs/responses/activity';

export async function fetchCityActivities(citySlug: string): Promise<Activity[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/cities/${citySlug}/activities`);
  if (!res.ok) throw new Error(`fetchCityActivities: ${res.status}`);
  return res.json();
}

export async function fetchActivity(
  citySlug: string,
  activitySlug: string,
): Promise<Activity | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/cities/${citySlug}/activities/${activitySlug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchActivity: ${res.status}`);
  return res.json();
}
