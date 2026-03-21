# SEO — Public Activity Pages Design

## Goal

Make activity listing and activity detail pages publicly accessible and indexable by search engines, leveraging Next.js App Router's static generation capabilities to maximise SEO value.

## Background

Joorney is a travel planning app. All content pages (cities, activities, plans) are currently behind authentication (`(logged)` route group), making them invisible to search engines. The user chose Next.js specifically for SEO. This spec covers making the two highest-value content pages public.

---

## Scope

**In scope:**
- `/cities/[cityId]/activities` — activity listing for a city (new consumer-facing UI)
- `/cities/[cityId]/activities/[activityId]` — activity detail page
- `robots.ts` and `sitemap.ts`
- Root layout and landing page metadata
- Auth-aware CTA for unauthenticated visitors
- Root layout providers refactor (prerequisite for metadata)
- Moving `Navbar` to a shared location (prerequisite for public layout)

**Out of scope:**
- `/cities` (admin page — remains protected)
- `/plans/[planId]` (not in this iteration)
- Any write operations (create, edit) — remain fully protected
- `loading.tsx` files for the public route group (ISR pages serve pre-built HTML; loading UI is not required)

**Admin activity table:** `(logged)/cities/[cityId]/activities/page.tsx` is an admin data-management table that must not be deleted — it must be **renamed** to a new protected URL to avoid conflicting with the new public page at the same path. The admin table moves to `(logged)/cities/[cityId]/activities/manage/page.tsx` (URL: `/cities/[cityId]/activities/manage`).

The admin route uses **numeric city IDs** (not slugs). The cities admin page (`(logged)/cities/page.tsx`) links via `router.push('/cities/${city.id}/activities')` using `city.id` (a number). This must be updated to `router.push('/cities/${city.id}/activities/manage')`. Do NOT change `city.id` to `city.name` — the admin activities page uses `parseInt(params.cityId)` internally and the admin data fetching depends on the numeric ID.

The public activity routes use name slugs (`city.name`). The two URL spaces are distinct and do not conflict:
- `/cities/42/activities/manage` → admin table (numeric ID, protected)
- `/cities/paris/activities` → public consumer page (slug, public)

**Backend prerequisite:** `GET /cities/:id/activities` currently requires authentication (`authAxios`). This endpoint must be made publicly accessible before the activity list page can be statically generated. `GET /activities/:id` already uses `anonymousAxios` and requires no backend change.

---

## Architecture

### Root Layout Refactor (prerequisite for metadata)

`src/app/layout.tsx` is currently marked `'use client'`, which causes Next.js to silently ignore any `metadata` export. The same applies to `src/app/page.tsx`. Both must become server components.

**Pattern:** extract all client-side providers into `src/app/providers.tsx`, then make `layout.tsx` a pure server component shell.

**`src/app/providers.tsx`** (new, `'use client'`):
```tsx
'use client';
// Contains: QueryClientProvider, AuthUserContext.Provider,
//           GoogleOAuthProvider, Emotion CacheProvider, ThemeProvider,
//           Global CSS (<Global styles={GlobalStyles} />)
//
// QueryClient MUST be stabilised with useState to prevent recreation on every render:
// const [queryClient] = useState(() => new QueryClient({ ... }));
```

**`src/app/layout.tsx`** (becomes server component — no `'use client'`):
```tsx
export const metadata: Metadata = { ... };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />  {/* stays in <head>, outside <body> */}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

`GoogleAnalytics` remains in `<head>` (outside `<body>`) to preserve the current HTML structure. `AuthUserContext.Provider` stays inside `Providers`, so `AuthCTA` continues to consume it unchanged.

### Navbar Move (prerequisite for public layout)

`src/app/(logged)/navbar.tsx` is currently co-located with the `(logged)` route group. Since it will be consumed by both `(logged)/layout.tsx` and `(public)/layout.tsx`, it must first be moved to shared infrastructure:

- **Move:** `src/app/(logged)/navbar.tsx` → `src/components/Navbar.tsx`
- Update the import in `(logged)/layout.tsx`

### Route Group Restructuring

A new `(public)` route group is added alongside the existing `(anonymous)` and `(logged)` groups. Route groups are transparent to URLs, so there are no conflicts.

```
src/app/
  (public)/
    layout.tsx                              ← imports Navbar from src/components/Navbar.tsx, no auth guard
    cities/
      [cityId]/
        activities/
          page.tsx                          ← activity list (server component, ISR)
          [activityId]/
            page.tsx                        ← activity detail (server component, ISR)

  (logged)/                                 ← unchanged except deletions below
    cities/
      [cityId]/
        activities/
          [activityId]/
            edit/
              page.tsx                      ← stays protected
          create/
            page.tsx                        ← stays protected
        new-plan/
          page.tsx                          ← stays protected
