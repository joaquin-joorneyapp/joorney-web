# Explore Nearby Activities — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/explore` page to joorney-web showing a side-by-side 2-column activity grid and sticky Mapbox map, with persistent search and category filter pills.

**Architecture:** A single `'use client'` page fetches geolocation + activities + categories via React Query hooks, applies client-side search and category filters, and renders a two-panel MUI Box layout. The `ActivityCard` component is a pure render component reused in the grid.

**Tech Stack:** Next.js 14 App Router, MUI + Emotion (`sx` prop), React Query (via `@/fetchs/`), `react-map-gl` (Mapbox), `useGeolocation` hook.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/app/(logged)/navbar.tsx` | Add "Explore" nav link |
| Create | `src/components/explore/ActivityCard.tsx` | Pure card component: image, title, categories, distance, duration |
| Create | `src/app/(logged)/explore/page.tsx` | Full page: search, category pills, activity grid, Mapbox map |

---

## Task 1: Add "Explore" to the navbar

**Files:**
- Modify: `src/app/(logged)/navbar.tsx`

**Context:** The navbar has a `pages` array near the top. Each entry is `{ name, href }`. Add Explore before "New Plan".

- [ ] **Step 1: Open the file and locate the `pages` array**

```bash
# lines 20-32 of src/app/(logged)/navbar.tsx
```

- [ ] **Step 2: Add the Explore entry**

Find the single line:
```ts
  { name: 'New Plan', href: '/new-plan' },
```

Replace it with:
```ts
  { name: 'Explore', href: '/explore' },
  { name: 'New Plan', href: '/new-plan' },
```

(Only change these two lines — leave all other entries in the `pages` array untouched.)

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /path/to/joorney-web && npm run lint
```
Expected: no errors related to navbar.tsx

- [ ] **Step 4: Commit**

```bash
git add src/app/\(logged\)/navbar.tsx
git commit -m "feat: add Explore link to navbar"
```

---

## Task 2: Create the ActivityCard component

**Files:**
- Create: `src/components/explore/ActivityCard.tsx`

**Context:** Modelled after `src/components/home/NearbyActivityCard.tsx` but taller image, shows distance + duration, and navigates to the activity detail page on click. No `'use client'` needed — pure render component.

- [ ] **Step 1: Create the file**

```tsx
// src/components/explore/ActivityCard.tsx
import { ActivityWithDistance } from '@/fetchs/activity';
import { buildImageUrl } from '@/utils/image';
import NavigationIcon from '@mui/icons-material/Navigation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  activity: ActivityWithDistance;
}

export default function ActivityCard({ activity }: Props) {
  const router = useRouter();
  const pictureUrl = activity.pictures[0]?.url
    ? buildImageUrl(activity.pictures[0].url)
    : null;

  const handleClick = () => {
    router.push(`/cities/${activity.city.name}/activities/${activity.name}`);
  };

  const durationText =
    activity.duration < 60
      ? `${activity.duration} min`
      : `${Math.floor(activity.duration / 60)}h ${activity.duration % 60 > 0 ? `${activity.duration % 60}m` : ''}`.trim();

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #E5E5EA',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <CardActionArea onClick={handleClick}>
        {pictureUrl ? (
          <Image
            alt={activity.title}
            src={pictureUrl}
            width={640}
            height={480}
            style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '160px', bgcolor: 'grey.200' }} />
        )}
        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontSize: '0.95rem',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.5,
            }}
          >
            {activity.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {activity.categories.map((c) => c.title).join(', ')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <NavigationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {activity.distance.toFixed(1)} km
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {durationText}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npm run lint
```
Expected: no errors in `ActivityCard.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/explore/ActivityCard.tsx
git commit -m "feat: add ActivityCard component for explore page"
```

---

## Task 3: Create the explore page — layout skeleton

**Files:**
- Create: `src/app/(logged)/explore/page.tsx`

