'use client';

import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowRight,
  Calendar,
  Compass,
  Heart,
  Map,
  MapPin,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo } from 'react';
import { AuthUserContext } from '@/contexts/AuthUserContext';
import { getCities } from '@/fetchs/city';
import { City } from '@/types/fetchs/responses/city';
import { getCityImage } from '@/components/plan-form/CityPicker';

// Defines which cities appear in the carousel and in what order.
const CAROUSEL_CITIES = [
  { name: 'paris',       title: 'Paris'       },
  { name: 'tokyo',       title: 'Tokyo'       },
  { name: 'rome',        title: 'Rome'        },
  { name: 'new-york',    title: 'New York'    },
  { name: 'barcelona',   title: 'Barcelona'   },
  { name: 'london',      title: 'London'      },
  { name: 'dubai',       title: 'Dubai'       },
  { name: 'singapore',   title: 'Singapore'   },
  { name: 'sydney',      title: 'Sydney'      },
  { name: 'amsterdam',   title: 'Amsterdam'   },
];

export default function LandingPageClient() {
  const router = useRouter();
  const { user } = useContext(AuthUserContext);
  const { data: apiCities, isLoading: isLoadingCities } = getCities();

  // Build a slug → apiCity lookup so we can pull GCS pictures when available
  const cityBySlug = useMemo(() => {
    const map: Record<string, City> = {};
    apiCities?.forEach((c) => { map[c.name] = c; });
    return map;
  }, [apiCities]);

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user]);

  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, containScroll: 'trimSnaps' },
    [AutoScroll({ playOnInit: true })]
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(to bottom, #FFF3E0, #FFFFFF)',
          pt: 10,
          pb: 12,
          minHeight: '100vh'
        }}
      >
        {!user && (
          <Box sx={{ position: 'absolute', top: 20, right: 24, zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button href="/login" sx={{ textTransform: 'none', fontWeight: 500, color: 'text.secondary', p: 0, minWidth: 0 }}>
              Log in
            </Button>
            <Button href="/signup" sx={{ textTransform: 'none', fontWeight: 500, color: 'text.secondary', p: 0, minWidth: 0 }}>
              Sign up
            </Button>
          </Box>
        )}
        <Container maxWidth={false}>
          <Box sx={{ textAlign: 'center'}}>
            <Box
              component="img"
              src="/logo.svg"
              alt="Joorney"
              width="100"

              height={{ md: 86, xs: 65 }}
            />

            <Typography
              component="h1"
              gutterBottom
              sx={{ mt: 6, typography: { xs: 'h3', md: 'h2' } }}
            >
              Your Perfect City Guide
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 720, mx: 'auto', mb: 8 }}
            >
              Discover and explore cities like never before. No research needed
              - just choose your destination and let us plan the perfect trip
              for you.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/new-plan')}
              size="large"
              endIcon={<ArrowRight />}
              sx={{ mb: 9, color: 'white' }}
            >
              Start
            </Button>

            {/* City Images Carousel */}
            {isLoadingCities ? (
              <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden', px: 1 }}>
                {CAROUSEL_CITIES.map((city) => (
                  <Skeleton
                    key={city.name}
                    variant="rounded"
                    sx={{ flexShrink: 0, width: 450, height: { xs: 220, md: 300 }, borderRadius: 3 }}
                  />
                ))}
              </Box>
            ) : (
              <Box
                ref={emblaRef}
                className="embla"
                sx={{ overflow: 'hidden' }}
              >
                <Box className="embla__container" sx={{ display: 'flex' }}>
                  {CAROUSEL_CITIES.flatMap((city) => {
                    const apiCity = cityBySlug[city.name];
                    const image = getCityImage(apiCity);
                    if (!image) return [];
                    return [(
                      <Box
                        key={city.name}
                        className="embla__slide"
                        sx={{ position: 'relative', flexShrink: 0, pl: 2 }}
                      >
                        <Card
                          onClick={() => router.push(`/new-plan?city=${city.name}&step=1`)}
                          sx={{
                            height: { xs: 220, md: 300 },
                            position: 'relative',
                            cursor: 'pointer',
                            '&:hover .overlay': { opacity: 1 },
                            '&:hover img': { transform: 'scale(1.1)' },
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={image}
                            alt={city.title}
                            sx={{ height: { xs: 220, md: 300 }, transition: 'transform 0.7s' }}
                          />
                          <Box
                            className="overlay"
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                              p: 3,
                              opacity: 0,
                              transition: 'opacity 0.3s',
                            }}
                          >
                            <Typography variant="h6" color="white">{city.title}</Typography>
                            <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                              Discover the magic of {city.title}
                            </Typography>
                          </Box>
                        </Card>
                      </Box>
                    )];
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </Container>

      </Box>

      {/* How It Works Section */}
      <Box sx={{ pt: {xs: 6, md: 12}, pb: 20, maxHeight: '100vh', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            sx={{ typography: { xs: 'h3', md: 'h2' } }}
            align="center"
            gutterBottom
          >
            Plan Your Trip in 4 Simple Steps
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                icon: <MapPin />,
                title: 'Choose City',
                description:
                  'Select your dream destination from our curated list of cities',
              },
              {
                icon: <Calendar />,
                title: 'Set Duration',
                description: "Tell us how many days you'll be exploring",
              },
              {
                icon: <Heart />,
                title: 'Pick Interests',
                description:
                  'Share your preferences to personalize your experience',
              },
              {
                icon: <Map />,
                title: 'Enjoy the Trip',
                description:
                  'Follow your custom itinerary and make adjustments on the go',
              },
            ].map((step, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <IconButton
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'white',
                      mb: 2,
                      '&:hover': { bgcolor: 'primary.light' },
                    }}
                    size="large"
                  >
                    {step.icon}
                  </IconButton>
                  <Typography variant="h6" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Feature Highlight */}
      <Box sx={{ bgcolor: '#FFF3E0', py: 12 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                sx={{ typography: { xs: 'h3', md: 'h2' } }}
                gutterBottom
              >
                Everything You Need in One Place
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                No more endless research or multiple apps. Joorney provides all
                the information you need to explore a city, from must-see
                attractions to hidden gems.
              </Typography>
              <List>
                {[
                  'Curated local experiences',
                  'Flexible itineraries that adapt to you',
                  'Offline access to all information',
                ].map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          bgcolor: 'primary.main',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Compass
                          style={{ color: 'white', width: 20, height: 20 }}
                        />
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={6}
                sx={{ overflow: 'hidden', borderRadius: 4 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800"
                  alt="Travel Experience"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 12, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography sx={{typography: { xs: 'h3', md: 'h2' }}} gutterBottom>
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Join thousands of travelers who have discovered the easiest way to
            explore new cities.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ color: 'white' }}
            endIcon={<ArrowRight />}
          >
            Download App
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
