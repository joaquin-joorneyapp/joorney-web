'use client';
import DisplayPlan from '@/components/plan/DisplayPlan';
import { AuthUserContext } from '@/contexts/AuthUserContext';
import { createInitialPlan, getPlanCreator } from '@/fetchs/plan';
import { DailySchedule, Plan } from '@/types/fetchs/responses/plan';
import { Alert, Snackbar } from '@mui/material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

export default () => {
  const { user } = useContext(AuthUserContext);
  const planCreator = getPlanCreator();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { cityId: cityName } = useParams<{ cityId: string }>();

  const startDate = params.get('date') ?? undefined;
  const DRAFT_KEY = `joorney_draft_plan_${cityName}`;

  useEffect(() => {
    setPlan(null);
    const days = parseInt(params.get('days') || '3');
    const categories = params.getAll('categories');

    // Restore draft only when coming back from a login redirect
    const restoreFlag = sessionStorage.getItem('joorney_restore_draft');
    if (restoreFlag === DRAFT_KEY) {
      sessionStorage.removeItem('joorney_restore_draft');
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          setPlan(JSON.parse(savedDraft) as Plan);
          setDraftRestored(true);
          return;
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }

    createInitialPlan(cityName, days, categories).then((plan) => setPlan(plan));
  }, [params]);

  const onSave = (plan: Plan) => {
    const schedules = plan.schedules.map((s: DailySchedule) =>
      s.activities.map((a) => a.id)
    );
    return planCreator
      .mutateAsync({ ...plan, cityName, schedules, startDate: startDate ?? plan.startDate })
      .then((savedPlan) => {
        localStorage.removeItem(DRAFT_KEY);
        router.replace(`/plans/${savedPlan.id}`);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(plan));
          sessionStorage.setItem('joorney_restore_draft', DRAFT_KEY);
          window.location.href = `/login#redirect=${window.location.pathname + window.location.search}`;
          return new Promise<void>(() => {}); // stay in loading state until redirect
        }
        throw err;
      });
  };

  const handleBack = () => {
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

  return (
    <>
      <DisplayPlan
        plan={plan}
        onSave={onSave}
        onBack={handleBack}
        backLabel="Back"
        startDate={startDate}
      />
      <Snackbar
        open={draftRestored}
        autoHideDuration={6000}
        onClose={() => setDraftRestored(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setDraftRestored(false)} variant="filled">
          Your unsaved trip has been restored.{!user && ' Log in to save it!'}
        </Alert>
      </Snackbar>
    </>
  );
};