**Context:** Build the page structure with search bar, category pills placeholder, and two-panel split (left list, right map). Wire in real data in the next tasks. The page must be `'use client'` because it uses React hooks and browser geolocation.

- [ ] **Step 1: Create the page with layout and search state only**

```tsx
// src/app/(logged)/explore/page.tsx
'use client';

import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
      {/* Search bar */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5E5EA' }}>
        <TextField
          fullWidth
          placeholder="Search activities by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {/* Category pills — placeholder */}
      <Box sx={{ px: 3, py: 1, borderBottom: '1px solid #E5E5EA' }}>
        <Typography variant="body2" color="text.secondary">
          Categories loading...
        </Typography>
      </Box>

      {/* Two-panel split */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: activity list */}
        <Box
          sx={{
            width: '55%',
            overflowY: 'auto',
            p: 3,
            borderRight: '1px solid #E5E5EA',
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Nearby Activities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activities loading...
          </Typography>
        </Box>

        {/* Right: map placeholder */}
        <Box
          sx={{
            width: '45%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Map coming soon
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```
Expected: no errors

- [ ] **Step 3: Start dev server and verify the page renders at /explore**

```bash
npm run dev
# Open http://localhost:3000/explore
```
Expected: page shows search bar, placeholder category area, placeholder list + map panels

- [ ] **Step 4: Commit**

```bash
git add src/app/\(logged\)/explore/page.tsx
git commit -m "feat: add explore page layout skeleton"
```

---

## Task 4: Wire in categories and category pills

**Files:**
- Modify: `src/app/(logged)/explore/page.tsx`

**Context:** Replace the category placeholder with real data from `getCategories()`. Show skeleton pills while loading. Single-select: clicking a pill sets `selectedCategoryId`; clicking "All" sets it to `null`.

- [ ] **Step 1: Add category data fetching and pills rendering**

Replace the imports section and the "Category pills" section. Full updated page content:

```tsx
'use client';

import ActivityCard from '@/components/explore/ActivityCard';
import { getCategories } from '@/fetchs/category';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: categories, isLoading: categoriesLoading } = getCategories();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
      {/* Search bar */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5E5EA' }}>
        <TextField
          fullWidth
          placeholder="Search activities by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {/* Category pills */}
      <Box
        sx={{
          px: 3,
          py: 1,
          borderBottom: '1px solid #E5E5EA',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          flexShrink: 0,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 2 },
        }}
      >
        {categoriesLoading ? (
          // Skeleton pills
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={80} height={32} sx={{ borderRadius: 4, flexShrink: 0 }} />
          ))
        ) : (
          <>
            {/* "All" pill */}
            <Button
              size="small"
              onClick={() => setSelectedCategoryId(null)}
              sx={{
                borderRadius: 4,
                px: 2,
                flexShrink: 0,
                bgcolor: selectedCategoryId === null ? '#F67D56' : '#F2F2F7',
                color: selectedCategoryId === null ? '#fff' : 'text.primary',
                '&:hover': {
                  bgcolor: selectedCategoryId === null ? '#e56b45' : '#e0e0e7',
                },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              All
            </Button>
            {(categories ?? []).map((cat) => (
              <Button
                key={cat.id}
                size="small"
                onClick={() => setSelectedCategoryId(cat.id)}
                sx={{
                  borderRadius: 4,
                  px: 2,
                  flexShrink: 0,
                  bgcolor: selectedCategoryId === cat.id ? '#F67D56' : '#F2F2F7',
                  color: selectedCategoryId === cat.id ? '#fff' : 'text.primary',
                  '&:hover': {
                    bgcolor: selectedCategoryId === cat.id ? '#e56b45' : '#e0e0e7',
                  },
                  textTransform: 'none',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.title}
              </Button>
            ))}
          </>
        )}
      </Box>

      {/* Two-panel split */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: activity list */}
        <Box
          sx={{
            width: '55%',
            overflowY: 'auto',
            p: 3,
            borderRight: '1px solid #E5E5EA',
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Nearby Activities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activities loading...
          </Typography>
        </Box>

        {/* Right: map placeholder */}
        <Box
          sx={{
            width: '45%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Map coming soon
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```
Expected: no errors

