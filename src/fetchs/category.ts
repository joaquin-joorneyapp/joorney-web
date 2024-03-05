import { Category } from '@/types/fetchs/responses/category';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = 'http://localhost:3333';

export const getCategories = (): UseQueryResult<Category[]> =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => axios.get(`${BASE_URL}/categories`).then((res) => res.data),
  });
