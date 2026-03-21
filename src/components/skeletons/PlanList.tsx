import { Grid } from '@mui/material';
import PlanCardSkeleton from './PlanCard';

export default function PlanListSkeleton() {
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      {Array.from(Array(3)).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={i}>
          <PlanCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}
