'use client';
import DisplayPlan from '@/components/plan/DisplayPlan';
import { AuthUserContext } from '@/contexts/AuthUserContext';
import { createInitialPlan, getPlanCreator } from '@/fetchs/plan';
import { DailySchedule, Plan } from '@/types/fetchs/responses/plan';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

export default () => {
  const { user } = useContext(AuthUserContext);
  const planCreator = getPlanCreator();
  const [plan, setPlan] = useState<Plan | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const { cityId: cityName } = useParams<{ cityId: string }>();

  useEffect(() => {
    setPlan(null);
    const days = parseInt(params.get('days') || '3');
    const categories = params.getAll('categories');
    const startDate = params.get('date') ?? undefined;
    createInitialPlan(cityName, days, categories).then((plan) => setPlan(plan));
  }, [params]);

  const onSave = (plan: Plan) => {
    const schedules = plan.schedules.map((s: DailySchedule) =>
      s.activities.map((a) => a.id)
    );
    return planCreator
      .mutateAsync({ ...plan, cityName, schedules, startDate: startDate ?? plan.startDate })
      .then((plan) => router.replace(`/plans/${plan.id}`));
  };

  const handleBack = () => {
    // Return to wizard step 2 (Categories) with all current selections preserved
    const backParams = new URLSearchParams();
    backParams.set('city', cityName);
    backParams.set('step', '2');
    const days = params.get('days');
    if (days) backParams.set('days', days);
    for (const cat of params.getAll('categories')) backParams.append('categories', cat);
    const date = params.get('date');
    if (date) backParams.set('date', date);
    router.push(`/new-plan?${backParams.toString()}`);
  };

  const startDate = params.get('date') ?? undefined;

  return (
    <DisplayPlan
      plan={plan}
      onSave={onSave}
      onBack={handleBack}
      backLabel="Back"
      startDate={startDate}
    />
  );
};
