import { Plan } from '@/types/fetchs/responses/plan';
import { buildImageUrl } from '@/utils/image';
import { Button, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  plan: Plan;
}

export default function PlanCard({ plan }: Props) {
  const router = useRouter();
  return (
    <Card
      sx={{
        cursor: 'pointer',
      }}
      onClick={() => router.push(`/plans/${plan.id}`)}
    >
      <Image
        alt={plan.city.title}
        src={buildImageUrl(plan.city.pictures[0]?.url ?? plan.city.pictures[1]?.url ?? plan.city.pictures[2]?.url ?? '')}
        width={640}
        height={480}
        style={{
          maxWidth: '100%',
          height: '250px',
          objectFit: 'cover',
        }}
      />
      <CardContent>
        <Grid container>
          <Grid xs={6}>
            <Typography gutterBottom variant="h5" component="div">
              {plan.city.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {plan.days} days
            </Typography>
          </Grid>
          <Grid
            xs={6}
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            justifyContent="center"
          >
            {' '}
            <Button size="large" sx={{ fontWeight: 'bold' }}>
              View
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
