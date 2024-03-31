'use client';
import DisplayActivity from '@/components/plan/DisplayActivity';
import { useParams } from 'next/navigation';

export default function SavedPlansPage({}) {
  const { cityId: cityName, activityId: activityName } = useParams<{
    cityId: string;
    activityId: string;
  }>();

  return <DisplayActivity activityName={activityName} cityName={cityName} />;
}
