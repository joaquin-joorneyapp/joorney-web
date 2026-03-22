import { Plan } from '@/types/fetchs/responses/plan';

export async function fetchSampleItinerary(
  citySlug: string,
  days: number,
  categoryIds: number[],
): Promise<Plan> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/plans/initial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cityName: citySlug, days, categories: categoryIds }),
    // Note: next: { revalidate } has no effect on POST requests in Next.js App Router.
    // ISR caching is controlled by the page-level `export const revalidate = 604800`.
  });
  if (!res.ok) throw new Error(`fetchSampleItinerary: ${res.status}`);
  return res.json();
}
