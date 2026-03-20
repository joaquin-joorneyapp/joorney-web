# Explore Nearby Activities — Web Page Design

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

A new `/explore` page for the joorney web app that lets users discover nearby activities. The layout mirrors the mobile explore screen but is adapted for web with a side-by-side list + map layout.

---

## Route & Files

- **New page:** `src/app/(logged)/explore/page.tsx`
- **New component:** `src/components/explore/ActivityCard.tsx`
- **Modified:** `src/app/(logged)/navbar.tsx` — add "Explore" nav link

---

## Layout

### Top bar (full width)
- Persistent search input always visible below the navbar
- Filters the activity list by name in real-time (client-side, no API call)
- Styled consistent with other inputs in the app (MUI TextField or styled Box)

### Category pills (full width)
- Horizontally scrollable row of category filter pills
- "All" pill selected by default (coral `#F67D56` background)
- Inactive pills use `#F2F2F7` background
- Fetched from existing `getCategories()` fetch function
- Selecting a category re-fetches activities with the updated filter
- Consistent with the category picker pattern used in the new-plan flow

### Main content — two-panel split
- **Left panel (55%):** scrollable, contains "Nearby Activities" header + result count + 2-column MUI Grid of `ActivityCard` components
- **Right panel (45%):** sticky Mapbox map (full viewport height minus header), numbered circular markers per activity using brand color `#F67D56`

---

## ActivityCard Component

Props: `activity: ActivityWithDistance`

Displays:
- Activity image (from GCS bucket via `buildImageUrl`, fallback placeholder)
- Activity title (bold)
- Category (secondary text)
- Distance (km) with navigation icon
- Duration with pin icon
- Rating + review count in coral

On click: navigates to `/cities/[cityId]/activities/[activityId]`

---

## Data Flow

1. On mount: request browser geolocation via `useGeolocation` hook; fall back to Paris (`48.8566, 2.3522`) if denied
2. Fetch categories: `getCategories()` on mount
3. Fetch activities: `getClosestActivities(lat, lng, selectedCategories)` — re-fetches when location or selected categories change
4. Search: client-side filter on `activity.title` using the search query string
5. Map markers: derived from the filtered activity list, numbered 1–N

---

## Loading & Error States

- **Category pills:** skeleton loader (animated pulse, consistent with existing `CategoriesSkeleton` pattern)
- **Activity grid:** skeleton cards (2-column grid of placeholder cards)
- **Error:** Alert with retry button, same pattern as other pages

---

## Navbar

Add "Explore" as a top-level link in `src/app/(logged)/navbar.tsx`, pointing to `/explore`. Highlight active state when on the explore route.

---

## Tech Stack Notes

- Styling: MUI `sx` prop with Emotion (no Tailwind)
- Maps: Mapbox GL via `react-map-gl` (already used in `LocationMap` and `RouteMap` components)
- Data fetching: React Query via existing fetch functions in `src/fetchs/`
- Types: reuse `ActivityWithDistance` and `Category` from existing types
- Colors: primary `#F67D56`, background `#F2F2F7`, border `#E5E5EA`
- Font: Product Sans for headings, Roboto for body

---

## Out of Scope

- Activity detail page (already exists)
- Creating or editing activities
- Mobile-specific changes (handled in joorney-mobile)