```

The two pages that previously lived in `(logged)/cities/[cityId]/activities/` are deleted and replaced by the new server components in `(public)`.

### Public Layout

`(public)/layout.tsx` imports `<Navbar />` from `src/components/Navbar.tsx` (the Navbar already handles unauthenticated users gracefully) and renders it with no auth redirect guard.

---

## URL Slug Model

The dynamic segments `[cityId]` and `[activityId]` in this codebase are **name slugs** (strings), not numeric IDs, despite the parameter names. For example:
- `params.cityId` → `"paris"` (string slug)
- `params.activityId` → `"eiffel-tower"` (string slug)

`generateStaticParams` must return slug strings. Note: the existing `getActivities(cityId: number)` function accepts a numeric ID — the new server-side fetch functions (see below) accept string slugs and call the endpoint accordingly.

---

## Server-Side Fetch Functions

The existing fetch utilities in `src/fetchs/` are React Query hooks (`useQuery` wrappers). They **cannot be called from Server Components or `generateStaticParams`** — hooks are only valid inside React render contexts.

New plain async functions must be created at `src/fetchs/server/` for server-side use only.

**Important — do NOT import `anonymousAxios` from `src/configs/axios.ts` in these files.** That module also exports `authAxios`, which references `localStorage` and `window` at module evaluation time. Importing the module in a Server Component or `generateStaticParams` will throw `ReferenceError: localStorage is not defined` during the Next.js build.

Instead, use the native Node.js `fetch` API directly:

```ts
// src/fetchs/server/city.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchAllCities(): Promise<City[]> {
  const res = await fetch(`${API_URL}/cities`);
  if (!res.ok) throw new Error(`fetchAllCities: ${res.status}`);
  return res.json();
}

// src/fetchs/server/activity.ts
export async function fetchCityActivities(citySlug: string): Promise<Activity[]> {
  const res = await fetch(`${API_URL}/cities/${citySlug}/activities`);
  if (!res.ok) throw new Error(`fetchCityActivities: ${res.status}`);
  return res.json();
}

export async function fetchActivity(citySlug: string, activitySlug: string): Promise<Activity | null> {
  const res = await fetch(`${API_URL}/cities/${citySlug}/activities/${activitySlug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchActivity: ${res.status}`);
  return res.json();
}
```

These are used in `generateStaticParams`, `generateMetadata`, and the page body for both public pages.

---

## Data Fetching: ISR

Both public pages are React Server Components using Incremental Static Regeneration:

```ts
export const revalidate = 3600; // regenerate at most once per hour
export const dynamicParams = true; // serve unknown slugs via SSR (not 404 at build time)
```

`dynamicParams = true` means if a new activity is added after the last build, the first request for it triggers a server render and caches the result. This is preferred over `dynamicParams = false` (which would 404 on any slug not present at build time).

**`generateStaticParams`:**

Both functions must handle API failures gracefully so a backend outage at build time does not fail the entire build. Wrap each per-city fetch in try/catch and return an empty array on error — `dynamicParams = true` means pages will still be served on-demand via SSR.

```ts
// Activity list page
export async function generateStaticParams() {
  try {
    const cities = await fetchAllCities();
    return cities.map((c) => ({ cityId: c.name }));
  } catch {
    return []; // build continues; pages served on-demand
  }
}

