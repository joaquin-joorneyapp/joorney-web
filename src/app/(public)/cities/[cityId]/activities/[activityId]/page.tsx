import AuthCTA from '@/components/AuthCTA';
import { fetchAllCities } from '@/fetchs/server/city';
import { fetchActivity, fetchCityActivities } from '@/fetchs/server/activity';
import { trimDescription } from '@/utils/trimDescription';
import { getPictureUrl } from '@/utils/image';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const cities = await fetchAllCities();
    const pairs = await Promise.all(
      cities.map(async (c) => {
        try {
          const activities = await fetchCityActivities(c.name);
          return activities.map((a) => ({ cityId: c.name, activityId: a.name }));
        } catch {
          return []; // skip this city if its activities endpoint fails
        }
      }),
    );
    return pairs.flat();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { cityId: string; activityId: string };
}): Promise<Metadata> {
  const activity = await fetchActivity(params.cityId, params.activityId);
  if (!activity) return { title: 'Activity' };
  const cityName = activity.city?.title ?? params.cityId;
  const ogImage = getPictureUrl(activity.pictures[0]);
  return {
    title: activity.title,
    description: trimDescription(activity.description, 160),
    alternates: { canonical: `/cities/${params.cityId}/activities/${params.activityId}` },
    openGraph: {
      title: `${activity.title} in ${cityName}`,
      description: trimDescription(activity.description, 160),
      images: ogImage ? [{ url: ogImage }] : [],
      type: 'article',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function PublicActivityDetailPage({
  params,
}: {
  params: { cityId: string; activityId: string };
}) {
  const activity = await fetchActivity(params.cityId, params.activityId);
  if (!activity) notFound();

  const cityName = activity.city?.title ?? params.cityId;
  const cityCountry = activity.city?.country;

  // Build the JSON-LD structured data object
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: activity.title,
    description: activity.description,
    address: activity.address,
    containedInPlace: {
      '@type': 'City',
      name: cityName,
      ...(cityCountry
        ? { containedInPlace: { '@type': 'Country', name: cityCountry } }
        : {}),
    },
  };
  // Only include geo when coordinates are non-zero
  if (activity.latitude && activity.longitude) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: activity.latitude,
      longitude: activity.longitude,
    };
  }
  const heroImage = getPictureUrl(activity.pictures[0]);
  if (heroImage) {
    jsonLd.image = heroImage;
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Joorney', item: 'https://joorney.com' },
      { '@type': 'ListItem', position: 2, name: cityName, item: `https://joorney.com/cities/${params.cityId}/activities` },
      { '@type': 'ListItem', position: 3, name: activity.title },
    ],
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 16 }}>
      {/* JSON-LD structured data — rendered server-side, visible to crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {heroImage && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 400,
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Image
            src={heroImage}
            alt={activity.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </Box>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        {activity.title}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label={cityName} variant="outlined" size="small" />
        {activity.duration ? (
          <Chip label={`${activity.duration} min`} size="small" />
        ) : null}
      </Stack>

      {activity.address && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {activity.address}
        </Typography>
      )}

      {activity.description && (
        <Typography variant="body1" sx={{ mb: 3 }}>
          {activity.description}
        </Typography>
      )}

      <AuthCTA />
    </Container>
  );
}
