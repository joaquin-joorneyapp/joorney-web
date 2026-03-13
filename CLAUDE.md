# joorney-web — Claude Context

## Overview
Next.js 14 frontend (App Router, TypeScript) for the Joorney travel planning app. Allows users to browse cities, discover activities, and generate multi-day travel plans.

## Tech Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **UI:** Material-UI (MUI) + Emotion
- **Data Fetching:** TanStack React Query v5 + Axios
- **Maps:** Mapbox GL + React-Leaflet + Turf.js (geospatial)
- **Auth:** Google OAuth (@react-oauth/google) + JWT
- **Date Handling:** date-fns
- **Carousel:** Embla Carousel
- **Icons:** Lucide React + MUI Icons

## Dev Commands
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Environment
Requires a `.env.local` file:
- `NEXT_PUBLIC_API_URL` — Backend API URL (e.g., `http://localhost:3333`)
- `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox public access token

## Project Structure
```
src/
  app/
    (anonymous)/       # Public routes (login, signup, password reset)
    (logged)/          # Auth-protected routes
      cities/          # Browse cities + city detail
        [cityId]/
          activities/  # City activities list + create
          new-plan/    # Plan creation for city
      plans/[planId]/  # Plan detail view
      saved-plans/     # User's saved plans
  components/
    maps/              # Mapbox GL + Leaflet components
    plan/              # Plan display and edit components
    input/             # Custom MUI-based input components
    skeletons/         # Loading skeleton components
  fetchs/              # React Query hooks for all API calls
    activity.ts
    auth.ts
    category.ts
    city.ts
    map.ts
    plan.ts
  types/
    fetchs/
      requests/        # API request payload types
      responses/       # API response types (activity, category, city, plan)
  contexts/
    AuthUserContext.ts # JWT + user state
  utils/
    array.ts
    http.ts
    image.ts           # GCS URL helpers
  configs/
    axios.ts           # Axios instance with base URL + auth headers
```

## Key Patterns

### Data Fetching
All API calls go through React Query hooks defined in `src/fetchs/`. Never call the API directly from components — always use or create a hook in the appropriate `fetchs/` file. The Axios instance in `src/configs/axios.ts` automatically attaches the JWT token.

### Auth
JWT is stored and managed via `AuthUserContext`. Google OAuth is supported alongside email/password. Protected routes live under `(logged)/` route group.

### Types
All request/response shapes are typed in `src/types/fetchs/`. Add new types there when extending the API.

### Maps
Mapbox GL is used for interactive city/activity maps. Leaflet (React-Leaflet) is also available. Geospatial calculations use Turf.js. Map components live in `src/components/maps/`.

### UI Conventions
- Prefer MUI components over custom HTML
- Custom inputs go in `src/components/input/`
- Use Embla Carousel for image galleries
- Loading states use skeleton components from `src/components/skeletons/`

### Images
Activity and city pictures are served from Google Cloud Storage. Use helpers in `src/utils/image.ts` to build GCS URLs.
