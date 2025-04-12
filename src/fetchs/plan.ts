'use client';

import { anonymousAxios, authAxios } from '@/configs/axios';
import { Plan } from '@/types/fetchs/responses/plan';
import {
  UseQueryResult,
  useMutation,
  useQuery
} from '@tanstack/react-query';

export const getPlans = (): UseQueryResult<Plan[]> =>
  useQuery({
    queryKey: ['plans'],
    queryFn: () => authAxios.get(`/plans`).then((res) => res.data),
  });

export const countPlans = (): UseQueryResult<{ count: number }> =>
  useQuery({
    queryKey: ['count-plans'],
    queryFn: () => authAxios.get(`/plans/count`).then((res) => res.data),
    enabled: !!(
      typeof localStorage !== 'undefined' && localStorage.getItem('user')
    ),
  });

export const getPlan = (planId: number): UseQueryResult<Plan> =>
  useQuery({
    queryKey: [`plans/${planId}`],
    queryFn: () => authAxios.get(`/plans/${planId}`).then((res) => res.data),
  });

export const createInitialPlan = (
  cityName: string,
  days: number,
  categories: any[]
) =>
  anonymousAxios
    .post<Plan>('/plans/initial', { cityName, days, categories })
    .then((res) => res.data);

export const editPlan = (body: any) =>
  authAxios.put<Plan>(`/plans/${body.id}`, { ...body }).then((res) => res.data);

export const getPlanCreator = () =>
  useMutation({
    mutationFn: (body: any) =>
      authAxios.post<Plan>('/plans', { ...body }).then((res) => res.data),
  });
