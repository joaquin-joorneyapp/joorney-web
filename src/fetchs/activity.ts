import { anonymousAxios, authAxios } from '@/configs/axios';
import { Activity, ActivityEditForm } from '@/types/fetchs/responses/activity';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

export const getActivities = (cityId: number): UseQueryResult<Activity[]> =>
  useQuery({
    queryKey: ['activities', cityId],
    queryFn: () =>
      authAxios.get(`/cities/${cityId}/activities`).then((res) => res.data),
    enabled: !!cityId,
  });

export const getActivity = (
  cityName: string,
  activityName: string
): UseQueryResult<Activity> =>
  useQuery({
    queryKey: [`cities/${cityName}/activity/${activityName}`],
    queryFn: () =>
      anonymousAxios
        .get(`/cities/${cityName}/activities/${activityName}`)
        .then((res) => res.data),
  });

export const editActivity = (activity: ActivityEditForm) =>
  authAxios.put(`/cities/${activity.cityId}/activities/${activity.id}`, {
    ...activity,
  });

export const createActivity = (activity: ActivityEditForm) =>
  authAxios.post(`/cities/${activity.cityId}/activities`, {
    ...activity,
  });

export interface ActivityWithDistance extends Activity {
  distance: number;
}

export const getClosestActivities = (
  lat: number | null,
  lng: number | null,
  limit = 10
): UseQueryResult<ActivityWithDistance[]> =>
  useQuery({
    queryKey: ['activities/closest', lat, lng],
    queryFn: () =>
      anonymousAxios
        .get('/activities/closest', { params: { latitude: lat, longitude: lng, limit } })
        .then((res) => res.data),
    enabled: !!lat && !!lng,
  });
