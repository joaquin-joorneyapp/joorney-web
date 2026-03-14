'use client';

import CategoryPicker from '@/components/plan-form/CategoryPicker';
import DurationPicker from '@/components/plan-form/DurationPicker';
import { getCategories } from '@/fetchs/category';
import { ArrowForward } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function EditPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories, isLoading: categoriesLoading } = getCategories();

  const planId = searchParams.get('planId');
  const cityTitle = searchParams.get('cityTitle') ?? searchParams.get('city') ?? '';

  const [days, setDays] = useState(parseInt(searchParams.get('days') || '3', 10));
  const [startDate, setStartDate] = useState(searchParams.get('date') ?? '');
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    searchParams.getAll('categories').map(Number).filter(Boolean)
  );
  const [attempted, setAttempted] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const isValid =
    selectedCategories.length >= 3 &&
    days >= 1 &&
    days <= 30 &&
    (startDate === '' || startDate >= today);

  const handleSubmit = () => {
    setAttempted(true);
    if (!isValid) return;
    const params = new URLSearchParams();
    params.set('days', String(days));
    for (const id of selectedCategories) params.append('categories', String(id));
    if (startDate) params.set('date', startDate);
    router.push(`/plans/${planId}?${params.toString()}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', pb: 14 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
        <Typography
          sx={{ typography: { xs: 'h4', md: 'h3' } }}
          color="secondary"
          mb={4}
        >
          Edit your trip to <b>{cityTitle}</b>
        </Typography>

        <DurationPicker
          days={days}
          onDaysChange={setDays}
          startDate={startDate}
          onStartDateChange={setStartDate}
          today={today}
          attempted={attempted}
        />

        <CategoryPicker
          categories={categories}
          isLoading={categoriesLoading}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          attempted={attempted}
        />
      </Container>

      {/* Sticky bottom bar */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          px: { xs: 2, md: 6 },
          py: { xs: 1.5, md: 2 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          endIcon={<ArrowForward />}
          sx={{ color: 'white' }}
        >
          Regenerate plan
        </Button>
      </Paper>
    </Box>
  );
}
