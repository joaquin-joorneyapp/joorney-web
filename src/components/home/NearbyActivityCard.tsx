import { buildImageUrl } from '@/utils/image';
import PlaceIcon from '@mui/icons-material/Place';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from 'next/link';

import { ActivityWithDistance } from '@/fetchs/activity';

interface Props {
  activity: ActivityWithDistance;
}

export default function NearbyActivityCard({ activity }: Props) {
  const pic = activity.pictures[0];
  const pictureUrl = pic
    ? buildImageUrl(typeof pic === 'string' ? pic : (pic as { url: string }).url)
    : null;

  const href = `/cities/${activity.city.name}/activities/${activity.name}`;

  return (
    <Card sx={{ minWidth: 160, maxWidth: 180, flexShrink: 0 }}>
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <CardActionArea>
      {pictureUrl ? (
        <Image
          alt={activity.title}
          src={pictureUrl}
          width={640}
          height={480}
          style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box sx={{ width: '100%', height: '120px', bgcolor: 'grey.200' }} />
      )}
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
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activity.categories[0].title}
          </Typography>
        )}
        <Typography
          variant="body2"
          color="primary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
        >
          <PlaceIcon sx={{ fontSize: 14 }} />
          {activity.distance?.toFixed(1)} km
        </Typography>
      </CardContent>
      </CardActionArea>
      </Link>
    </Card>
  );
}
