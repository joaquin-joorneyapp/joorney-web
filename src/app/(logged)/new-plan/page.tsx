'use client';

import CityPicker from '@/components/plan-form/CityPicker';
import DurationPicker from '@/components/plan-form/DurationPicker';
import CategoryPicker from '@/components/plan-form/CategoryPicker';
import { getCategories } from '@/fetchs/category';
import { getCities } from '@/fetchs/city';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const STEPS = ['Destination', 'Duration', 'Interests'];

export default function NewPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: cities, isLoading: citiesLoading } = getCities();
  const { data: categories, isLoading: categoriesLoading } = getCategories();

  const [step, setStep] = useState(parseInt(searchParams.get('step') || '0', 10));
  const [selectedCity, setSelectedCity] = useState<string | null>(
    searchParams.get('city')
  );
  const [days, setDays] = useState(parseInt(searchParams.get('days') || '3', 10));
  const [startDate, setStartDate] = useState(searchParams.get('date') ?? '');
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    searchParams.getAll('categories').map(Number).filter(Boolean)
  );
  const [attempted, setAttempted] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const today = new Date().toISOString().split('T')[0];

  const validateStep = (s: number): boolean => {
    if (s === 0) return selectedCity !== null;
    if (s === 1)
      return (
        days >= 1 && days <= 30 && (startDate === '' || startDate >= today)
      );
    if (s === 2) return selectedCategories.length >= 3;
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    setDirection('forward');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setAttempted(false);
    setDirection('back');
    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(2)) {
      setAttempted(true);
      return;
    }
    const params = new URLSearchParams();
    params.set('days', String(days));
    for (const id of selectedCategories) params.append('categories', String(id));
    if (startDate) params.set('date', startDate);
    router.push(`/cities/${selectedCity}/new-plan?${params.toString()}`);
  };

  const selectedCityTitle = cities?.find((c) => c.name === selectedCity)?.title;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', pb: 14 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
        {/* Step indicator */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            {STEPS.map((label, i) => (
              <Typography
                key={i}
                variant="caption"
                fontWeight={i === step ? 700 : 400}
                color={i === step ? 'primary' : i < step ? 'text.secondary' : 'text.disabled'}
              >
                {i + 1}. {label}
              </Typography>
            ))}
          </Box>
          <LinearProgress
            variant="determinate"
            value={((step + 1) / STEPS.length) * 100}
            sx={{ borderRadius: 2, height: 4 }}
          />
        </Box>

        <Box
          key={step}
          sx={{
            animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.35s ease`,
            '@keyframes slideInRight': {
              from: { opacity: 0, transform: 'translateX(32px)' },
              to:   { opacity: 1, transform: 'translateX(0)' },
            },
            '@keyframes slideInLeft': {
              from: { opacity: 0, transform: 'translateX(-32px)' },
              to:   { opacity: 1, transform: 'translateX(0)' },
            },
          }}
        >
          {step === 0 && (
            <CityPicker
              cities={cities}
              isLoading={citiesLoading}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              attempted={attempted}
            />
          )}
          {step === 1 && (
            <DurationPicker
              days={days}
              onDaysChange={setDays}
              startDate={startDate}
              onStartDateChange={setStartDate}
              today={today}
              attempted={attempted}
            />
          )}
          {step === 2 && (
            <CategoryPicker
              categories={categories}
              isLoading={categoriesLoading}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              attempted={attempted}
            />
          )}
        </Box>
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
          gap: 2,
        }}
      >
        {/* Summary */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flex: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {selectedCityTitle && (
            <Chip
              label={selectedCityTitle}
              onDelete={step === 0 ? undefined : () => { setSelectedCity(null); setStep(0); }}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
          {step > 1 && (
            <Chip
              label={`${days} day${days !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
            />
          )}
          {step > 1 && selectedCategories.length > 0 && (
            <Chip
              label={`${selectedCategories.length} interest${selectedCategories.length !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              color={selectedCategories.length >= 3 ? 'success' : 'default'}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            />
          )}
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          {step > 0 && (
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              sx={{ color: 'white' }}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
              endIcon={<ArrowForward />}
              sx={{ color: 'white' }}
            >
              Plan My Trip
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
