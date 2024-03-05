import { City } from '@/types/fetchs/responses/city';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = 'http://localhost:3333';

export const getCities = (): UseQueryResult<City[]> =>
  useQuery({
    queryKey: ['cities'],
    queryFn: () => axios.get(`${BASE_URL}/cities`).then((res) => res.data),
  });

export const getCity = (cityId: number): UseQueryResult<City> =>
  useQuery({
    queryKey: [`cities/${cityId}`],
    queryFn: () =>
      axios.get(`${BASE_URL}/cities/${cityId}`).then((res) => res.data),
  });
