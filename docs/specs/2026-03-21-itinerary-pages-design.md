# City Itinerary Pages — Design Spec

## Goal

Add public, server-rendered itinerary pages targeting high-volume keywords like "paris itinerary 3 days" and "paris art itinerary 3 days". Pages are generated via the existing plan engine and cached with ISR.

## Architecture

Next.js ISR server components under the existing `(public)` route group. Two new dynamic routes share a config module and a timeline component. The plan engine (`POST /plans/initial`) is called at render time; ISR caches the result for 7 days.

**Tech stack:** Next.js App Router, ISR, MUI, `next/image`

---

## URLs

```
/cities/[cityId]/itinerary/[days]           — general
/cities/[cityId]/itinerary/[days]/[theme]   — themed
```

`[days]` is a slug: `3-days`, `5-days`, `7-days`.
`[theme]` is one of: `art`, `outdoor`, `food`, `history`.

**Examples:**
- `/cities/paris/itinerary/3-days` → "3-Day Paris Itinerary"
- `/cities/paris/itinerary/5-days/art` → "5-Day Paris Art & Culture Itinerary"

---

## Supported Combinations

**Durations:** 3, 5, 7 days

**Themes:**

| Slug | Label | Category `name` values (verified against category_seeder.ts) |
|------|-------|--------------------------------------------------------------|
| *(general)* | *(all)* | `[]` — send empty array to plan engine (uses all categories) |
| `art` | Art & Culture | `museum`, `art_gallery` |
| `outdoor` | Outdoor | `park`, `natural_feature` |
| `food` | Food & Drink | `restaurant`, `food`, `cafe`, `bar` |
| `history` | History | `church`, `place_of_worship` |

**Important:** The table lists category `name` values used to look up IDs from `GET /categories`. The plan engine receives **numeric IDs**, not name strings. If `fetchAllCategories()` returns no matches for a theme's names (e.g. categories were renamed), the page falls back to `categoryIds = []` (general plan) rather than erroring.

**Scale at launch (3 cities):** 3 × 3 × 5 = 45 pages. Grows automatically with each new city.

---

## New Files

| File | Purpose |
|------|---------|
| `src/utils/itinerary-config.ts` | Durations array, theme config (slug → label + category names), slug↔number helpers |
| `src/fetchs/server/plan.ts` | `fetchSampleItinerary(citySlug, days, categoryIds)` — POST /plans/initial |
| `src/fetchs/server/category.ts` | `fetchAllCategories()` — GET /categories. Reuses `Category` type from `src/types/fetchs/responses/category.ts` |
| `src/components/ItineraryTimeline.tsx` | Timeline UI: numbered rows with photo, name, description, duration, address |
| `src/app/(public)/cities/[cityId]/itinerary/[days]/page.tsx` | General itinerary page |
| `src/app/(public)/cities/[cityId]/itinerary/[days]/[theme]/page.tsx` | Themed itinerary page |

---

## Page Structure

1. **H1** — `"{N}-Day {City} Itinerary"` or `"{N}-Day {City} {Theme Label} Itinerary"`
2. **Intro** — static sentence: `"Planning a {N}-day trip to {City}? Here's a day-by-day itinerary with the best activities, geographically optimised to minimise travel time."`
3. **Day sections** — one `<section>` per day
   - H2: `"Day {n}"`
   - `<ItineraryTimeline>` with that day's activities
4. **Related itineraries** — links to other durations and themes for the same city
5. **AuthCTA** — existing sticky sign-in banner

### ItineraryTimeline activity row
Each activity shows:
- Numbered circle
- Photo (`next/image`, 80×64, lazy)
- Name as a link to `/cities/[cityId]/activities/[activity.name]` — uses the **slug** (`activity.name`), not the numeric `activity.id`
- Description excerpt (100 chars via existing `trimDescription`)
- Duration in minutes + address as metadata

---

## Data Flow

1. Parse `[days]` slug → number (`"3-days"` → `3`). If unrecognised, call `notFound()`.
2. General pages: pass `categoryIds = []` to plan engine.
3. Themed pages: `fetchAllCategories()` → filter to theme's category names → extract IDs. If fetch fails, fall back to `[]`.
4. `fetchSampleItinerary(citySlug, days, categoryIds)` → `POST /plans/initial`.
5. If `fetchSampleItinerary` throws or returns no schedules, call `notFound()`.
6. Render from `plan.schedules[].activities`.

---

## Metadata & SEO

**Title:** `"{N}-Day {City} Itinerary"` (or with theme label)
**Description:** `"Planning a {N}-day trip to {City}? Explore our day-by-day {theme} itinerary with top-rated activities."`
**Canonical:** `/cities/{cityId}/itinerary/{days}` (or `/{days}/{theme}`)
**OG image:** `getPictureUrl(plan.schedules[0]?.activities[0]?.pictures[0])` — guarded: `ogImage ? [{ url: ogImage }] : []`
**Twitter card:** `summary_large_image`

**JSON-LD (two blocks):**
- `ItemList` — one `ListItem` per day, each naming the day and its activities
- `BreadcrumbList` — Joorney → {City} Activities (`/cities/{cityId}/activities`) → {N}-Day Itinerary

---

## ISR

```ts
export const revalidate = 604800   // 7 days
export const dynamicParams = true
```

`generateStaticParams` pre-builds all combinations at deploy time. On-demand ISR handles any new city added after deployment.

**`generateStaticParams` shapes:**

General page — returns `{ cityId: string, days: string }[]`:
```ts
// try/catch around fetchAllCities — returns [] on failure
cities.flatMap(c => DURATIONS.map(d => ({ cityId: c.name, days: `${d}-days` })))
```

Themed page — returns `{ cityId: string, days: string, theme: string }[]`:
```ts
cities.flatMap(c =>
  DURATIONS.flatMap(d =>
    THEME_SLUGS.map(t => ({ cityId: c.name, days: `${d}-days`, theme: t }))
  )
)
```

**Note on revalidation skew:** Itinerary pages revalidate every 7 days; `sitemap.ts` revalidates every hour. A new city's itinerary URLs will appear in the sitemap within an hour but the pages will only be built on first request. This is intentional and acceptable.

---

## Sitemap

`sitemap.ts` already loops cities. Extend it to also emit itinerary URLs within the existing cities loop:
- one entry per city × duration (general)
- one entry per city × duration × theme (themed)

Priority: `0.85` (between city listing `0.8` and activity detail `0.9`)
`changeFrequency: 'weekly'`

---

## robots.txt

No changes needed — itinerary pages are public and not disallowed.

---

## Out of Scope

- Map view on itinerary pages (existing `DisplayPlan` map is client-heavy; not needed for SEO)
- User-customisable itinerary from this page (AuthCTA handles the conversion)
- Itinerary pages for durations other than 3, 5, 7
