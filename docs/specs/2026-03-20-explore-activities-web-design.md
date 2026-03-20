# Explore Nearby Activities — Web Page Design

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

A new `/explore` page for the joorney web app that lets users discover nearby activities. The layout mirrors the mobile explore screen but is adapted for web with a side-by-side list + map layout.

---

## Route & Files

- **New page:** `src/app/(logged)/explore/page.tsx` — must include `'use client'` directive (uses geolocation and React Query hooks)
- **New component:** `src/components/explore/ActivityCard.tsx`
- **Modified:** `src/app/(logged)/navbar.tsx` — add "Explore" nav link (link only, no active-state styling)

---

## Layout

### Top bar (full width)
- Persistent search input always visible below the navbar
- Filters the activity list by name in real-time (client-side, no API call)
- Styled consistent with other inputs in the app (MUI TextField or styled Box)

### Category pills (full width)
- Horizontally scrollable row of category filter pills
- Default selected state: `selectedCategoryId = null` (meaning "All")
- "All" pill: shown first, active when `selectedCategoryId === null`, coral `#F67D56` background
- Category pills: active when `selectedCategoryId === category.id`, coral `#F67D56` background; inactive pills use `#F2F2F7` background
- Single-select: clicking a category sets `selectedCategoryId` to that category's ID; clicking "All" sets it back to `null`
- Pill labels use `category.title`
- Fetched from existing `getCategories()` (`@/fetchs/category`)
- Loading state: inline `<Skeleton>` elements in a row, consistent with the pattern in `CategoryPicker.tsx`

### Main content — two-panel split
- **Left panel (55%):** scrollable, contains "Nearby Activities" header + result count + 2-column MUI Grid of `ActivityCard` components
- **Right panel (45%):** sticky Mapbox map with `height: calc(100vh - 90px)`, numbered circular markers per activity using brand color `#F67D56`

---

## ActivityCard Component

**File:** `src/components/explore/ActivityCard.tsx`
**Props:** `activity: ActivityWithDistance` (imported from `@/fetchs/activity`)

Does not need its own `'use client'` directive — it is a pure render component with no hooks or browser APIs; the parent page being a client component is sufficient.

Displays:
- Activity image: `activity.pictures[0]?.url ? buildImageUrl(activity.pictures[0].url) : null`; if `null`, render a grey placeholder `Box` at the same height (consistent with `NearbyActivityCard.tsx`)
- Activity title (`activity.title`, bold)
- Category labels (`activity.categories.map(c => c.title).join(', ')`, secondary text)
- Distance (`activity.distance.toFixed(1) km`) with navigation icon
- Duration (`activity.duration` — always present, `ActivityBase.duration: number` is non-optional)

On click: navigates to `/cities/${activity.city.name}/activities/${activity.name}` — the detail page file is `cities/[cityId]/activities/[activityId]/page.tsx`; the params are named `cityId`/`activityId` in the folder structure but treated as name slugs by the page (`const { cityId: cityName, activityId: activityName } = useParams()`)

---

## Data Flow

1. On mount: request browser geolocation via `useGeolocation` hook (`@/hooks/useGeolocation`), which returns `{ lat, lng, loading, error }`
2. Paris fallback: derive effective coords before calling the fetch:
   ```ts
   const effectiveLat = lat ?? (loading ? null : 48.8566);
   const effectiveLng = lng ?? (loading ? null : 2.3522);
   ```
   This ensures the fallback is only applied after geolocation has finished (not while still loading).
3. Fetch categories: `getCategories()` — call unconditionally at component top level (React Query hook)
4. Fetch activities: `getClosestActivities(effectiveLat, effectiveLng, 50)` — call unconditionally at component top level (React Query hook). The `enabled: !!lat && !!lng` guard is built into the function itself, so it will not fire until both values are non-null. Do NOT wrap this call in a `useEffect` or condition.
5. Category filter: client-side — when `selectedCategoryId !== null`, keep only activities where `activity.categories.some(c => c.id === selectedCategoryId)`
6. Search filter: client-side — keep only activities where `activity.title.toLowerCase().includes(searchQuery.toLowerCase())`
7. Both filters compose (category AND search applied together)
8. Map markers: derived from the filtered activity list, numbered 1–N

---

## Loading & Error States

- **Category pills:** inline `<Skeleton>` elements in a row while `getCategories` is loading
- **Activity grid:** 2-column grid of `<Skeleton>` placeholder cards (same height as a real card) while `getClosestActivities` is loading
- **Error:** MUI `<Alert severity="error">` with a retry button, same pattern as other pages

---

## Navbar

Add "Explore" as a top-level link in `src/app/(logged)/navbar.tsx`, pointing to `/explore`. No active-state styling (the navbar does not currently implement active-state logic).

---

## Tech Stack Notes

- **Client directive:** `'use client'` required on `page.tsx` only (uses hooks and browser APIs); `ActivityCard` does not need it
- **Styling:** MUI `sx` prop with Emotion (no Tailwind)
- **Maps:** Mapbox GL via `react-map-gl` — use the same hardcoded access token as in `src/components/maps/LocationMap.tsx`; map style `mapbox://styles/mapbox/streets-v9`
- **Data fetching:** React Query via `@/fetchs/activity` and `@/fetchs/category`
- **Types:**
  - `ActivityWithDistance` — from `@/fetchs/activity`
  - `Category` — from `@/types/fetchs/responses/category`
- **Image utility:** `buildImageUrl` — from `@/utils/image`
- **Colors:** primary `#F67D56`, background `#F2F2F7`, border `#E5E5EA`
- **Font:** Product Sans for headings, Roboto for body

---

## Out of Scope

- Rating and review count (not present in current `ActivityBase` type)
- Activity detail page (already exists)
- Creating or editing activities
- Mobile-specific changes (handled in joorney-mobile)
