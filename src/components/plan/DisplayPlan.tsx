'use client';
import DailyPlanTimeline from '@/components/DailyPlanTimeline';
import RouteMap from '@/components/maps/RouteMap';
import TitleSkeleton from '@/components/skeletons/GenericTitle';
import { MAPBOX_MAX_ROUTE } from '@/configs/mapbox';
import { getActivities } from '@/fetchs/activity';
import { getCategories } from '@/fetchs/category';
import { getOptimizedRoute } from '@/fetchs/map';
import { Activity } from '@/types/fetchs/responses/activity';
import { DailySchedule, Plan } from '@/types/fetchs/responses/plan';
import { Add, Edit, List, MapOutlined, Search, Settings, ViewAgenda, ViewList, ViewModule, ViewStream } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  List as MuiList,
} from '@mui/material';
import { buildImageUrl } from '@/utils/image';
import Grid from '@mui/material/Unstable_Grid2';
import { addDays, format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

export default function DisplayPlan({
  plan,
  onSave,
  saveButtonLabel = 'Save trip',
  onBack,
  backLabel = 'Back',
  onEdit,
  readOnly = false,
  onSettings,
  startDate,
}: {
  plan: Plan | null;
  onSave?: (_: any) => Promise<any>;
  saveButtonLabel?: string;
  /** Called when the Back button is clicked (editable mode) */
  onBack?: () => void;
  backLabel?: string;
  /** Called when "Edit trip" is clicked (read-only mode) */
  onEdit?: () => void;
  readOnly?: boolean;
  /** Called when "Settings" button is clicked (editable mode, optional) */
  onSettings?: () => void;
  /** Explicit start date (YYYY-MM-DD) to use for tab labels when plan.start is not populated */
  startDate?: string;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: allCategories, isLoading: isLoadingCategories } = getCategories();
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showSuccessfullySaved, setShowSuccessfullySaved] = useState(false);
  const [compact, setCompact] = useState(false);

  // Managed schedules — local editable copy of plan.schedules
  const [managedSchedules, setManagedSchedules] = useState<DailySchedule[] | null>(null);
  // Track which days have been manually edited (skip route-optimization reorder for those)
  const editedDays = useRef<Set<number>>(new Set());

  // Add activity dialog
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [modalCompact, setModalCompact] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategoryFilter, setModalCategoryFilter] = useState<number[]>([]);

  // Sync managed schedules when plan loads
  useEffect(() => {
    if (plan) {
      setManagedSchedules(
        plan.schedules.map((s) => ({ ...s, activities: [...s.activities] }))
      );
      editedDays.current = new Set();
    }
  }, [plan]);

  const { data: optimizedRoutes, isPending } = getOptimizedRoute(
    managedSchedules?.[currentDay]?.activities
  );

  // Apply route optimization ordering (only for non-manually-edited days, and only in editable mode)
  useEffect(() => {
    if (readOnly) return;
    if (!isPending && managedSchedules && !editedDays.current.has(currentDay)) {
      const activities = [...managedSchedules[currentDay].activities];

      if (optimizedRoutes) {
        activities.forEach((a: any, i: number) => {
          const quotient = Math.floor(i / MAPBOX_MAX_ROUTE);
          const route = optimizedRoutes[quotient];
          if (!route?.waypoints) return;
          a.order =
            route.waypoints[(i % MAPBOX_MAX_ROUTE) + quotient]['waypoint_index'] +
            quotient * MAPBOX_MAX_ROUTE;
        });
        activities.sort((a, b) => a.order - b.order);
      }

      setManagedSchedules((prev) =>
        prev!.map((s, i) => (i === currentDay ? { ...s, activities } : s))
      );
    }
  }, [optimizedRoutes]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentDay(newValue);
  };

  const onSaveClicked = () => {
    if (!managedSchedules || !onSave) return;
    setIsSaving(true);
    onSave({ ...plan!, schedules: managedSchedules })
      .then(() => setShowSuccessfullySaved(true))
      .finally(() => setIsSaving(false));
  };

  // ── Activity management helpers ──

  const markDayEdited = () => {
    editedDays.current = new Set(editedDays.current).add(currentDay);
  };

  const handleReorder = (sourceIndex: number, destinationIndex: number) => {
    markDayEdited();
    setManagedSchedules((prev) => {
      if (!prev) return prev;
      const schedules = prev.map((s) => ({ ...s, activities: [...s.activities] }));
      const acts = schedules[currentDay].activities;
      const [moved] = acts.splice(sourceIndex, 1);
      acts.splice(destinationIndex, 0, moved);
      return schedules;
    });
  };

  const handleRemove = (index: number) => {
    markDayEdited();
    setManagedSchedules((prev) => {
      if (!prev) return prev;
      const schedules = prev.map((s) => ({ ...s, activities: [...s.activities] }));
      schedules[currentDay].activities.splice(index, 1);
      return schedules;
    });
  };

  const handleMoveToDay = (index: number, targetDayIndex: number) => {
    markDayEdited();
    editedDays.current = new Set(editedDays.current).add(targetDayIndex);
    setManagedSchedules((prev) => {
      if (!prev) return prev;
      const schedules = prev.map((s) => ({ ...s, activities: [...s.activities] }));
      const [activity] = schedules[currentDay].activities.splice(index, 1);
      schedules[targetDayIndex].activities.push(activity);
      return schedules;
    });
  };

  const handleAddActivity = (activity: Activity) => {
    markDayEdited();
    setManagedSchedules((prev) => {
      if (!prev) return prev;
      const schedules = prev.map((s) => ({ ...s, activities: [...s.activities] }));
      schedules[currentDay].activities.unshift(activity);
      return schedules;
    });
    setAddActivityOpen(false);
  };

  // ── Category summary ──
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

  const currentSchedule = managedSchedules?.[currentDay] ?? null;

  // Fetch all activities for this city, then filter out anything already scheduled across all days
  const { data: allCityActivities } = getActivities(plan?.city.id!);
  const scheduledActivityIds = new Set(
    (managedSchedules ?? []).flatMap((s) => s.activities.map((a) => a.id))
  );
  const availableToAdd = (allCityActivities ?? []).filter((a) => !scheduledActivityIds.has(a.id));

  // ── Shared sub-components ──

  const categorySubtitle = (
    <Box sx={{ mt: 0.5 }}>
      {isLoadingCategories ? (
        <Skeleton width={220} height={22} />
      ) : categorySummary ? (
        <Typography variant="body2" color="text.secondary">
          {categorySummary}
          {hiddenCategories.length > 0 && (
            <Tooltip title={hiddenCategories.map((c) => c.title).join(', ')} arrow>
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ ml: 0.5, cursor: 'default', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              >
                +{hiddenCategories.length} more
              </Typography>
            </Tooltip>
          )}
        </Typography>
      ) : null}
    </Box>
  );

  // Parse a date string ("YYYY-MM-DD" or ISO) as local midnight to avoid UTC off-by-one
  const parseLocalDate = (d: Date | string | null | undefined): Date | null => {
    if (!d) return null;
    const s = String(d).substring(0, 10); // take "YYYY-MM-DD" portion
    const [year, month, day] = s.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month - 1, day); // local midnight — no timezone shift
  };

  const dayTabs = (
    <Tabs
      value={currentDay}
      onChange={handleTabChange}
      scrollButtons="auto"
      allowScrollButtonsMobile
      variant="scrollable"
    >
      {plan
        ? Array.from({ length: plan.days }, (_, i) => {
            // Prefer plan.start → explicit startDate prop → per-schedule startAt
            const baseDate = plan.startDate
              ? addDays(parseLocalDate(plan.startDate)!, i)
              : startDate
              ? addDays(parseLocalDate(startDate)!, i)
              : parseLocalDate(plan.schedules[i]?.startAt ?? null);
            const label = baseDate ? (
              <Box sx={{ textAlign: 'center', lineHeight: 1.2 }}>
                <Typography variant="caption" display="block" color="inherit" sx={{ opacity: 0.7 }}>
                  Day {i + 1}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="inherit">
                  {format(baseDate, 'MMM d')}
                </Typography>
              </Box>
            ) : `Day ${i + 1}`;
            return <Tab key={i} label={label} />;
          })
        : Array.from({ length: 3 }, (_, i) => <Skeleton width={75} height={60} key={i} sx={{ mr: 1 }} />)}
    </Tabs>
  );

  // ── Render ──
  return (
    <Stack sx={{ width: '100%' }}>
      {/* ── Mobile header ── */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 1, mb: 1 }}>
        {plan ? (
          <Typography sx={{ typography: 'h4' }} color="secondary">
            {plan.days} days at <b>{plan.city.title}</b>
          </Typography>
        ) : (
          <TitleSkeleton />
        )}
        {categorySubtitle}
      </Box>

      {/* ── Desktop sticky header ── */}
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
            {categorySubtitle}
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, mt: 0.5, alignItems: 'center' }}>
            {plan ? (
              readOnly ? (
                /* Read-only: single Edit trip button */
                <Button variant="contained" size="large" startIcon={<Edit />} onClick={onEdit} sx={{ color: 'white' }}>
                  Edit trip
                </Button>
              ) : (
                /* Editable: compact toggle + Back + [Settings] + Save */
                <>
                  <Tooltip title={compact ? 'Expanded view' : 'Compact view'}>
                    <ToggleButtonGroup
                      value={compact ? 'compact' : 'expanded'}
                      exclusive
                      onChange={(_, v) => { if (v !== null) setCompact(v === 'compact'); }}
                      sx={{ height: 42 }}
                    >
                      <ToggleButton value="expanded" aria-label="expanded">
                        <ViewAgenda fontSize="small" />
                      </ToggleButton>
                      <ToggleButton value="compact" aria-label="compact">
                        <ViewList fontSize="small" />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Tooltip>
                  {onBack && (
                    <Button variant="outlined" color="secondary" size="large" onClick={onBack}>
                      {backLabel}
                    </Button>
                  )}
                  {onSettings && (
                    <Button variant="outlined" size="large" onClick={onSettings}>
                      Settings
                    </Button>
                  )}
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
              )
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rounded" width={80} height={42} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={110} height={42} sx={{ borderRadius: 1 }} />
              </Box>
            )}
          </Box>
        </Box>

        {dayTabs}
      </Paper>

      {/* ── Mobile tabs ── */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {dayTabs}
      </Box>

      {/* ── Content grid ── */}
      <Grid container rowSpacing={3} columnSpacing={3} sx={{ mt: 0 }}>
        <Grid display={!isMobile || viewMode === 'list' ? 'flex' : 'none'} md={6} xs={12}>
          <Box sx={{ maxWidth: '100%', bgcolor: 'background.paper', px: { xs: 0, md: 3 }, width: '100%' }}>
            {currentSchedule && plan ? (
              <>
                {/* Desktop-only: Add activity button (editable mode only) */}
                {!readOnly && (
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', pt: 2, pb: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setAddActivityOpen(true)}
                      disabled={availableToAdd.length === 0}
                    >
                      {availableToAdd.length === 0 ? 'No more activities available' : 'Add activity'}
                    </Button>
                  </Box>
                )}
                <DailyPlanTimeline
                  city={plan.city}
                  schedule={currentSchedule}
                  onHoverActivity={setSelectedActivity}
                  currentDayIndex={currentDay}
                  totalDays={plan.days}
                  compact={compact}
                  {...(!readOnly && {
                    onReorder: handleReorder,
                    onRemove: handleRemove,
                    onMoveToDay: handleMoveToDay,
                  })}
                />
              </>
            ) : (
              <Stack spacing={3} mt={4} width="100%">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton variant="rounded" height={200} sx={{ width: '100%' }} key={i} />
                ))}
              </Stack>
            )}
          </Box>
        </Grid>

        {(!isMobile || viewMode === 'map') && (
          <Grid md={6} xs={12}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: '228px' } }}>
              <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Box sx={{ borderRadius: { xs: 0, md: 5 }, mx: { xs: -2, md: 0 }, overflow: 'hidden' }}>
                  {currentSchedule && plan ? (
                    <RouteMap
                      routes={optimizedRoutes}
                      activities={currentSchedule.activities}
                      city={plan.city}
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
        {readOnly ? (
          <Button variant="contained" size="large" startIcon={<Edit />} onClick={onEdit} sx={{ color: 'white' }}>
            Edit trip
          </Button>
        ) : (
          <>
            {onBack && (
              <Button variant="outlined" color="secondary" size="large" onClick={onBack}>
                {backLabel}
              </Button>
            )}
            {onSettings && (
              <Button variant="outlined" size="large" onClick={onSettings}>
                Settings
              </Button>
            )}
            <LoadingButton
              variant="contained"
              size="large"
              sx={{ color: 'white' }}
              onClick={onSaveClicked}
              loading={isSaving}
            >
              Save
            </LoadingButton>
          </>
        )}
      </Paper>

      {/* ── Add activity dialog ── */}
      {!readOnly && (() => {
        const filteredActivities = availableToAdd.filter((a) => {
          const matchesSearch = !modalSearch || a.title.toLowerCase().includes(modalSearch.toLowerCase());
          const matchesCategory = modalCategoryFilter.length === 0 ||
            a.categories?.some((c: any) => modalCategoryFilter.includes(c.id));
          return matchesSearch && matchesCategory;
        });

        // Collect all unique categories from available activities
        const modalCategories = allCategories?.filter((cat) =>
          availableToAdd.some((a) => a.categories?.some((c: any) => c.id === cat.id))
        ) ?? [];

        return (
          <Dialog
            open={addActivityOpen}
            onClose={() => { setAddActivityOpen(false); setModalSearch(''); setModalCategoryFilter([]); }}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
              <span>Add activity — Day {currentDay + 1}</span>
              <ToggleButtonGroup
                value={modalCompact ? 'compact' : 'expanded'}
                exclusive
                size="small"
                onChange={(_, v) => { if (v) setModalCompact(v === 'compact'); }}
              >
                <ToggleButton value="compact"><Tooltip title="Compact"><ViewStream fontSize="small" /></Tooltip></ToggleButton>
                <ToggleButton value="expanded"><Tooltip title="Expanded"><ViewModule fontSize="small" /></Tooltip></ToggleButton>
              </ToggleButtonGroup>
            </DialogTitle>

            {/* ── Search + category filters ── */}
            <Box sx={{ px: 3, pt: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search activities…"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />
              {modalCategories.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {modalCategories.map((cat) => {
                    const active = modalCategoryFilter.includes(cat.id);
                    return (
                      <Chip
                        key={cat.id}
                        label={cat.title}
                        size="small"
                        color={active ? 'primary' : 'default'}
                        variant={active ? 'filled' : 'outlined'}
                        onClick={() =>
                          setModalCategoryFilter((prev) =>
                            active ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                          )
                        }
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>

            <DialogContent sx={{ p: modalCompact ? 0 : 2 }}>
              {filteredActivities.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  {availableToAdd.length === 0 ? 'No more activities available for this city.' : 'No activities match your search.'}
                </Typography>
              ) : modalCompact ? (
                /* ── Compact view ── */
                <MuiList disablePadding>
                  {filteredActivities.map((activity, i) => (
                    <Box key={activity.id}>
                      <ListItem
                        secondaryAction={
                          <Button size="small" variant="outlined" onClick={() => handleAddActivity(activity)}>
                            Add
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.3 }}>
                              <Typography variant="caption" color="text.secondary">{activity.duration} min</Typography>
                              {activity.categories?.slice(0, 2).map((c: any) => (
                                <Chip key={c.id} label={c.title} size="small" sx={{ height: 16, fontSize: 10 }} />
                              ))}
                            </Box>
                          }
                        />
                      </ListItem>
                      {i < filteredActivities.length - 1 && <Divider />}
                    </Box>
                  ))}
                </MuiList>
              ) : (
                /* ── Expanded view ── */
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {filteredActivities.map((activity) => {
                    const imgUrl = activity.pictures?.[0]?.url ? buildImageUrl(activity.pictures[0].url) : null;
                    return (
                      <Card key={activity.id} variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
                        {imgUrl && (
                          <CardMedia
                            component="img"
                            image={imgUrl}
                            alt={activity.title}
                            sx={{ height: 140, objectFit: 'cover' }}
                          />
                        )}
                        <CardContent sx={{ flex: 1, pb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            {activity.title}
                          </Typography>
                          {activity.categories?.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                              {activity.categories.slice(0, 3).map((c: any) => (
                                <Chip key={c.id} label={c.title} size="small" color="primary" variant="outlined" />
                              ))}
                            </Box>
                          )}
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            {activity.duration} min
                          </Typography>
                          {activity.description && (
                            <Typography variant="body2" color="text.secondary" sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {activity.description}
                            </Typography>
                          )}
                        </CardContent>
                        <Box sx={{ px: 2, pb: 2 }}>
                          <Button fullWidth variant="outlined" size="small" onClick={() => handleAddActivity(activity)}>
                            Add to Day {currentDay + 1}
                          </Button>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setAddActivityOpen(false); setModalSearch(''); setModalCategoryFilter([]); }}>Close</Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={showSuccessfullySaved}
        autoHideDuration={4000}
        onClose={() => setShowSuccessfullySaved(false)}
      >
        <Alert onClose={() => setShowSuccessfullySaved(false)} variant="filled" sx={{ width: '100%' }}>
          Changes saved successfully.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
