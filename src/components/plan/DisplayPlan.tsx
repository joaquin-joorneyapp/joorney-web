'use client';
import DailyPlanTimeline from '@/components/DailyPlanTimeline';
import RouteMap from '@/components/maps/RouteMap';
import BigButtonSkeleton from '@/components/skeletons/BigButton';
import ChipSkeleton from '@/components/skeletons/Chip';
import TitleSkeleton from '@/components/skeletons/GenericTitle';
import { getCategories } from '@/fetchs/category';
import { getOptimizedRoute } from '@/fetchs/map';
import { DailySchedule, Plan } from '@/types/fetchs/responses/plan';
import { EditOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Chip,
  Container,
  Dialog,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from 'react';
import EditPlanForm from './EditPlanForm';

export default ({
  plan,
  handleChangedPlan,
}: {
  handleChangedPlan: any;
  plan: Plan | null;
}) => {
  const { data: allCategories, isLoading: isLoadingCategories } =
    getCategories();
  const [currentDay, setCurrentDay] = useState(0);
  const [editPlan, setEditPlan] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);

  const { data: optimizedRoute, isPending } = getOptimizedRoute(
    plan?.schedules[currentDay].activities
  );

  const [orderedSchedule, setOrderedSchedule] = useState<DailySchedule | null>(
    null
  );

  useEffect(() => {
    if (!isPending) {
      const activities = [...plan?.schedules[currentDay].activities!];

      activities.forEach(
        (a: any, i: number) =>
          (a.order = optimizedRoute.waypoints[i]['waypoint_index'])
      );

      activities.sort((a, b) => a.order - b.order);

      const schedule = { ...plan?.schedules[currentDay], activities };

      setOrderedSchedule(schedule);
    }
  }, [optimizedRoute]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentDay(newValue);
  };

  const categories =
    !isLoadingCategories && plan
      ? plan.categories.length === 0
        ? allCategories
        : allCategories!.filter((c) => plan.categories.includes(c.id))
      : [];

  return (
    <Box sx={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {plan ? (
          <Box
            marginTop={2}
            marginBottom={3}
            display="flex"
            alignItems="center"
          >
            <Typography variant="h3" color="secondary" display={'inline'}>
              {plan?.days} days at <b>{plan?.city.title}</b>
            </Typography>{' '}
            <Tooltip title="Edit days and city" sx={{ ml: 1, mt: 0.5 }}>
              <IconButton
                aria-label="Edit"
                size="large"
                onClick={() => setEditPlan(true)}
              >
                <EditOutlined fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <TitleSkeleton />
        )}
        {plan ? (
          <LoadingButton
            variant="contained"
            size="large"
            sx={{ color: 'white' }}
          >
            Save trip
          </LoadingButton>
        ) : (
          <BigButtonSkeleton />
        )}
      </div>
      <Grid container rowSpacing={3} columnSpacing={3}>
        <Grid md={6} xs={12}>
          <Container sx={{ mb: 2 }}>
            <Box display="block" alignItems="center">
              {isLoadingCategories ? (
                <>
                  {Array.from({ length: 3 }, (_, i) => (
                    <ChipSkeleton key={i} />
                  ))}
                </>
              ) : (
                <>
                  {categories?.map((c, i) => (
                    <Chip key={i} label={c.title} sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                  <Tooltip title="Edit tags">
                    <IconButton
                      aria-label="Edit"
                      size="medium"
                      onClick={() => setEditPlan(true)}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Container>
          <Container
            sx={{
              maxWidth: '100%',
              bgcolor: 'background.paper',
              px: { xs: 0.5, md: 3 },
            }}
          >
            <Tabs
              value={currentDay}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              {Array.from({ length: plan?.days || 0 }, (_, i) => (
                <Tab key={i} label={'Day ' + (i + 1)} />
              ))}
            </Tabs>
            <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
              {orderedSchedule && plan && (
                <DailyPlanTimeline
                  city={plan.city}
                  schedule={orderedSchedule}
                  onHoverActivity={setSelectedActivity}
                />
              )}
            </Container>
          </Container>
        </Grid>
        <Grid md={6} xs={12}>
          <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Box style={{ borderRadius: 25, overflow: 'hidden' }}>
              {orderedSchedule && plan && (
                <RouteMap
                  route={optimizedRoute}
                  activities={orderedSchedule.activities}
                  city={plan?.city}
                  focusActivity={selectedActivity}
                />
              )}
            </Box>
          </Container>
        </Grid>
      </Grid>
      <Dialog
        scroll={'body'}
        fullWidth={true}
        maxWidth={'lg'}
        open={editPlan}
        onClose={() => setEditPlan(false)}
      >
        <Box sx={{ pt: 3, pl: 4, pr: 2.5, pb: 2 }}>
          <Typography variant="h4" color="secondary" sx={{ mb: 2 }}>
            Edit Plan
          </Typography>
          {editPlan && (
            <EditPlanForm
              categories={allCategories!}
              selectedCategories={categories?.map((c) => c.id) || []}
              days={plan?.days || 3}
              handleCancel={() => {
                setEditPlan(false);
              }}
              handleSubmit={({ days, selectedCategories }) => {
                handleChangedPlan({ days, selectedCategories });
                setEditPlan(false);
              }}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};
