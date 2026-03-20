// src/components/explore/ActivityCard.tsx
import { ActivityWithDistance } from '@/fetchs/activity';
import { buildImageUrl } from '@/utils/image';
import NavigationIcon from '@mui/icons-material/Navigation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  activity: ActivityWithDistance;
}

export default function ActivityCard({ activity }: Props) {
  const router = useRouter();
  const pictureUrl = activity.pictures[0]?.url
    ? buildImageUrl(activity.pictures[0].url)
    : null;

  const handleClick = () => {
    router.push(`/cities/${activity.city.name}/activities/${activity.name}`);
  };

  const durationText =
    activity.duration < 60
      ? `${activity.duration} min`
      : `${Math.floor(activity.duration / 60)}h ${activity.duration % 60 > 0 ? `${activity.duration % 60}m` : ''}`.trim();

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #E5E5EA',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <CardActionArea onClick={handleClick}>
        {pictureUrl ? (
          <Image
            alt={activity.title}
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
            {activity.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {activity.categories.map((c) => c.title).join(', ')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <NavigationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {activity.distance.toFixed(1)} km
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {durationText}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
