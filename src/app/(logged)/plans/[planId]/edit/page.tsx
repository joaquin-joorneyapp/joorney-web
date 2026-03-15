'use client';

import CategoryPicker from '@/components/plan-form/CategoryPicker';
import DurationPicker from '@/components/plan-form/DurationPicker';
import DisplayPlan from '@/components/plan/DisplayPlan';
import { getCategories } from '@/fetchs/category';
import { createInitialPlan, editPlan, getPlan } from '@/fetchs/plan';
import { DailySchedule, Plan } from '@/types/fetchs/responses/plan';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EditPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const router = useRouter();
  const { data: originalPlan = null, refetch } = getPlan(parseInt(planId));
  const { data: categories, isLoading: categoriesLoading } = getCategories();

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [days, setDays] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Local plan state — starts from the loaded plan, replaced after regeneration
  const [overridePlan, setOverridePlan] = useState<Plan | null>(null);
  const displayPlan = overridePlan ?? originalPlan;

  const today = new Date().toISOString().split('T')[0];

  const effectiveDays = days ?? originalPlan?.days ?? 3;
  const effectiveCategories =
    selectedCategories.length > 0 ? selectedCategories : (originalPlan?.categories ?? []);

  const isSettingsValid =
    effectiveDays >= 1 &&
    effectiveDays <= 30 &&
    effectiveCategories.length >= 3 &&
    (startDate === '' || startDate >= today);

  const handleOpenSettings = () => {
    // Prime form with current values when opening
    setDays(originalPlan?.days ?? 3);
    setSelectedCategories(originalPlan?.categories ?? []);
    setStartDate(
      originalPlan?.startDate ? String(originalPlan.startDate).substring(0, 10) : ''
    );
    setAttempted(false);
    setSettingsOpen(true);
  };

  const handleApplySettings = async () => {
    setAttempted(true);
    if (!isSettingsValid || !originalPlan) return;
    setIsRegenerating(true);
    try {
      const newPlan = await createInitialPlan(
        originalPlan.city.name,
        effectiveDays,
        effectiveCategories.map(String)
      );
      setOverridePlan({
        ...newPlan,
        id: originalPlan.id,
        city: originalPlan.city,
        startDate: (startDate || null) as unknown as Date | null,
      });
      setSettingsOpen(false);
    } finally {
      setIsRegenerating(false);
    }
  };

  const onSave = (plan: Plan) => {
    const schedules = plan.schedules.map((s: DailySchedule) =>
      s.activities.map((a) => a.id)
    );
    return editPlan({
      ...plan,
      id: originalPlan?.id,
      cityName: originalPlan?.city.name,
      schedules,
      startDate: plan.startDate,
    }).then(() => {
      refetch();
      router.push(`/plans/${planId}`);
    });
  };

  return (
    <>
      <DisplayPlan
        plan={displayPlan}
        onSave={onSave}
        saveButtonLabel="Save changes"
        onBack={() => router.push(`/plans/${planId}`)}
        backLabel="Cancel"
        onSettings={handleOpenSettings}
      />

      {/* Trip settings modal */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Trip settings
          </Typography>
          {originalPlan && (
            <Typography variant="body2" color="text.secondary">
              {originalPlan.city.title}
            </Typography>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <DurationPicker
            days={effectiveDays}
            onDaysChange={setDays}
            startDate={startDate}
            onStartDateChange={setStartDate}
            today={today}
            attempted={attempted}
            noPaper
          />
          <CategoryPicker
            categories={categories}
            isLoading={categoriesLoading}
            selectedCategories={effectiveCategories}
            onCategoriesChange={setSelectedCategories}
            attempted={attempted}
            noPaper
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" color="secondary" onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleApplySettings}
            loading={isRegenerating}
            sx={{ color: 'white' }}
          >
            Regenerate plan
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
