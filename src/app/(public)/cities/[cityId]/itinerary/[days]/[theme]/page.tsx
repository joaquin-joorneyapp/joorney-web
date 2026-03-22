import AuthCTA from '@/components/AuthCTA';
import ItineraryTimeline from '@/components/ItineraryTimeline';
import { fetchAllCities } from '@/fetchs/server/city';
import { fetchAllCategories } from '@/fetchs/server/category';
import { fetchSampleItinerary } from '@/fetchs/server/plan';
import { getPictureUrl } from '@/utils/image';
import {
  DURATIONS,
  THEMES,
  THEME_SLUGS,
  ThemeSlug,
  formatDays,
  parseDays,
} from '@/utils/itinerary-config';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 604800; // 7 days
export const dynamicParams = true;

/** Resolves category IDs for a theme slug. Falls back to [] if fetch fails. */
async function resolveCategoryIds(theme: ThemeSlug): Promise<number[]> {
  try {
    const categories = await fetchAllCategories();
    const names = new Set(THEMES[theme].categoryNames);
    return categories.filter((c) => names.has(c.name)).map((c) => c.id);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const cities = await fetchAllCities();
    return cities.flatMap((c) =>
      DURATIONS.flatMap((d) =>
        THEME_SLUGS.map((t) => ({ cityId: c.name, days: formatDays(d), theme: t })),
      ),
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { cityId: string; days: string; theme: string };
}): Promise<Metadata> {
  const days = parseDays(params.days);
  const themeConfig = THEMES[params.theme as ThemeSlug];
  if (!days || !themeConfig) return { title: 'Itinerary' };
  try {
    const categoryIds = await resolveCategoryIds(params.theme as ThemeSlug);
    const plan = await fetchSampleItinerary(params.cityId, days, categoryIds);
    const cityTitle = plan.city.title;
    const title = `${days}-Day ${cityTitle} ${themeConfig.label} Itinerary`;
    const description = `Planning a ${days}-day trip to ${cityTitle}? Explore our day-by-day ${themeConfig.label.toLowerCase()} itinerary with top-rated activities.`;
    const ogImage = getPictureUrl(plan.schedules[0]?.activities[0]?.pictures[0]);
    return {
      title,
      description,
      alternates: {
        canonical: `/cities/${params.cityId}/itinerary/${params.days}/${params.theme}`,
      },
      openGraph: {
        title: `${title} — Joorney`,
        description,
        images: ogImage ? [{ url: ogImage }] : [],
      },
      twitter: { card: 'summary_large_image' },
    };
  } catch {
    return { title: 'Itinerary' };
  }
}

export default async function ThemedItineraryPage({
  params,
}: {
  params: { cityId: string; days: string; theme: string };
}) {
  const days = parseDays(params.days);
  const themeConfig = THEMES[params.theme as ThemeSlug];
  if (!days || !themeConfig) notFound();

  const categoryIds = await resolveCategoryIds(params.theme as ThemeSlug);

  let plan;
  try {
    plan = await fetchSampleItinerary(params.cityId, days, categoryIds);
  } catch {
    notFound();
  }
  if (!plan.schedules.length) notFound();

  const cityTitle = plan.city.title;
  const title = `${days}-Day ${cityTitle} ${themeConfig.label} Itinerary`;
  const canonicalUrl = `https://joorney.com/cities/${params.cityId}/itinerary/${params.days}/${params.theme}`;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    url: canonicalUrl,
    itemListElement: plan.schedules.map((s) => ({
      '@type': 'ListItem',
      position: s.day,
      name: `Day ${s.day}: ${s.activities.map((a) => a.title).join(', ')}`,
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Joorney', item: 'https://joorney.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${cityTitle} Activities`,
        item: `https://joorney.com/cities/${params.cityId}/activities`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${days}-Day ${cityTitle} Itinerary`,
        item: `https://joorney.com/cities/${params.cityId}/itinerary/${params.days}`,
      },
      { '@type': 'ListItem', position: 4, name: title },
    ],
  };

  const otherThemes = THEME_SLUGS.filter((s) => s !== params.theme);
  const otherDurations = DURATIONS.filter((d) => d !== days);

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 16 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Planning a {days}-day trip to {cityTitle}? Here&apos;s a{' '}
        {themeConfig.label.toLowerCase()} day-by-day itinerary with the best activities,
        geographically optimised to minimise travel time.
      </Typography>

      {plan.schedules.map((schedule) => (
        <Box key={schedule.day} component="section" sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Day {schedule.day}
          </Typography>
          <ItineraryTimeline activities={schedule.activities} cityId={params.cityId} />
        </Box>
      ))}

      <Divider sx={{ my: 4 }} />

      {/* Related itineraries */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          More {cityTitle} itineraries
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          <Link href={`/cities/${params.cityId}/itinerary/${params.days}`}>
            {days}-Day {cityTitle} Itinerary (all)
          </Link>
          {otherThemes.map((slug) => (
            <Link
              key={slug}
              href={`/cities/${params.cityId}/itinerary/${params.days}/${slug}`}
            >
              {days}-Day {cityTitle} {THEMES[slug].label} Itinerary
            </Link>
          ))}
          {otherDurations.map((d) => (
            <Link
              key={d}
              href={`/cities/${params.cityId}/itinerary/${formatDays(d)}/${params.theme}`}
            >
              {d}-Day {cityTitle} {themeConfig.label} Itinerary
            </Link>
          ))}
        </Stack>
      </Box>

      <AuthCTA />
    </Container>
  );
}
