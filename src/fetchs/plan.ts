import { anonymousAxios } from '@/configs/axios';
import { Plan } from '@/types/fetchs/responses/plan';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

const PLANS = [
  {
    city: 'New York',
    start: new Date(2023, 1, 1),
    duration: 5,
    activities: [[], [], []],
    pictures: [
      '/pictures/nyc/nyc-1.jpg',
      '/pictures/nyc/nyc-2.jpg',
      '/pictures/nyc/nyc-3.jpeg',
    ],
  },
];

export const getSavedPlans = (): UseQueryResult<Plan[]> =>
  useQuery({
    queryKey: ['saved-plans'],
    queryFn: () =>
      new Promise((resolve, _) => setTimeout(() => resolve([...PLANS]), 1000)),
  });
/*
  axios
        .get("https://jsonplaceholder.typicode.com/posts")
        .then((res) => res.data)
        */

export const createInitialPlan = (
  cityName: string,
  days: number,
  categories: any[]
) =>
  anonymousAxios
    .post<Plan>('/plans/initial', { cityName, days, categories })
    .then((res) => res.data);