- [ ] **Step 3: Verify category pills render**

```bash
npm run dev
# Open http://localhost:3000/explore
```
Expected: category pills render, clicking one highlights it in coral; "All" resets selection

- [ ] **Step 4: Commit**

```bash
git add src/app/\(logged\)/explore/page.tsx
git commit -m "feat: add category pills to explore page"
```

---

## Task 5: Wire in activity data and grid

**Files:**
- Modify: `src/app/(logged)/explore/page.tsx`

**Context:** Add geolocation, Paris fallback, `getClosestActivities`, client-side filtering, and render the `ActivityCard` grid with skeleton loading state. Both category and search filters compose (AND logic).

- [ ] **Step 1: Add activity fetching and filtered grid**

Replace the full page content with:

```tsx
'use client';

import ActivityCard from '@/components/explore/ActivityCard';
import { getClosestActivities } from '@/fetchs/activity';
import { getCategories } from '@/fetchs/category';
import { useGeolocation } from '@/hooks/useGeolocation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Geolocation with Paris fallback
  const { lat, lng, loading: geoLoading } = useGeolocation();
  const effectiveLat = lat ?? (geoLoading ? null : 48.8566);
  const effectiveLng = lng ?? (geoLoading ? null : 2.3522);

  // Data fetching — called unconditionally at top level (React Query hooks)
  const { data: categories, isLoading: categoriesLoading } = getCategories();
  const {
    data: activities,
    isLoading: activitiesLoading,
    isError: activitiesError,
    refetch: refetchActivities,
  } = getClosestActivities(effectiveLat, effectiveLng, 50);

  // Client-side filtering (category AND search compose)
  const filteredActivities = (activities ?? []).filter((activity) => {
    const matchesCategory =
      selectedCategoryId === null ||
      activity.categories.some((c) => c.id === selectedCategoryId);
    const matchesSearch =
      searchQuery === '' ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
      {/* Search bar */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5E5EA' }}>
        <TextField
          fullWidth
          placeholder="Search activities by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {/* Category pills */}
      <Box
        sx={{
          px: 3,
          py: 1,
          borderBottom: '1px solid #E5E5EA',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          flexShrink: 0,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 2 },
        }}
      >
        {categoriesLoading ? (
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={80} height={32} sx={{ borderRadius: 4, flexShrink: 0 }} />
          ))
        ) : (
          <>
            <Button
              size="small"
              onClick={() => setSelectedCategoryId(null)}
              sx={{
                borderRadius: 4, px: 2, flexShrink: 0,
                bgcolor: selectedCategoryId === null ? '#F67D56' : '#F2F2F7',
                color: selectedCategoryId === null ? '#fff' : 'text.primary',
                '&:hover': { bgcolor: selectedCategoryId === null ? '#e56b45' : '#e0e0e7' },
                textTransform: 'none', fontWeight: 500,
              }}
            >
              All
            </Button>
            {(categories ?? []).map((cat) => (
              <Button
                key={cat.id}
                size="small"
                onClick={() => setSelectedCategoryId(cat.id)}
                sx={{
                  borderRadius: 4, px: 2, flexShrink: 0,
                  bgcolor: selectedCategoryId === cat.id ? '#F67D56' : '#F2F2F7',
                  color: selectedCategoryId === cat.id ? '#fff' : 'text.primary',
                  '&:hover': { bgcolor: selectedCategoryId === cat.id ? '#e56b45' : '#e0e0e7' },
                  textTransform: 'none', fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                {cat.title}
              </Button>
            ))}
          </>
        )}
      </Box>

      {/* Two-panel split */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: activity grid */}
        <Box sx={{ width: '55%', overflowY: 'auto', p: 3, borderRight: '1px solid #E5E5EA' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Nearby Activities</Typography>
            {!activitiesLoading && (
              <Typography variant="body2" color="text.secondary">
                {filteredActivities.length} result{filteredActivities.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          {activitiesError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetchActivities()}>
                  Retry
                </Button>
              }
              sx={{ mb: 2 }}
            >
              Failed to load activities.
            </Alert>
          )}

          {activitiesLoading ? (
            // Skeleton grid
            <Grid container spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={6} key={i}>
                  <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {filteredActivities.map((activity) => (
                <Grid item xs={6} key={activity.id}>
                  <ActivityCard activity={activity} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Right: map placeholder */}
        <Box
          sx={{
            width: '45%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: 0,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Map coming soon
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```
Expected: no errors

