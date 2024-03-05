import { Activity, ActivityEditForm } from '@/types/fetchs/responses/activity';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = 'http://localhost:3333';

export const getActivities = (cityId: number): UseQueryResult<Activity[]> =>
  useQuery({
    queryKey: ['activities'],
    queryFn: () =>
      axios
        .get(`${BASE_URL}/cities/${cityId}/activities`)
        .then((res) => res.data),
  });

export const getActivity = (
  cityId: number,
  activityId: number
): UseQueryResult<Activity> =>
  useQuery({
    queryKey: [`activity/${activityId}`],
    queryFn: () =>
      axios
        .get(`${BASE_URL}/cities/${cityId}/activities/${activityId}`)
        .then((res) => res.data),
  });

export const editActivity = (activity: ActivityEditForm) =>
  axios.put(`${BASE_URL}/cities/${activity.cityId}/activities/${activity.id}`, {
    ...activity,
  });

  export const createActivity = (activity: ActivityEditForm) =>
  axios.post(`${BASE_URL}/cities/${activity.cityId}/activities`, {
    ...activity,
  });
