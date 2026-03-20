'use client';

import { Plan } from '@/types/fetchs/responses/plan';
import { buildImageUrl } from '@/utils/image';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlaceIcon from '@mui/icons-material/Place';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  plan: Plan;
  showProgress?: boolean;
}

function getProgressValue(startDate: Date, days: number): number {
  const start = new Date(startDate).getTime();
  const end = start + days * 24 * 60 * 60 * 1000;
  const now = Date.now();
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}

export default function HomeTripCard({ plan, showProgress = false }: Props) {
  const router = useRouter();
  const pictureUrl = buildImageUrl(
    plan.city.pictures[0]?.url ?? plan.city.pictures[1]?.url ?? plan.city.pictures[2]?.url ?? ''
  );

  const startDate = plan.startDate ? new Date(plan.startDate) : null;
  const endDate =
    startDate ? new Date(startDate.getTime() + plan.days * 24 * 60 * 60 * 1000) : null;

  const dateLabel =
    startDate && endDate
      ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`
      : `${plan.days} days`;

  const progress =
    showProgress && startDate ? getProgressValue(startDate, plan.days) : 0;

  return (
    <Card
      sx={{ minWidth: 200, maxWidth: 220, flexShrink: 0, cursor: 'pointer' }}
      onClick={() => router.push(`/plans/${plan.id}`)}
    >
      <Image
        alt={plan.city.title}
        src={pictureUrl}
        width={640}
        height={480}
        style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
      />
      <CardContent sx={{ pb: showProgress ? 0 : undefined }}>
        <Typography variant="h5" component="div" sx={{ fontSize: '1.1rem' }}>
          {plan.city.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <PlaceIcon sx={{ fontSize: 14 }} />
          {plan.city.country}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          <CalendarMonthIcon sx={{ fontSize: 14 }} />
          {dateLabel}
        </Typography>
      </CardContent>
      {showProgress && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 4, '& .MuiLinearProgress-bar': { backgroundColor: 'primary.main' } }}
        />
      )}
    </Card>
  );
}
