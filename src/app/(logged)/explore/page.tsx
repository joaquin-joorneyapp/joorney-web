'use client';

import ActivityCard from '@/components/explore/ActivityCard';
import { getClosestActivities } from '@/fetchs/activity';
import { getCategories } from '@/fetchs/category';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Map, Marker } from 'react-map-gl';
import { MAPBOX_API_TOKEN } from '@/configs/mapbox';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SearchIcon from '@mui/icons-material/Search';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ListIcon from '@mui/icons-material/List';
import { useState } from 'react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Client-side filtering (category AND search compose)
  const filteredActivities = (activities ?? []).filter((activity) => {
    const matchesCategory =
      selectedCategoryIds.length === 0 ||
      activity.categories.some((c) => selectedCategoryIds.includes(c.id));
    const matchesSearch =
      searchQuery === '' ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    // On mobile, break out of layout's marginX (0.5rem) + px:1 (8px) = 1rem per side
    // and use correct height: layout mt=48px + pt=24px = 72px offset on mobile
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 90px)' },
      mx: { xs: '-1rem', md: 0 },
    }}>
      {/* Search bar */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
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
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, mode) => mode && setViewMode(mode)}
          sx={{ display: { xs: 'flex', md: 'none' }, height: 40, flexShrink: 0 }}
        >
          <ToggleButton value="list" aria-label="list view">
            <ListIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="map" aria-label="map view">
            <MapOutlinedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Category pills */}
      <Box
        sx={{
          px: 3,
          py: 1,
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
              onClick={() => setSelectedCategoryIds([])}
              sx={{
                borderRadius: 4, px: 2, flexShrink: 0,
                bgcolor: selectedCategoryIds.length === 0 ? '#F67D56' : '#F2F2F7',
                color: selectedCategoryIds.length === 0 ? '#fff' : 'text.primary',
                '&:hover': { bgcolor: selectedCategoryIds.length === 0 ? '#e56b45' : '#e0e0e7' },
                textTransform: 'none', fontWeight: 500,
              }}
            >
              All
            </Button>
            {(categories ?? []).map((cat) => (
              <Button
                key={cat.id}
                size="small"
                onClick={() => toggleCategory(cat.id)}
                sx={{
                  borderRadius: 4, px: 2, flexShrink: 0,
                  bgcolor: selectedCategoryIds.includes(cat.id) ? '#F67D56' : '#F2F2F7',
                  color: selectedCategoryIds.includes(cat.id) ? '#fff' : 'text.primary',
                  '&:hover': { bgcolor: selectedCategoryIds.includes(cat.id) ? '#e56b45' : '#e0e0e7' },
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
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left: activity grid */}
        <Box sx={{ display: { xs: viewMode === 'map' ? 'none' : 'flex', md: 'flex' }, flexDirection: 'column', width: { xs: '100%', md: '55%' }, overflowY: 'auto', p: 3, borderRight: { xs: 'none', md: '1px solid #E5E5EA' } }}>
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
                <Grid item xs={12} md={6} key={i}>
                  <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {filteredActivities.map((activity) => (
                <Grid item xs={12} md={6} key={activity.id}>
                  <ActivityCard activity={activity} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Right: Mapbox map */}
        <Box sx={{
          display: { xs: viewMode === 'map' ? 'block' : 'none', md: 'block' },
          width: { xs: '100%', md: '45%' },
          // Mobile: fill remaining height (100vh minus navbar+pt:72px, search:72px, pills:48px)
          height: { xs: 'calc(100vh - 192px)', md: 'calc(100vh - 90px)' },
          flexShrink: 0,
        }}>
          {effectiveLat && effectiveLng && (
            <Map
              key={viewMode}
              mapboxAccessToken={MAPBOX_API_TOKEN}
              mapLib={import('mapbox-gl')}
              initialViewState={{
                latitude: effectiveLat,
                longitude: effectiveLng,
                zoom: 13,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/streets-v9"
            >
              {filteredActivities.map((activity, index) => (
                <Marker
                  key={activity.id}
                  latitude={activity.latitude}
                  longitude={activity.longitude}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: '#F67D56',
                      border: '2px solid #fff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                      cursor: 'pointer',
                    }}
                  >
                    {index + 1}
                  </Box>
                </Marker>
              ))}
            </Map>
          )}
        </Box>
      </Box>
    </Box>
  );
}
