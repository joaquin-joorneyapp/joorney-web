'use client';
import PlanCard from '@/components/PlanCard';
import PlanListSkeleton from '@/components/skeletons/PlanList';
import { getPlans } from '@/fetchs/plan';
import { Alert, Box, Button, Grid, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SavedPlansPage({}) {
  const { data: plans, isLoading } = getPlans();
  const router = useRouter();
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
        <Grid container rowSpacing={3} columnSpacing={3}>
          {plans?.map((plan, i) => (
            <Grid item key={i} xl={3} lg={4} md={6} sm={6} xs={12}>
              <PlanCard plan={plan} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
