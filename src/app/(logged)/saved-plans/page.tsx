'use client';
import PlanCard from '@/components/PlanCard';
import PlanListSkeleton from '@/components/skeletons/PlanList';
import { getPlans } from '@/fetchs/plan';
import { Alert, Box, Button, Grid, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

function PlanGrid({ plans }: { plans: ReturnType<typeof getPlans>['data'] }) {
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      {plans?.map((plan, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={i}>
          <PlanCard plan={plan} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function SavedPlansPage({}) {
  const { data: plans, isLoading } = getPlans();
  const router = useRouter();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingPlans = plans?.filter((plan) => {
    if (!plan.startDate) return true;
    const end = new Date(plan.startDate);
    end.setDate(end.getDate() + plan.days);
    return end >= today;
  });

  const previousPlans = plans?.filter((plan) => {
    if (!plan.startDate) return false;
    const end = new Date(plan.startDate);
    end.setDate(end.getDate() + plan.days);
    return end < today;
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" component="div" marginTop={2} marginBottom={4}>
          Saved Plans
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ color: 'white' }}
          onClick={() => router.push('/new-plan')}
        >
          New trip
        </Button>
      </Box>

      {!isLoading && !plans?.length && (
        <Alert severity="info" variant="filled" sx={{ mt: 2, mb: 5 }}>
          You didn't create any plan yet.
        </Alert>
      )}

      {isLoading ? (
        <PlanListSkeleton />
      ) : (
        <>
          {!!upcomingPlans?.length && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>Upcoming Trips</Typography>
              <PlanGrid plans={upcomingPlans} />
            </Box>
          )}
          {!!previousPlans?.length && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2 }}>Previous Trips</Typography>
              <PlanGrid plans={previousPlans} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
