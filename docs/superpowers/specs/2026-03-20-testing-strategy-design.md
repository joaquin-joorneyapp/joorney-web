# Testing Strategy — joorney-web

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

Add a full testing stack to the joorney-web Next.js 14 project: unit tests, component tests, and end-to-end tests. Goals are catching regressions, CI gating on deploy, and documenting expected behavior.

**Stack:** Vitest + React Testing Library (unit/component) + Playwright (E2E)

---

## Framework & Configuration

### Packages to install

```bash
# Unit + component
npm install -D vitest @vitest/ui jsdom @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom

# E2E
npm install -D @playwright/test
npx playwright install
```

### vitest.config.ts

New file at project root. Uses `fileURLToPath` to define `__dirname` safely in ESM context. Also aliases `next/image` and `next/link` to mock files to avoid Next.js internal errors in jsdom:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/image': path.resolve(__dirname, './__mocks__/next/image.tsx'),
      'next/link': path.resolve(__dirname, './__mocks__/next/link.tsx'),
    },
  },
});
```

### Next.js mock files

**`__mocks__/next/image.tsx`:**
```tsx
import React from 'react';
const Image = ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />;
export default Image;
```

**`__mocks__/next/link.tsx`:**
```tsx
import React from 'react';
const Link = ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>;
export default Link;
```

### src/test/setup.ts

```ts
import '@testing-library/jest-dom';
```

### playwright.config.ts

New file at project root. In CI, uses a production build (`npm run build && npm start`) for consistency with what is deployed. Locally reuses the existing dev server:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: process.env.CI
      ? 'npm run build && npm start'
      : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### package.json scripts

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui",
"test:e2e": "playwright test"
```

No coverage script at this stage — add `@vitest/coverage-v8` and `"test:coverage": "vitest run --coverage"` later when coverage reporting is needed.

---

## Test Layers

### Unit Tests — `src/utils/*.test.ts`, `src/hooks/*.test.ts`

| File | What to test |
|------|-------------|
| `utils/image.ts` — `buildImageUrl` | Returns full S3 URL when given a relative path; when passed an empty string, returns a URL with empty path (documents current behavior, no guard) |
| `utils/http.ts` — `parseHTTPErrors` | Returns `error.response.data.errors` array when present; returns `[]` on a network error with no response body; returns `[]` when passed `null` or `undefined` |
| `utils/array.ts` — `chunkWithOverlap` | Correct chunk sizes; overlap behavior; edge cases (empty array, size larger than array length, single-element array — `chunkWithOverlap([1])` returns `[]` because the loop guard is `i < arr.length - 1`, so `0 < 0` is immediately false and the single element is dropped) |
| `hooks/useGeolocation.ts` | Returns coords when `navigator.geolocation.getCurrentPosition` succeeds; `loading` is `true` initially, `false` after resolution; handles permission denial |

`useGeolocation` uses RTL's `renderHook` and mocks `navigator.geolocation` via `vi.stubGlobal`.

### Component Tests — `src/components/**/*.test.tsx`

Rendered with RTL, API calls mocked with `vi.mock`. `next/image` and `next/link` are aliased to plain HTML equivalents in `vitest.config.ts` (see above).

**Minimal fixture shapes:**

```ts
const basePlan = {
  id: 1,
  city: {
    name: 'paris',
    title: 'Paris',
    country: 'France',
    pictures: [{ url: 'path/to/image.jpg' }], // Picture[] — { url: string }[]
  },
  startDate: new Date('2026-06-01'),
  days: 3,
  schedules: [],
  categories: [],
};
```

**Minimal fixture shapes for components using `ActivityWithDistance`:**

```ts
const baseActivity = {
  id: 1,
  name: 'test-activity',
  title: 'Test Activity',
  duration: 90,
  distance: 2.5,
  latitude: 48.85,
  longitude: 2.35,
  pictures: ['path/to/image.jpg'], // string[] shape from closest API
  categories: [{ id: 1, title: 'Outdoor' }],
  city: { name: 'paris', title: 'Paris' },
};
```

| Component | What to test |
|-----------|-------------|
| `ActivityCard` | Renders title, distance (`2.5 km`), duration (`1h 30m`); shows grey placeholder when `pictures` is empty; link `href` matches `/cities/paris/activities/test-activity` |
| `PlanCard` | Renders city title (`plan.city.title`), country, formatted start date, days count; shows placeholder when `pictures` is empty; link `href` matches `/plans/1` |
| `NearbyActivityCard` | Renders title, first category title, distance; link `href` matches `/cities/paris/activities/test-activity` |

Focus on **behavior** (what the user sees), not implementation details.

### E2E Tests — `e2e/*.spec.ts`

Playwright runs against `localhost:3000` (production build in CI).

**Authentication strategy:** The app uses two `localStorage` keys — `user` (JSON object) and `token` (raw JWT string). E2E tests seed both before navigating, no real Google OAuth needed:

```ts
await page.evaluate(() => {
  const user = {
    isAuthenticated: true,
    isAdmin: false,
    token: 'test-jwt-token',
    abilities: [],
    name: 'Test User',
  };
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', 'test-jwt-token');
});
```

The explore page fetches activities from the API using the token in the `Authorization` header (via `authAxios`). Since the test token is not a real JWT, API calls will return 401 and activities will not load — but the test only needs to verify that the page renders and the toggle button is visible. If verifying activity cards is required, mock the API response via `page.route()`. This must be handled in a `test.beforeEach` block.

| File | Flow |
|------|------|
| `e2e/login.spec.ts` | User visits `/login`, fills email + password, submits, is redirected to `/home` |
| `e2e/explore.spec.ts` | Authenticated user (token seeded via localStorage) visits `/explore`, sees activity cards, can toggle map view using the ToggleButtonGroup on a 390px mobile viewport |

---

## CI Integration

Add the following steps to `.github/workflows/deploy.yml` **before** the Docker build step. Includes `actions/setup-node` since the existing workflow has no Node.js setup step:

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

- name: Install dependencies
  run: npm ci

- name: Run unit and component tests
  run: npm run test

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
    NEXT_PUBLIC_MAPBOX_TOKEN: ${{ secrets.NEXT_PUBLIC_MAPBOX_TOKEN }}
```

A failing test blocks the deploy.

---

## Files Created / Modified

| Action | Path |
|--------|------|
| Create | `vitest.config.ts` |
| Create | `playwright.config.ts` |
| Create | `src/test/setup.ts` |
| Create | `__mocks__/next/image.tsx` |
| Create | `__mocks__/next/link.tsx` |
| Create | `src/utils/image.test.ts` |
| Create | `src/utils/http.test.ts` |
| Create | `src/utils/array.test.ts` |
| Create | `src/hooks/useGeolocation.test.ts` |
| Create | `src/components/explore/ActivityCard.test.tsx` |
| Create | `src/components/home/NearbyActivityCard.test.tsx` |
| Create | `src/components/PlanCard.test.tsx` |
| Create | `e2e/login.spec.ts` |
| Create | `e2e/explore.spec.ts` |
| Modify | `package.json` (add scripts + devDependencies) |
| Modify | `.github/workflows/deploy.yml` (add test steps) |

---

## Out of Scope

- Testing API fetch functions (`fetchs/`) — thin wrappers over axios + react-query; not worth the mock overhead at this stage
- Visual regression testing
- Coverage targets — focus on behavior, not coverage numbers (coverage tooling can be added later with `@vitest/coverage-v8`)
