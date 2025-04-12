'use client';

import DisplayPlan from '@/components/plan/DisplayPlan';
import { createInitialPlan, editPlan, getPlan } from '@/fetchs/plan';
import { DailySchedule, Plan } from '@/types/fetchs/responses/plan';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default () => {
  const { planId } = useParams<{ planId: string }>();
  const params = useSearchParams();
  const {
    data: originalPlan = null,
    isLoading,
    refetch,
  } = getPlan(parseInt(planId));
  const [plan, setPlan] = useState(originalPlan);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      console.log('changed');
      const days = parseInt(params.get('days') || '3');
      const categories = params.getAll('categories');
      createInitialPlan(originalPlan?.city.name || '', days, categories).then(
        (plan) => setPlan(plan)
      );
    }
  }, [params]);

  useEffect(() => {
    if (originalPlan) {
      setPlan(originalPlan);
    }
  }, [originalPlan]);

  const onSave = (plan: Plan) => {
    const schedules = plan.schedules.map((s: DailySchedule) =>
      s.activities.map((a) => a.id)
    );
    return editPlan({
      ...plan,
      id: originalPlan?.id,
      cityName: originalPlan?.city.name,
      schedules,
    }).then(() => refetch());
  };

  const onChangedPlan = ({ days, selectedCategories }: any) => {
    const current = new URLSearchParams(Array.from(params.entries()));
    current.set('days', days);
    current.delete('categories');
    for (const category of selectedCategories) {
      current.append('categories', category);
    }
    router.push(`?${current.toString()}`);
  };

  return (
    <DisplayPlan
      saveButtonLabel="Save changes"
      plan={plan}
      handleChangedPlan={onChangedPlan}
      onSave={onSave}
    />
  );
};
