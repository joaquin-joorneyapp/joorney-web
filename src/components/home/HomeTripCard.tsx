'use client';

import { Plan } from '@/types/fetchs/responses/plan';
import { getPictureUrl } from '@/utils/image';
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
  const pictureUrl =
    getPictureUrl(plan.city.pictures[0]) ??
    getPictureUrl(plan.city.pictures[1]) ??
    getPictureUrl(plan.city.pictures[2]);

  const startDate = plan.startDate ? new Date(plan.startDate) : null;
  const endDate =
    startDate ? new Date(startDate.getTime() + plan.days * 24 * 60 * 60 * 1000) : null;

  const dateLabel =
    startDate && endDate
      ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`
      : `${plan.days} days`;

  const progress =
    showProgress && startDate ? getProgressValue(startDate, plan.days) : 0;

  if (showProgress) {
    return (
      <Card
        sx={{ width: { xs: '100%', md: '50%' }, cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: 3 }}
        onClick={() => plan.id && router.push(`/plans/${plan.id}`)}
      >
        <Box sx={{ position: 'relative', height: { xs: 220, md: 320 } }}>
          {pictureUrl ? (
            <Image
              alt={plan.city.title}
              src={pictureUrl}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.300' }} />
          )}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
            }}
          />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3 }}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.1 }}>
              {plan.city.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PlaceIcon sx={{ fontSize: 16 }} />
                {plan.city.country}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonthIcon sx={{ fontSize: 16 }} />
                {dateLabel}
              </Typography>
            </Box>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 6, '& .MuiLinearProgress-bar': { backgroundColor: 'primary.main' } }}
        />
        <CardContent sx={{ py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}% through your trip
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{ minWidth: 200, maxWidth: 220, flexShrink: 0, cursor: 'pointer' }}
      onClick={() => plan.id && router.push(`/plans/${plan.id}`)}
    >
      {pictureUrl ? (
        <Image
          alt={plan.city.title}
          src={pictureUrl}
          width={640}
          height={480}
          style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box sx={{ width: '100%', height: '140px', bgcolor: 'grey.200' }} />
      )}
      <CardContent>
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
    </Card>
  );
}
