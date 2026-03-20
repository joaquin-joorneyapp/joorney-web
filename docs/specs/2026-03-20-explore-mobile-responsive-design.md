# Explore Page — Mobile Responsive Design

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

Make the `/explore` page responsive for mobile screens. On mobile, the map is hidden by default and the activity grid shows in a single column. A toggle button in the "Nearby Activities" header lets users switch between list and map views. Desktop layout (side-by-side 55/45 split, 2-column grid) is unchanged.

---

## Files Modified

- **Modified:** `src/app/(logged)/explore/page.tsx` — all responsive changes contained here; no new files

---

## Changes

### State

Add one new state variable:

```ts
const [showMap, setShowMap] = useState(false);
```

Default is `false` (list view) — on mobile, users see the activity list first.

### Activity grid columns

Change the `Grid item` column span to be responsive:

```tsx
<Grid item xs={12} md={6} key={activity.id}>
```

- `xs={12}` → 1 column on mobile
- `md={6}` → 2 columns on ≥md (unchanged from current behavior)

Same change applies to the Skeleton placeholder grid items during loading.

### Left panel width

Change the left panel `Box` width to be responsive:

```tsx
sx={{ width: { xs: '100%', md: '55%' }, ... }}
```

On mobile the list takes full width. `borderRight` is only applied on ≥md:

```tsx
borderRight: { xs: 'none', md: '1px solid #E5E5EA' }
```

### Map panel visibility

The map panel is always visible on desktop, toggled on mobile:

```tsx
sx={{ display: { xs: showMap ? 'block' : 'none', md: 'block' }, width: { xs: '100%', md: '45%' }, ... }}
```

### Toggle button

Visible only on mobile (`display: { xs: 'flex', md: 'none' }`), placed in the "Nearby Activities" header row next to the result count:

```tsx
<Button
  size="small"
  onClick={() => setShowMap((v) => !v)}
  startIcon={showMap ? <ListIcon /> : <MapIcon />}
  sx={{ display: { xs: 'flex', md: 'none' }, ... }}
>
  {showMap ? 'Hide Map' : 'Show Map'}
</Button>
```

Uses MUI `MapIcon` (`@mui/icons-material/Map`) and `ListIcon` (`@mui/icons-material/List`).

---

## Breakpoint

Uses MUI default `md` breakpoint (≥900px) as the desktop/mobile boundary, consistent with the rest of the app.

---

## Out of Scope

- Any changes to `ActivityCard.tsx`
- Any changes to navbar or other pages
- Tablet-specific intermediate layouts
