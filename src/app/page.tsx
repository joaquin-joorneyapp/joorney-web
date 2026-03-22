import type { Metadata } from 'next';
import FeaturedDestinations from './featured-destinations';
import LandingPageClient from './landing-client';

export const metadata: Metadata = {
  title: 'Plan your next trip',
  description:
    'Joorney helps you discover the best activities in any city and build a personalised travel itinerary in minutes.',
  openGraph: {
    title: 'Plan your next trip — Joorney',
    description:
      'Joorney helps you discover the best activities in any city and build a personalised travel itinerary in minutes.',
    images: [{ url: '/og-default.png' }],
  },
};

export default function Page() {
  return (
    <>
      <LandingPageClient />
      <FeaturedDestinations />
    </>
  );
}
