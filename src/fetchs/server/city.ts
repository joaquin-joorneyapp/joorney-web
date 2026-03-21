import { City } from '@/types/fetchs/responses/city';

export async function fetchAllCities(): Promise<City[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/cities`);
  if (!res.ok) throw new Error(`fetchAllCities: ${res.status}`);
  return res.json();
}
