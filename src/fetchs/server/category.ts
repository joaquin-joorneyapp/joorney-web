import { Category } from '@/types/fetchs/responses/category';

export async function fetchAllCategories(): Promise<Category[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/categories`, {
    next: { revalidate: 604800 },
  });
  if (!res.ok) throw new Error(`fetchAllCategories: ${res.status}`);
  return res.json();
}
