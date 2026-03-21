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

  const { lat, lng, loading: geoLoading } = useGeolocation();
  const effectiveLat = lat ?? (geoLoading ? null : 48.8566);
  const effectiveLng = lng ?? (geoLoading ? null : 2.3522);

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
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 90px)' },
      mx: { xs: '-1rem', md: 0 },
    }}>

      {/* Title */}
      <Box sx={{ px: 3, pt: 2, pb: 0, flexShrink: 0 }}>
        <Typography variant="h4">Nearby Activities</Typography>
      </Box>

      {/* Search bar + mobile toggle */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
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

      {/* Category pills — scrollable on mobile, wrap on desktop */}
      <Box sx={{
        px: 3,
        py: 1,
        display: 'flex',
        gap: 1,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        flexShrink: 0,
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
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
        <Box sx={{
          display: { xs: viewMode === 'map' ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          width: { xs: '100%', md: '55%' },
          overflowY: 'auto',
          p: 3,
        }}>
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
                <Grid size={{ xs: 12, md: 6 }} key={i}>
                  <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {filteredActivities.map((activity) => (
                <Grid size={{ xs: 12, md: 6 }} key={activity.id}>
                  <ActivityCard activity={activity} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Right: Mapbox map — pt:3 on desktop aligns map top with card grid top */}
        <Box sx={{
          display: { xs: viewMode === 'map' ? 'block' : 'none', md: 'block' },
          width: { xs: '100%', md: '45%' },
          height: { xs: 'calc(100vh - 192px)', md: 'auto' },
          alignSelf: 'stretch',
          flexShrink: 0,
          pt: { xs: 0, md: 3 },
          pr: { xs: 0, md: 2 },
          pb: { xs: 0, md: 3 },
        }}>
          <Box sx={{ borderRadius: { xs: 0, md: 5 }, overflow: 'hidden', height: '100%' }}>
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
                    <Box sx={{
                      width: 28, height: 28,
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
                    }}>
                      {index + 1}
                    </Box>
                  </Marker>
                ))}
              </Map>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
