'use client';

import ActivityCard from '@/components/explore/ActivityCard';
import { getClosestActivities } from '@/fetchs/activity';
import { getCategories } from '@/fetchs/category';
import { useGeolocation } from '@/hooks/useGeolocation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Geolocation with Paris fallback
  const { lat, lng, loading: geoLoading } = useGeolocation();
  const effectiveLat = lat ?? (geoLoading ? null : 48.8566);
  const effectiveLng = lng ?? (geoLoading ? null : 2.3522);

  // Data fetching — called unconditionally at top level (React Query hooks)
  const { data: categories, isLoading: categoriesLoading } = getCategories();
  const {
    data: activities,
    isLoading: activitiesLoading,
    isError: activitiesError,
    refetch: refetchActivities,
  } = getClosestActivities(effectiveLat, effectiveLng, 50);

  // Client-side filtering (category AND search compose)
  const filteredActivities = (activities ?? []).filter((activity) => {
    const matchesCategory =
      selectedCategoryId === null ||
      activity.categories.some((c) => c.id === selectedCategoryId);
    const matchesSearch =
      searchQuery === '' ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
      {/* Search bar */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5E5EA' }}>
        <TextField
          fullWidth
          placeholder="Search activities by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {/* Category pills */}
      <Box
        sx={{
          px: 3,
          py: 1,
          borderBottom: '1px solid #E5E5EA',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          flexShrink: 0,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 2 },
        }}
      >
        {categoriesLoading ? (
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={80} height={32} sx={{ borderRadius: 4, flexShrink: 0 }} />
          ))
        ) : (
          <>
            <Button
              size="small"
              onClick={() => setSelectedCategoryId(null)}
              sx={{
                borderRadius: 4, px: 2, flexShrink: 0,
                bgcolor: selectedCategoryId === null ? '#F67D56' : '#F2F2F7',
                color: selectedCategoryId === null ? '#fff' : 'text.primary',
                '&:hover': { bgcolor: selectedCategoryId === null ? '#e56b45' : '#e0e0e7' },
                textTransform: 'none', fontWeight: 500,
              }}
            >
              All
            </Button>
            {(categories ?? []).map((cat) => (
              <Button
                key={cat.id}
                size="small"
                onClick={() => setSelectedCategoryId(cat.id)}
                sx={{
                  borderRadius: 4, px: 2, flexShrink: 0,
                  bgcolor: selectedCategoryId === cat.id ? '#F67D56' : '#F2F2F7',
                  color: selectedCategoryId === cat.id ? '#fff' : 'text.primary',
                  '&:hover': { bgcolor: selectedCategoryId === cat.id ? '#e56b45' : '#e0e0e7' },
                  textTransform: 'none', fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                {cat.title}
              </Button>
            ))}
          </>
        )}
      </Box>

      {/* Two-panel split */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: activity grid */}
        <Box sx={{ width: '55%', overflowY: 'auto', p: 3, borderRight: '1px solid #E5E5EA' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Nearby Activities</Typography>
            {!activitiesLoading && (
              <Typography variant="body2" color="text.secondary">
                {filteredActivities.length} result{filteredActivities.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          {activitiesError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetchActivities()}>
                  Retry
                </Button>
              }
              sx={{ mb: 2 }}
            >
              Failed to load activities.
            </Alert>
          )}

          {activitiesLoading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={6} key={i}>
                  <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {filteredActivities.map((activity) => (
                <Grid item xs={6} key={activity.id}>
                  <ActivityCard activity={activity} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Right: map placeholder */}
        <Box
          sx={{
            width: '45%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: 0,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Map coming soon
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