- [ ] **Step 3: Verify activity grid**

```bash
npm run dev
# Open http://localhost:3000/explore
```
Expected: activities load in 2-column grid; search bar filters in real time; category pills filter the list; skeleton cards show while loading; error alert shows with retry button on API failure

- [ ] **Step 4: Commit**

```bash
git add src/app/\(logged\)/explore/page.tsx
git commit -m "feat: add activity grid with geolocation and client-side filtering"
```

---

## Task 6: Add Mapbox map panel

**Files:**
- Modify: `src/app/(logged)/explore/page.tsx`

**Context:** Replace the map placeholder with a real `react-map-gl` `Map` component. Render a numbered circular marker for each filtered activity. The Mapbox token lives in `process.env.NEXT_PUBLIC_MAPBOX_TOKEN` (per CLAUDE.md / `.env.local`). Map centers on effective user location. The map panel is sticky — it stays in place while the list scrolls.

- [ ] **Step 1: Replace the map placeholder**

Replace the `{/* Right: map placeholder */}` section with:

```tsx
{/* Right: Mapbox map */}
<Box sx={{ width: '45%', position: 'sticky', top: 0, height: 'calc(100vh - 90px)', flexShrink: 0 }}>
  {effectiveLat && effectiveLng && (
    <Map
      mapboxAccessToken={MAPBOX_API_TOKEN}
      initialViewState={{
        latitude: effectiveLat,
        longitude: effectiveLng,
        zoom: 13,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      {filteredActivities.map((activity, index) => (
        <Marker
          key={activity.id}
          latitude={activity.latitude}
          longitude={activity.longitude}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              bgcolor: '#F67D56',
              border: '2px solid #fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              cursor: 'pointer',
            }}
          >
            {index + 1}
          </Box>
        </Marker>
      ))}
    </Map>
  )}
</Box>
```

- [ ] **Step 2: Add the Map, Marker, and token imports at the top of the file**

Add to imports:
```tsx
import { Map, Marker } from 'react-map-gl';
import { MAPBOX_API_TOKEN } from '@/configs/mapbox';
```

Note: `mapbox-gl/dist/mapbox-gl.css` is already imported globally in `src/app/layout.tsx` — do NOT add it again here.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```
Expected: no errors

- [ ] **Step 4: Verify map renders**

```bash
npm run dev
# Open http://localhost:3000/explore
```
Expected: Mapbox map renders in the right panel with numbered coral markers; map is sticky while activity list scrolls; markers update when search/category filter changes

- [ ] **Step 5: Commit**

```bash
git add src/app/\(logged\)/explore/page.tsx
git commit -m "feat: add Mapbox map panel with activity markers to explore page"
```

---

## Done

At this point:
- `/explore` is accessible from the navbar
- Persistent search bar filters activities by name
- Category pills filter by category (single-select, "All" resets)
- 2-column activity card grid with skeleton loading and error/retry states
- Sticky Mapbox map with numbered markers matching the filtered list
- Paris coordinates used as fallback when geolocation is denied
