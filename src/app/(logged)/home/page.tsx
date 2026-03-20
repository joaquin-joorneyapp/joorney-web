'use client';

import HomeTripCard from '@/components/home/HomeTripCard';
import HorizontalScrollSection from '@/components/home/HorizontalScrollSection';
import NearbyActivityCard from '@/components/home/NearbyActivityCard';
import NearbyCityCard from '@/components/home/NearbyCityCard';
import { ActivityWithDistance, getClosestActivities } from '@/fetchs/activity';
import { getClosestCity } from '@/fetchs/city';
import { getPlans } from '@/fetchs/plan';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Plan } from '@/types/fetchs/responses/plan';
import HomePageSkeleton from '@/components/skeletons/HomePage';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

interface TimeSlot {
  title: string;
  keywords: string[];
}

function getTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11)
    return { title: '🌅 Breakfast Time', keywords: ['cafe', 'coffee', 'breakfast', 'bakery', 'brunch', 'tea'] };
  if (hour >= 11 && hour < 16)
    return { title: '🍽️ Lunch Time', keywords: ['restaurant', 'lunch', 'food', 'cafe', 'bistro', 'brasserie'] };
  if (hour >= 16 && hour < 23)
    return { title: '🌙 Dinner Time', keywords: ['restaurant', 'dinner', 'food', 'bar', 'pub', 'bistro', 'brasserie', 'grill'] };
  return { title: '✨ Late Night Bites', keywords: ['bar', 'club', 'nightlife', 'cocktail', 'pub', 'lounge', 'nightclub'] };
}

function filterByTimeSlot(activities: ActivityWithDistance[], keywords: string[]): ActivityWithDistance[] {
  return activities.filter((a) =>
    a.categories.some((c) =>
      keywords.some(
        (kw) =>
          c.name.toLowerCase().includes(kw) ||
          c.title.toLowerCase().includes(kw)
      )
    )
  );
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

  // Fetch more so filtering still yields enough results
  const { data: closestActivities } = getClosestActivities(lat, lng, 30);
  const { data: closestCities } = getClosestCity(lat, lng);

  const { current, upcoming, previous } = classifyPlans(plans ?? []);
  const hasTrips = current.length > 0 || upcoming.length > 0 || previous.length > 0;
  const hasNoPlans = !plansLoading && !plansError && !hasTrips;
  const closestCity = closestCities?.[0];

  const timeSlot = getTimeSlot();
  const timeActivities = closestActivities
    ? filterByTimeSlot(closestActivities, timeSlot.keywords).slice(0, 10)
    : [];

  return (
    <Box sx={{ width: '100%' }}>
      {plansLoading && <HomePageSkeleton />}

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

      {/* Current trip — full-width hero */}
      {current.length > 0 && (
        <Box sx={{ mt: { xs: 1, md: 0 }, mb: 5 }}>
          <HomeTripCard plan={current[0]} showProgress />
        </Box>
      )}

      {/* Time-based activities filtered by category */}
      {timeActivities.length > 0 && (
        <Box sx={{ mx: -1, px: 1, py: 3, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <HorizontalScrollSection title={timeSlot.title}>
            {timeActivities.map((activity) => (
              <NearbyActivityCard key={activity.id} activity={activity} />
            ))}
          </HorizontalScrollSection>
        </Box>
      )}

      {/* Upcoming trips */}
      {upcoming.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <HorizontalScrollSection title="Upcoming Trips">
            {upcoming.map((plan) => (
              <HomeTripCard key={plan.id} plan={plan} />
            ))}
          </HorizontalScrollSection>
        </Box>
      )}

      {/* Previous trips */}
      {previous.length > 0 && (
        <Box sx={{ mx: -1, px: 1, py: 3, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <HorizontalScrollSection title="Previous Trips">
            {previous.map((plan) => (
              <HomeTripCard key={plan.id} plan={plan} />
            ))}
          </HorizontalScrollSection>
        </Box>
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
