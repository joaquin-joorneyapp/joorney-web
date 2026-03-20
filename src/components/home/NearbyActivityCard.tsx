import { buildImageUrl } from '@/utils/image';
import PlaceIcon from '@mui/icons-material/Place';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import { ActivityWithDistance } from '@/fetchs/activity';

interface Props {
  activity: ActivityWithDistance;
}

export default function NearbyActivityCard({ activity }: Props) {
  const pictureUrl = buildImageUrl(activity.pictures[0]?.url ?? '');

  return (
    <Card sx={{ minWidth: 160, maxWidth: 180, flexShrink: 0 }}>
      <Image
        alt={activity.title}
        src={pictureUrl}
        width={640}
        height={480}
        style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
      />
      <CardContent sx={{ p: '12px !important' }}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activity.title}
        </Typography>
        {activity.categories[0] && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {activity.categories[0].name}
          </Typography>
        )}
        <Typography
          variant="body2"
          color="primary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
        >
          <PlaceIcon sx={{ fontSize: 14 }} />
          {activity.distance_km.toFixed(1)} km
        </Typography>
      </CardContent>
    </Card>
  );
}
