'use client';

import { CityWithDistance } from '@/fetchs/city';
import { buildImageUrl } from '@/utils/image';
import PlaceIcon from '@mui/icons-material/Place';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  city: CityWithDistance;
}

export default function NearbyCityCard({ city }: Props) {
  const router = useRouter();
  const pictureUrl = city.pictures[0]?.url ? buildImageUrl(city.pictures[0].url) : null;

  return (
    <Card>
      {pictureUrl ? (
        <Image
          alt={city.title}
          src={pictureUrl}
          width={1280}
          height={480}
          style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box sx={{ width: '100%', height: '200px', bgcolor: 'grey.200' }} />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" component="div">
              {city.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <PlaceIcon sx={{ fontSize: 14 }} />
              {city.country} • {city.distance_km.toFixed(0)} km away
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Discover this amazing destination just {city.distance_km.toFixed(0)} km away from your location.
        </Typography>
        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ color: 'white' }}
          onClick={() => router.push(`/cities/${city.id}/new-plan`)}
        >
          Create Plan
        </Button>
      </CardContent>
    </Card>
  );
}
