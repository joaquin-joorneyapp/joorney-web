import { Plan } from '@/types/fetchs/responses/plan';
import { buildImageUrl } from '@/utils/image';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  plan: Plan;
}

export default function PlanCard({ plan }: Props) {
  const pictureUrl = plan.city.pictures[0]?.url
    ? buildImageUrl(plan.city.pictures[0].url)
    : null;

  const href = `/plans/${plan.id}`;

  const dateText = plan.startDate
    ? new Date(plan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No date set';

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #E5E5EA',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardActionArea>
          {pictureUrl ? (
            <Image
              alt={plan.city.title}
              src={pictureUrl}
              width={640}
              height={480}
              style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '160px', bgcolor: 'grey.200' }} />
          )}
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: '0.95rem',
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
              }}
            >
              {plan.city.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {plan.city.country}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {dateText}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {plan.days} day{plan.days !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
