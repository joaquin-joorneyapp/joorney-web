'use client';

import DisplayPlan from '@/components/plan/DisplayPlan';
import { getPlan } from '@/fetchs/plan';
import { useParams, useRouter } from 'next/navigation';

export default () => {
  const { planId } = useParams<{ planId: string }>();
  const router = useRouter();
  const { data: plan = null } = getPlan(parseInt(planId));

  return (
    <DisplayPlan
      plan={plan}
      readOnly
      onEdit={() => router.push(`/plans/${planId}/edit`)}
    />
  );
};
