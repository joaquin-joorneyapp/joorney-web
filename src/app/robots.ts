import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: [
        '/home',
        '/plans',
        '/saved-plans',
        '/explore',
        '/starred',
        '/tasks',
        '/cities/*/activities/*/edit',
        '/cities/*/activities/create',
        '/cities/*/activities/manage',
        '/cities/*/new-plan',
      ],
    },
    sitemap: 'https://joorney.com/sitemap.xml',
  };
}
