'use client';

import HomeTripCard from '@/components/home/HomeTripCard';
import HorizontalScrollSection from '@/components/home/HorizontalScrollSection';
import NearbyActivityCard from '@/components/home/NearbyActivityCard';
import NearbyCityCard from '@/components/home/NearbyCityCard';
import { ActivityWithDistance, getClosestActivities } from '@/fetchs/activity';
import { CityWithDistance, getClosestCity } from '@/fetchs/city';
import { getPlans } from '@/fetchs/plan';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Plan } from '@/types/fetchs/responses/plan';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

function getTimeSectionTitle(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return '🌅 Breakfast Time';
  if (hour >= 11 && hour < 16) return '🍽️ Lunch Time';
  if (hour >= 16 && hour < 23) return '🌙 Dinner Time';
  return '✨ Late Night Bites';
}

function classifyPlans(plans: Plan[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current: Plan[] = [];
  const upcoming: Plan[] = [];
  const previous: Plan[] = [];

  for (const plan of plans) {
    if (!plan.startDate) continue;
    const start = new Date(plan.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + plan.days * 24 * 60 * 60 * 1000);

    if (start <= today && today < end) {
      current.push(plan);
    } else if (start > today) {
      upcoming.push(plan);
    } else {
      previous.push(plan);
    }
  }

  return { current, upcoming, previous };
}

export default function HomePage() {
  const router = useRouter();
  const { data: plans, isLoading: plansLoading, isError: plansError } = getPlans();
  const { lat, lng } = useGeolocation();

  const { data: closestActivities } = getClosestActivities(lat, lng, 10);
  const { data: closestCities } = getClosestCity(lat, lng);

  const { current, upcoming, previous } = classifyPlans(plans ?? []);
  const hasTrips = current.length > 0 || upcoming.length > 0 || previous.length > 0;
  const hasNoPlans = !plansLoading && !plansError && !hasTrips;
  const closestCity = closestCities?.[0];

  return (
    <Box sx={{ width: '100%' }}>
      {plansLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!plansLoading && (
        <>
      {plansError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Could not load your trips.
        </Alert>
      )}

      {/* Empty state */}
      {hasNoPlans && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" component="div" sx={{ mb: 2 }}>
            Welcome to Joorney
          </Typography>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" gutterBottom>
                Ready to plan your first trip?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Discover cities, build itineraries, and make the most of every journey.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{ color: 'white' }}
                onClick={() => router.push('/new-plan')}
              >
                New Plan
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Current trip */}
      {current.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" component="div" sx={{ mb: 2 }}>
            Current Trip
          </Typography>
          <HomeTripCard
            plan={current[0]}
            showProgress
          />
        </Box>
      )}

      {/* Upcoming trips */}
      {upcoming.length > 0 && (
        <HorizontalScrollSection title="Upcoming Trips">
          {upcoming.map((plan) => (
            <HomeTripCard key={plan.id} plan={plan} />
          ))}
        </HorizontalScrollSection>
      )}

      {/* Time-based activities */}
      {closestActivities && closestActivities.length > 0 && (
        <HorizontalScrollSection title={getTimeSectionTitle()}>
          {closestActivities.map((activity) => (
            <NearbyActivityCard key={activity.id} activity={activity} />
          ))}
        </HorizontalScrollSection>
      )}

      {/* Previous trips */}
      {previous.length > 0 && (
        <HorizontalScrollSection title="Previous Trips">
          {previous.map((plan) => (
            <HomeTripCard key={plan.id} plan={plan} />
          ))}
        </HorizontalScrollSection>
      )}

      {/* Nearby city — only if no current trip */}
      {current.length === 0 && closestCity && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" component="div" sx={{ mb: 2 }}>
            Nearby City
          </Typography>
          <NearbyCityCard city={closestCity} />
        </Box>
      )}
        </>
      )}
    </Box>
  );
}