// Activity detail page
export async function generateStaticParams() {
  try {
    const cities = await fetchAllCities();
    const pairs = await Promise.all(
      cities.map(async (c) => {
        try {
          const activities = await fetchCityActivities(c.name);
          return activities.map((a) => ({ cityId: c.name, activityId: a.name }));
        } catch {
          return []; // skip this city on error
        }
      })
    );
    return pairs.flat();
  } catch {
    return [];
  }
}
```

**Error handling:** if `fetchActivity` or `fetchCityActivities` returns no data (deleted or invalid slug), call Next.js `notFound()` to render a 404 response. Do not render an empty page.

```ts
const activity = await fetchActivity(params.cityId, params.activityId);
if (!activity) notFound();
```

---

## Public Activity List Page

**Important:** the existing `(logged)/cities/[cityId]/activities/page.tsx` is an **admin data-management table** (edit buttons, columns for lat/lon/duration). The new `(public)` activity list page is a **fresh implementation** — a consumer-facing card/grid layout showing activity images, names, and descriptions. It must not replicate the admin table UI.

The new page renders:
- City name as the page heading
- A grid of activity cards (image, name, short description, duration)
- `<AuthCTA />` for unauthenticated users

---

## Auth-aware UI

A `<AuthCTA />` client component is created at `src/components/AuthCTA.tsx`. It reads `AuthUserContext` and:

- **Unauthenticated:** renders a fixed bottom banner — *"Sign in to save activities and build your travel plan"* with a Sign In button linking to `/login`
- **Authenticated:** renders nothing

Included in both public page components.

---

## Metadata

### Root layout (`src/app/layout.tsx`)

```ts
export const metadata: Metadata = {
  title: { template: '%s — Joorney', default: 'Joorney' },
  description: 'Discover cities, explore activities, and generate personalised multi-day travel plans.',
  metadataBase: new URL('https://joorney.com'),
};
```

### Landing page (`src/app/page.tsx`)

`src/app/page.tsx` uses `useRouter`, `useContext`, `useEffect`, `useState`, and `useEmblaCarousel` — all client-only hooks. Removing `'use client'` from the file will cause a build error.

**Pattern:** same providers extraction approach as `layout.tsx`. Convert `page.tsx` to a server component shell that exports `metadata` and renders a `<LandingPageClient />` inner component:

- `src/app/page.tsx` — server component, exports `metadata`, renders `<LandingPageClient />`
- `src/app/landing-client.tsx` — `'use client'`, contains all existing hooks and JSX from the current `page.tsx`

```ts
// src/app/page.tsx (server component)
export const metadata: Metadata = {
  title: 'Plan your next trip',
  description: 'Joorney helps you discover the best activities in any city and build a personalised travel itinerary in minutes.',
  openGraph: {
    title: 'Plan your next trip — Joorney',
    description: 'Joorney helps you discover the best activities in any city and build a personalised travel itinerary in minutes.',
    images: [{ url: '/og-default.png' }],
  },
};
export default function Page() { return <LandingPageClient />; }
```

### Activity list (`generateMetadata`)

```ts
title: `Activities in ${city.name}`,
description: `Explore activities in ${city.name}, ${city.country}.`,
openGraph: {
  title: `Activities in ${city.name} — Joorney`,
  // Use buildImageUrl() to resolve the GCS path to an absolute URL:
  images: [{ url: buildImageUrl(city.pictures[0]?.url) }],
}
```

Note: the activity count is intentionally omitted from the description to avoid stale metadata between ISR revalidations.

### Activity detail (`generateMetadata`)

```ts
title: activity.name,
// Trim at word boundary and append ellipsis if truncated:
description: trimDescription(activity.description, 160),
openGraph: {
  title: `${activity.name} in ${city.name}`,
  // Use buildImageUrl() to resolve the GCS path to an absolute URL:
  images: [{ url: buildImageUrl(activity.pictures[0]?.url) }],
  type: 'article',
},
twitter: {
  card: 'summary_large_image',
}
```

`trimDescription` is a small helper (in `src/utils/`) that trims at the last word boundary before the character limit and appends `…`.

---

## Structured Data (JSON-LD)

Activity detail pages include a `<script type="application/ld+json">` rendered by the server component:

```json
{
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "name": "{activity.name}",
  "description": "{activity.description}",
  "address": "{activity.address}",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{activity.latitude}",
    "longitude": "{activity.longitude}"
  },
  "image": "{buildImageUrl(activity.pictures[0]?.url)}",
  "containedInPlace": {
    "@type": "City",
    "name": "{city.name}",
    "containedInPlace": {
      "@type": "Country",
      "name": "{city.country}"
    }
  }
}
```

The `geo` block is rendered conditionally — only when both `latitude` and `longitude` are non-zero. The `image` field uses `buildImageUrl()` to produce an absolute URL.

---

## Technical SEO Foundations

### `src/app/robots.ts`

Allow everything by default; disallow only protected routes:

```ts
Disallow: /home
Disallow: /plans
Disallow: /saved-plans
Disallow: /explore
Disallow: /cities/*/activities/*/edit
Disallow: /cities/*/activities/create
Disallow: /cities/*/new-plan
Disallow: /starred
Disallow: /tasks
Sitemap: https://joorney.com/sitemap.xml
```

### `src/app/sitemap.ts`

Dynamic sitemap using the same server-side fetch functions. Uses `revalidate = 3600` to stay in sync with ISR page revalidation (prevents sitemap drift):

```ts
export const revalidate = 3600;
```

| URL | changeFrequency | priority |
|-----|----------------|----------|
| `/` | `monthly` | `1.0` |
| `/cities/{slug}/activities` | `weekly` | `0.8` |
| `/cities/{slug}/activities/{slug}` | `weekly` | `0.9` |

---

## File Map

| Action | File | What changes |
|--------|------|--------------|
| Move | `src/app/(logged)/navbar.tsx` → `src/components/Navbar.tsx` | Shared between `(logged)` and `(public)` layouts |
| Modify | `src/app/(logged)/layout.tsx` | Update Navbar import path |
| Modify | `src/app/layout.tsx` | Remove `'use client'`, add root Metadata export, render `<Providers>`, keep `<GoogleAnalytics />` in `<head>` |
| Create | `src/app/providers.tsx` | `'use client'` — all existing client providers; stabilise QueryClient with `useState` |
| Modify | `src/app/page.tsx` | Remove `'use client'`, add landing page Metadata export, render `<LandingPageClient />` |
| Create | `src/app/landing-client.tsx` | `'use client'` — all existing hooks and JSX from current `page.tsx` |
| Create | `src/app/(public)/layout.tsx` | Public layout — imports shared `<Navbar />`, no auth redirect |
| Create | `src/app/(public)/cities/[cityId]/activities/page.tsx` | Consumer-facing activity list — server component, ISR, `generateMetadata`, `generateStaticParams` |
| Create | `src/app/(public)/cities/[cityId]/activities/[activityId]/page.tsx` | Activity detail — server component, ISR, `generateMetadata`, `generateStaticParams`, JSON-LD |
| Create | `src/fetchs/server/city.ts` | Plain async `fetchAllCities()` for server-side use |
| Create | `src/fetchs/server/activity.ts` | Plain async `fetchCityActivities()` and `fetchActivity()` for server-side use |
| Create | `src/components/AuthCTA.tsx` | Auth-aware sticky CTA banner |
| Create | `src/utils/trimDescription.ts` | Word-boundary description trimmer |
| Create | `src/app/robots.ts` | Crawl directives |
| Create | `src/app/sitemap.ts` | Dynamic sitemap with revalidation |
| Rename | `src/app/(logged)/cities/[cityId]/activities/page.tsx` → `src/app/(logged)/cities/[cityId]/activities/manage/page.tsx` | Admin table moves to `/cities/[cityId]/activities/manage`; update `router.push` in `(logged)/cities/page.tsx` to append `/manage` (keep numeric `city.id`) |
| Delete | `src/app/(logged)/cities/[cityId]/activities/[activityId]/page.tsx` | Replaced by public version |

---

## Out of Scope / Future Work

- Canonical URL handling for paginated activity lists
- `og:locale` and `hreflang` for future internationalisation
- Plan pages (`/plans/[planId]`) as shareable/indexable links
- Performance budget / Core Web Vitals monitoring
- `loading.tsx` for public routes
