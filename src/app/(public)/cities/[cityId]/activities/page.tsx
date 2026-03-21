import AuthCTA from '@/components/AuthCTA';
import { fetchAllCities } from '@/fetchs/server/city';
import { fetchCityActivities } from '@/fetchs/server/activity';
import { buildImageUrl } from '@/utils/image';
import { trimDescription } from '@/utils/trimDescription';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const cities = await fetchAllCities();
    return cities.map((c) => ({ cityId: c.name }));
  } catch {
    return []; // build continues; pages served on-demand via SSR
  }
}

export async function generateMetadata({
  params,
}: {
  params: { cityId: string };
}): Promise<Metadata> {
  try {
    const cities = await fetchAllCities();
    const city = cities.find((c) => c.name === params.cityId);
    if (!city) return { title: 'Activities' };
    return {
      title: `Activities in ${city.title}`,
      description: `Explore activities in ${city.title}, ${city.country}.`,
      openGraph: {
        title: `Activities in ${city.title} — Joorney`,
        description: `Explore activities in ${city.title}, ${city.country}.`,
        images: city.pictures[0] ? [{ url: buildImageUrl(city.pictures[0].url) }] : [],
      },
    };
  } catch {
    return { title: 'Activities' };
  }
}

export default async function PublicActivitiesPage({
  params,
}: {
  params: { cityId: string };
}) {
  const [cities, activities] = await Promise.all([
    fetchAllCities(),
    fetchCityActivities(params.cityId).catch(() => []),
  ]);

  const city = cities.find((c) => c.name === params.cityId);
  if (!city) notFound();

  return (
    // pb: 16 leaves space above the fixed AuthCTA banner (~64px)
    <Container maxWidth="lg" sx={{ py: 4, pb: 16 }}>
      <Typography variant="h4" gutterBottom>
        Activities in {city.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {city.country}
      </Typography>
      <Grid container spacing={3}>
        {activities.map((activity) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={activity.id}>
            <Card
              component={Link}
              href={`/cities/${params.cityId}/activities/${activity.name}`}
              sx={{
                textDecoration: 'none',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {activity.pictures[0] && (
                <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <Image
                    src={buildImageUrl(activity.pictures[0].url)}
                    alt={activity.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {activity.title}
                </Typography>
                {activity.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {trimDescription(activity.description, 100)}
                  </Typography>
                )}
                {activity.duration ? (
                  <Chip label={`${activity.duration} min`} size="small" />
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <AuthCTA />
    </Container>
  );
}
