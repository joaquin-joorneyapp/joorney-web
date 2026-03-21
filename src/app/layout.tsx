import GoogleAnalytics from '@/components/GoogleAnalytics';
import type { Metadata } from 'next';
import * as React from 'react';
import Providers from './providers';

export const metadata: Metadata = {
  title: { template: '%s — Joorney', default: 'Joorney' },
  description:
    'Discover cities, explore activities, and generate personalised multi-day travel plans.',
  metadataBase: new URL('https://joorney.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
