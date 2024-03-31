'use client';
import DisplayPlan from '@/components/plan/DisplayPlan';
import { createInitialPlan } from '@/fetchs/plan';
import { Plan } from '@/types/fetchs/responses/plan';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default () => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const { cityId: cityName } = useParams<{ cityId: string }>();

  useEffect(() => {
    setPlan(null);
    const days = parseInt(params.get('days') || '3');
    const categories = params.getAll('categories');
    createInitialPlan(cityName, days, categories).then((plan) => setPlan(plan));
  }, [params]);

  const onChangedPlan = ({ days, selectedCategories }: any) => {
    const current = new URLSearchParams(Array.from(params.entries()));
    current.set('days', days);
    current.delete('categories');
    for (const category of selectedCategories) {
      current.append('categories', category);
    }
    router.push(`?${current.toString()}`);
  };

  return <DisplayPlan plan={plan} handleChangedPlan={onChangedPlan} />;
};
