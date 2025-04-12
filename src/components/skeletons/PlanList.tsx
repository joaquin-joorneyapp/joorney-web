import { Grid } from '@mui/material';
import PlanCardSkeleton from './PlanCard';

export default function PlanListSkeleton() {
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      {Array.from(Array(3)).map((_, i) => (
        <Grid key={i} xl={3} lg={4} md={6} sm={6} xs={12} item>
          <PlanCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}
