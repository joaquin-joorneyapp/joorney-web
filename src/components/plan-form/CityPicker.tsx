'use client';
import { City } from '@/types/fetchs/responses/city';
import { buildImageUrl } from '@/utils/image';
import { Check, Close, ExploreOutlined, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardMedia,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import SectionHeader from './SectionHeader';

const CITY_FALLBACK_IMAGES: Record<string, string> = {
  'new-york':
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
  paris:
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  tokyo:
    'https://i.pinimg.com/736x/12/ef/8a/12ef8ad05ccdf05b1571e8f3dd138ffa.jpg',
  rome: 'https://i.pinimg.com/1200x/37/3d/dc/373ddca9c9fc9f26dba60fb784c17a2d.jpg',
  barcelona:
    'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=80',
  london:
    'https://i.pinimg.com/1200x/6c/33/2b/6c332bfe7e4cacc4e34dd1635c8cb79c.jpg',
  dubai:
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  singapore:
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  sydney:
    'https://i.pinimg.com/736x/f6/76/ff/f676ff7ec7f01ced5b469b95a1f02e89.jpg',
  amsterdam:
    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80',
  'buenos-aires':
    'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?auto=format&fit=crop&w=800&q=80',
  istanbul:
    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
  bangkok:
    'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';

export function getCityImage(city: {
  name: string;
  title: string;
  pictures?: string[] | { url: string }[];
}): string {
  if (city.pictures && city.pictures.length > 0) {
    const pic = city.pictures[0];
    const url = typeof pic === 'string' ? pic : pic.url;
    return url.startsWith('https://') ? url : buildImageUrl(url);
  }
  const byName = CITY_FALLBACK_IMAGES[city.name];
  if (byName) return byName;
  const titleSlug = city.title.toLowerCase().replace(/\s+/g, '-');
  return CITY_FALLBACK_IMAGES[titleSlug] || DEFAULT_FALLBACK;
}

export default function CityPicker({
  cities,
  isLoading,
  selectedCity,
  onCityChange,
  attempted,
}: {
  cities: City[] | undefined;
  isLoading: boolean;
  selectedCity: string | null;
  onCityChange: (city: string | null) => void;
  attempted?: boolean;
}) {
  const [citySearch, setCitySearch] = useState('');

  const filteredCities = useMemo(() => {
    if (!cities) return [];
    if (!citySearch.trim()) return cities;
    const q = citySearch.toLowerCase();
    return cities.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [cities, citySearch]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        mb: 4,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'white',
      }}
    >
      <SectionHeader
        icon={<ExploreOutlined sx={{ fontSize: 22 }} />}
        title="Where do you want to go?"
        subtitle="Pick one destination and we'll take it from there."
      />

      <TextField
        fullWidth
        placeholder="Search cities…"
        value={citySearch}
        onChange={(e) => setCitySearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: citySearch ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setCitySearch('')} edge="end">
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }, (_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Skeleton
                variant="rounded"
                sx={{ height: { xs: 130, md: 170 }, borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredCities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">
            No cities found for &quot;{citySearch}&quot;
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredCities.map((city) => {
            const isSelected = selectedCity === city.name;
            return (
              <Grid item xs={6} sm={4} md={3} key={city.id}>
                <Card
                  onClick={() => onCityChange(isSelected ? null : city.name)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    height: { xs: 130, md: 170 },
                    border: '3px solid',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.25s ease',
                    boxShadow: isSelected ? 6 : 1,
                    '&:hover': { transform: 'scale(1.04)', boxShadow: 5 },
                    '&:hover img': { transform: 'scale(1.1)' },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={getCityImage(city)}
                    alt={city.title}
                    sx={{
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="white"
                      sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}
                    >
                      {city.title}
                    </Typography>
                  </Box>
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 2,
                      }}
                    >
                      <Check sx={{ fontSize: 18 }} />
                    </Box>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {attempted && !selectedCity && (
        <Alert severity="error" sx={{ mt: 2.5, borderRadius: 2 }}>
          Please select a city to continue.
        </Alert>
      )}
    </Paper>
  );
}
