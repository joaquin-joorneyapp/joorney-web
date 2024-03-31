import { anonymousAxios } from '@/configs/axios';
import { Category } from '@/types/fetchs/responses/category';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

export const getCategories = (): UseQueryResult<Category[]> =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => anonymousAxios.get(`/categories`).then((res) => res.data),
  });
