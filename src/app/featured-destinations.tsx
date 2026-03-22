import { fetchAllCities } from '@/fetchs/server/city';
import { getPictureUrl } from '@/utils/image';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from 'next/link';

export default async function FeaturedDestinations() {
  let cities;
  try {
    const all = await fetchAllCities();
    cities = all.filter((c) => getPictureUrl(c.pictures[0])).slice(0, 6);
  } catch {
    return null;
  }
  if (cities.length === 0) return null;

  return (
    <Box component="section" sx={{ py: 12, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom>
          Popular Destinations
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
          Discover the best activities in top cities around the world
        </Typography>
        <Grid container spacing={3}>
          {cities.map((city) => {
            const image = getPictureUrl(city.pictures[0])!;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={city.id}>
                <Card
                  component={Link}
                  href={`/cities/${city.name}/activities`}
                  sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                    <Image
                      src={image}
                      alt={`Activities in ${city.title}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6">{city.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {city.country}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
