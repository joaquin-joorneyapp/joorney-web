'use client';
import DailyPlanTimeline from '@/components/DailyPlanTimeline';
import RouteMap from '@/components/maps/RouteMap';
import BigButtonSkeleton from '@/components/skeletons/BigButton';
import ChipSkeleton from '@/components/skeletons/Chip';
import TitleSkeleton from '@/components/skeletons/GenericTitle';
import { MAPBOX_MAX_ROUTE } from '@/configs/mapbox';
import { getCategories } from '@/fetchs/category';
import { getOptimizedRoute } from '@/fetchs/map';
import { DailySchedule, Plan } from '@/types/fetchs/responses/plan';
import { EditOutlined, List, MapOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  BottomNavigation,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
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
import { useEffect, useState } from 'react';
import EditPlanForm from './EditPlanForm';

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
  const { data: allCategories, isLoading: isLoadingCategories } =
    getCategories();
  const [currentDay, setCurrentDay] = useState(0);
  const [editPlan, setEditPlan] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showSuccessfullySaved, setShowSuccessfullySaved] = useState(false);
  const [planParams, setPlanParams] = useState({});

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

  return (
    <Stack sx={{ width: '100%' }}>
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        sx={{ mt: { xs: 1 } }}
      >
        {plan ? (
          <Box
            marginTop={0}
            marginBottom={2}
            display="flex"
            alignItems="center"
          >
            <Typography
              sx={{ typography: { xs: 'h4', md: 'h3' } }}
              color="secondary"
              display={'inline'}
            >
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
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {plan ? (
            <Tooltip title={!!plan.id ? 'No pending changes' : saveButtonLabel}>
              <LoadingButton
                variant="contained"
                size="large"
                sx={{ color: 'white' }}
                onClick={onSaveClicked}
                loading={isSaving}
              >
                {saveButtonLabel}
              </LoadingButton>
            </Tooltip>
          ) : (
            <BigButtonSkeleton />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          px: { md: 2 },
          mt: { md: 1 },
        }}
      >
        <Box alignItems="center">
          {isLoadingCategories ? (
            <Box display="flex" alignItems="center">
              {Array.from({ length: 3 }, (_, i) => (
                <ChipSkeleton key={i} />
              ))}
            </Box>
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
        <Box>
          <Tabs
            sx={{ mt: 2 }}
            value={currentDay}
            onChange={handleChange}
            scrollButtons="auto"
            allowScrollButtonsMobile
            variant={isMobile ? 'fullWidth' : 'scrollable'}
            centered={isMobile}
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
      </Box>
      <Grid container rowSpacing={3} columnSpacing={3}>
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
                    sx={{ width: { xs: 350, md: 700 } }}
                    key={i}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Grid>
        {(!isMobile || viewMode === 'map') && (
          <Grid md={6} xs={12}>
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
                  <Skeleton variant="rectangular" height={1000} width={1000} />
                )}
              </Box>
            </Container>
          </Grid>
        )}
      </Grid>
      <Box sx={{ display: { xs: 'flex', md: 'none' } }} height={40} />
      <Dialog
        scroll={isMobile ? 'paper' : 'body'}
        fullScreen={isMobile}
        fullWidth={true}
        maxWidth={'lg'}
        open={editPlan}
        onClose={() => setEditPlan(false)}
      >
        <DialogContent
          sx={{ pt: 3, pl: { xs: 2, md: 4 }, pr: 2.5, pb: 2 }}
          dividers={isMobile}
        >
          <Typography variant="h4" color="secondary" sx={{ mb: 2 }}>
            Edit Plan
          </Typography>
          {editPlan && (
            <EditPlanForm
              categories={allCategories!}
              selectedCategories={categories?.map((c) => c.id) || []}
              days={plan?.days || 3}
              onDataChange={setPlanParams}
              handleCancel={() => {
                setEditPlan(false);
              }}
              handleSubmit={({ days, selectedCategories }) => {
                handleChangedPlan({ days, selectedCategories });
                setEditPlan(false);
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ display: { xs: 'flex', md: 'none' } }}>
          <Button
            onClick={() => {
              setEditPlan(false);
            }}
            color="secondary"
            sx={{ mr: 1, mt: 0.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleChangedPlan(planParams);
              setEditPlan(false);
            }}
            sx={{ color: 'white', mr: 1 }}
          >
            Generate plan
          </Button>
        </DialogActions>
      </Dialog>
      <Paper
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        elevation={3}
      >
        <BottomNavigation>
          <Box
            mb={viewMode === 'list' ? -2 : 2}
            my={1}
            mx={1.5}
            justifyContent={'center'}
          >
            <ToggleButtonGroup
              color="standard"
              exclusive
              onChange={(_, mode) => setViewMode(mode)}
              value={viewMode}
              fullWidth
              sx={{ height: 40 }}
            >
              <ToggleButton value="list">
                <List />
              </ToggleButton>
              <ToggleButton value="map">
                <MapOutlined />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <LoadingButton
            variant="contained"
            size="large"
            sx={{
              my: 1,
              flexGrow: 1,
              color: 'white',
              mx: 1.5,
            }}
            onClick={onSaveClicked}
            loading={isSaving}
          >
            {saveButtonLabel}
          </LoadingButton>
        </BottomNavigation>
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
      </Paper>
    </Stack>
  );
};
