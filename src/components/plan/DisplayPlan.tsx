'use client';
import DailyPlanTimeline from '@/components/DailyPlanTimeline';
import RouteMap from '@/components/maps/RouteMap';
import TitleSkeleton from '@/components/skeletons/GenericTitle';
import { MAPBOX_MAX_ROUTE } from '@/configs/mapbox';
import { getCategories } from '@/fetchs/category';
import { getOptimizedRoute } from '@/fetchs/map';
import { DailySchedule, Plan } from '@/types/fetchs/responses/plan';
import { List, MapOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default ({
  plan,
  handleChangedPlan,
  onSave,
  saveButtonLabel = 'Save trip',
}: {
  handleChangedPlan: any;
  plan: Plan | null;
  onSave: (_: any) => Promise<any>;
  saveButtonLabel?: string;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { data: allCategories, isLoading: isLoadingCategories } =
    getCategories();
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showSuccessfullySaved, setShowSuccessfullySaved] = useState(false);

  const { data: optimizedRoutes, isPending } = getOptimizedRoute(
    plan?.schedules[currentDay]?.activities
  );

  const [orderedSchedule, setOrderedSchedule] = useState<DailySchedule | null>(
    null
  );

  useEffect(() => {
    if (!isPending) {
      const activities = [...plan?.schedules[currentDay].activities!];

      if (optimizedRoutes) {
        activities.forEach((a: any, i: number) => {
          const quotient = Math.floor(i / MAPBOX_MAX_ROUTE);
          const route = optimizedRoutes[quotient];
          if (!route?.waypoints) return;
          a.order =
            route.waypoints[
              (i % MAPBOX_MAX_ROUTE) + quotient
            ]['waypoint_index'] +
            quotient * MAPBOX_MAX_ROUTE;
        });

        activities.sort((a, b) => a.order - b.order);
      }

      const schedule = { ...plan?.schedules[currentDay]!, activities };
      setOrderedSchedule(schedule);
    }
  }, [optimizedRoutes]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentDay(newValue);
  };

  const handleEdit = () => {
    if (!plan) return;
    const params = new URLSearchParams();
    params.set('city', plan.city.name);
    params.set('cityTitle', plan.city.title);
    params.set('days', String(plan.days));
    for (const id of plan.categories) {
      params.append('categories', String(id));
    }
    if (plan.id) {
      params.set('planId', String(plan.id));
      router.push(`/edit-plan?${params.toString()}`);
    } else {
      router.push(`/new-plan?${params.toString()}`);
    }
  };

  const onSaveClicked = () => {
    setIsSaving(true);
    onSave(plan)
      .then(() => setShowSuccessfullySaved(true))
      .finally(() => setIsSaving(false));
  };

  const categories =
    !isLoadingCategories && plan
      ? plan.categories.length === 0
        ? allCategories
        : allCategories!.filter((c) => plan.categories.includes(c.id))
      : [];

  const visibleCategories = categories ? categories.slice(0, 3) : [];
  const hiddenCategories = categories ? categories.slice(3) : [];
  const categorySummary =
    categories && categories.length > 0
      ? visibleCategories.map((c) => c.title).join(' · ')
      : null;

  return (
    <Stack sx={{ width: '100%' }}>
      {/* ── Mobile header (not sticky) ── */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 1, mb: 1 }}>
        {plan ? (
          <Typography sx={{ typography: 'h4' }} color="secondary">
            {plan.days} days at <b>{plan.city.title}</b>
          </Typography>
        ) : (
          <TitleSkeleton />
        )}
        <Box sx={{ mt: 0.5 }}>
          {isLoadingCategories ? (
            <Skeleton width={220} height={22} />
          ) : categorySummary ? (
            <Typography variant="body2" color="text.secondary">
              {categorySummary}
              {hiddenCategories.length > 0 && (
                <Tooltip
                  title={hiddenCategories.map((c) => c.title).join(', ')}
                  arrow
                >
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      ml: 0.5,
                      cursor: 'default',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                    }}
                  >
                    +{hiddenCategories.length} more
                  </Typography>
                </Tooltip>
              )}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* ── Desktop sticky header (title + buttons + tabs) ── */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'sticky',
          top: '80px',
          zIndex: 10,
          bgcolor: 'background.paper',
          px: 2,
          pt: 2,
        }}
      >
        {/* Title row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5, gap: 2 }}>
          <Box>
            {plan ? (
              <Typography sx={{ typography: 'h3' }} color="secondary">
                {plan.days} days at <b>{plan.city.title}</b>
              </Typography>
            ) : (
              <TitleSkeleton />
            )}
            <Box sx={{ mt: 0.5 }}>
              {isLoadingCategories ? (
                <Skeleton width={220} height={22} />
              ) : categorySummary ? (
                <Typography variant="body2" color="text.secondary">
                  {categorySummary}
                  {hiddenCategories.length > 0 && (
                    <Tooltip
                      title={hiddenCategories.map((c) => c.title).join(', ')}
                      arrow
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          ml: 0.5,
                          cursor: 'default',
                          textDecoration: 'underline',
                          textDecorationStyle: 'dotted',
                        }}
                      >
                        +{hiddenCategories.length} more
                      </Typography>
                    </Tooltip>
                  )}
                </Typography>
              ) : null}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, mt: 0.5 }}>
            {plan ? (
              <>
                <Button variant="outlined" color="secondary" size="large" onClick={handleEdit}>
                  Edit
                </Button>
                <LoadingButton
                  variant="contained"
                  size="large"
                  sx={{ color: 'white' }}
                  onClick={onSaveClicked}
                  loading={isSaving}
                >
                  {saveButtonLabel}
                </LoadingButton>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rounded" width={80} height={42} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={110} height={42} sx={{ borderRadius: 1 }} />
              </Box>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={currentDay}
          onChange={handleChange}
          scrollButtons="auto"
          allowScrollButtonsMobile
          variant="scrollable"
        >
          {plan
            ? Array.from({ length: plan?.days || 0 }, (_, i) => (
                <Tab key={i} label={'Day ' + (i + 1)} />
              ))
            : Array.from({ length: 3 }, (_, i) => (
                <Skeleton width={75} height={60} key={i} sx={{ mr: 1 }} />
              ))}
        </Tabs>
      </Paper>

      {/* ── Mobile tabs (not sticky) ── */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Tabs
          value={currentDay}
          onChange={handleChange}
          scrollButtons="auto"
          allowScrollButtonsMobile
          variant="scrollable"
        >
          {plan
            ? Array.from({ length: plan?.days || 0 }, (_, i) => (
                <Tab key={i} label={'Day ' + (i + 1)} />
              ))
            : Array.from({ length: 3 }, (_, i) => (
                <Skeleton width={75} height={60} key={i} sx={{ mr: 1 }} />
              ))}
        </Tabs>
      </Box>

      {/* ── Content grid ── */}
      <Grid container rowSpacing={3} columnSpacing={3} sx={{ mt: 0 }}>
        <Grid
          display={!isMobile || viewMode === 'list' ? 'flex' : 'none'}
          md={6}
          xs={12}
        >
          <Box
            sx={{
              maxWidth: '100%',
              bgcolor: 'background.paper',
              px: { xs: 0, md: 3 },
              width: '100%',
            }}
          >
            {orderedSchedule && plan ? (
              <DailyPlanTimeline
                city={plan.city}
                schedule={orderedSchedule}
                onHoverActivity={setSelectedActivity}
              />
            ) : (
              <Stack spacing={3} mt={4} width={'100%'}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton
                    variant="rounded"
                    height={200}
                    sx={{ width: '100%' }}
                    key={i}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Grid>

        {(!isMobile || viewMode === 'map') && (
          <Grid md={6} xs={12}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: '228px' },
              }}
            >
              <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Box
                  sx={{
                    borderRadius: { xs: 0, md: 5 },
                    mx: { xs: -2, md: 0 },
                    overflow: 'hidden',
                  }}
                >
                  {orderedSchedule && plan ? (
                    <RouteMap
                      routes={optimizedRoutes}
                      activities={orderedSchedule.activities}
                      city={plan?.city}
                      focusActivity={selectedActivity}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      sx={{ height: { xs: 400, md: 'calc(100vh - 200px)' } }}
                    />
                  )}
                </Box>
              </Container>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* ── Mobile bottom bar ── */}
      <Box sx={{ display: { xs: 'flex', md: 'none' } }} height={72} />
      <Paper
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          px: 1.5,
          py: 1,
          alignItems: 'center',
          gap: 1,
        }}
        elevation={3}
      >
        <ToggleButtonGroup
          color="standard"
          exclusive
          onChange={(_, mode) => mode && setViewMode(mode)}
          value={viewMode}
          sx={{ height: 40, flexShrink: 0 }}
        >
          <ToggleButton value="list">
            <List />
          </ToggleButton>
          <ToggleButton value="map">
            <MapOutlined />
          </ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          onClick={handleEdit}
        >
          Edit
        </Button>
        <LoadingButton
          variant="contained"
          size="large"
          sx={{ color: 'white' }}
          onClick={onSaveClicked}
          loading={isSaving}
        >
          {saveButtonLabel}
        </LoadingButton>
      </Paper>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={showSuccessfullySaved}
        autoHideDuration={4000}
        onClose={() => setShowSuccessfullySaved(false)}
      >
        <Alert
          onClose={() => setShowSuccessfullySaved(false)}
          variant="filled"
          sx={{ width: '100%' }}
        >
          Changes saved successfully.
        </Alert>
      </Snackbar>
    </Stack>
  );
};
