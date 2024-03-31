import { anonymousAxios } from '@/configs/axios';
import { City } from '@/types/fetchs/responses/city';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

export const getCities = (): UseQueryResult<City[]> =>
  useQuery({
    queryKey: ['cities'],
    queryFn: () => anonymousAxios.get(`/cities`).then((res) => res.data),
  });

export const getCity = (cityId: number): UseQueryResult<City> =>
  useQuery({
    queryKey: [`cities/${cityId}`],
    queryFn: () =>
      anonymousAxios.get(`/cities/${cityId}`).then((res) => res.data),
  });
