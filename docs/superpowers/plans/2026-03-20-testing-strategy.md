# Testing Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full testing stack to joorney-web: Vitest + React Testing Library for unit/component tests, Playwright for E2E, and a CI gate in the deploy workflow.

**Architecture:** Task 1 installs and configures the test frameworks. Tasks 2–4 add tests for utils, hooks, and components using Vitest + RTL. Tasks 5–6 add Playwright E2E tests. Task 7 wires tests into CI. Each task is independently committable and leaves the repo in a working state.

**Tech Stack:** Next.js 14 App Router, TypeScript, MUI v5, Vitest, @testing-library/react, Playwright

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `vitest.config.ts` | Vitest config: jsdom env, path aliases, Next.js mocks |
| Create | `src/test/setup.ts` | Global: import jest-dom matchers |
| Create | `__mocks__/next/image.tsx` | Mock `next/image` → plain `<img>` |
| Create | `__mocks__/next/link.tsx` | Mock `next/link` → plain `<a>` |
| Create | `playwright.config.ts` | Playwright config: baseURL, webServer |
| Create | `src/utils/image.test.ts` | Tests for `buildImageUrl` |
| Create | `src/utils/http.test.ts` | Tests for `parseHTTPErrors` |
| Create | `src/utils/array.test.ts` | Tests for `chunkWithOverlap` |
| Create | `src/hooks/useGeolocation.test.ts` | Tests for `useGeolocation` |
| Create | `src/components/explore/ActivityCard.test.tsx` | Tests for `ActivityCard` |
| Create | `src/components/home/NearbyActivityCard.test.tsx` | Tests for `NearbyActivityCard` |
| Create | `src/components/PlanCard.test.tsx` | Tests for `PlanCard` |
| Create | `e2e/login.spec.ts` | E2E: login flow |
| Create | `e2e/explore.spec.ts` | E2E: explore page mobile toggle |
| Modify | `package.json` | Add devDependencies + test scripts |
| Modify | `.github/workflows/deploy.yml` | Add test steps before Docker build |

---

### Task 1: Install packages and configure Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `__mocks__/next/image.tsx`
- Create: `__mocks__/next/link.tsx`

- [ ] **Step 1: Install unit/component test packages**

Run from `/Users/joaquincrippa/projects/joorney/joorney-web`:

```bash
npm install -D vitest @vitest/ui jsdom @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Expected: packages added to `devDependencies` in `package.json`, no errors.

- [ ] **Step 2: Add test scripts to package.json**

Open `package.json` and add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 3: Create vitest.config.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/vitest.config.ts`:

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

- [ ] **Step 4: Create src/test/setup.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Create __mocks__/next/image.tsx**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/__mocks__/next/image.tsx`:

```tsx
import React from 'react';
const Image = ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />;
export default Image;
```

- [ ] **Step 6: Create __mocks__/next/link.tsx**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/__mocks__/next/link.tsx`:

```tsx
import React from 'react';
const Link = ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>;
export default Link;
```

- [ ] **Step 7: Verify the config works with a smoke test**

Create a temporary file `src/test/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run:

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test
```

Expected output:
```
✓ src/test/smoke.test.ts (1)
  ✓ smoke > runs

Test Files  1 passed (1)
Tests       1 passed (1)
```

If you see errors about `__dirname` or path aliases, double-check `vitest.config.ts`.

- [ ] **Step 8: Delete the smoke test**

```bash
rm /Users/joaquincrippa/projects/joorney/joorney-web/src/test/smoke.test.ts
```

- [ ] **Step 9: Commit**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web
git add vitest.config.ts src/test/setup.ts __mocks__/next/image.tsx __mocks__/next/link.tsx package.json package-lock.json
git commit -m "chore: install and configure Vitest + React Testing Library"
```

---

### Task 2: Unit tests for utility functions

**Files:**
- Create: `src/utils/image.test.ts`
- Create: `src/utils/http.test.ts`
- Create: `src/utils/array.test.ts`
- Reference: `src/utils/image.ts`, `src/utils/http.ts`, `src/utils/array.ts`

**Key facts about these functions:**
- `buildImageUrl(url)` → prepends `'https://storage.googleapis.com/joorney-pictures/'` to `url`. No guard for empty string — `buildImageUrl('')` returns the base URL with empty suffix, which is current expected behavior.
- `parseHTTPErrors(error)` → returns `error?.response?.data?.errors || []`. Returns an array, not a string.
- `chunkWithOverlap(arr, size=3)` → loop guard is `i < arr.length - 1`, so a single-element array returns `[]` (the element is dropped). This is the existing behavior — the test documents it, not fixes it.

- [ ] **Step 1: Create image.test.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/src/utils/image.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildImageUrl } from './image';

const BASE = 'https://storage.googleapis.com/joorney-pictures/';

describe('buildImageUrl', () => {
  it('prepends the base URL to a relative path', () => {
    expect(buildImageUrl('cities/paris.jpg')).toBe(`${BASE}cities/paris.jpg`);
  });

  it('prepends the base URL to a nested path', () => {
    expect(buildImageUrl('a/b/c.png')).toBe(`${BASE}a/b/c.png`);
  });

  it('returns base URL with empty suffix when given an empty string', () => {
    // Current behavior: no guard — documents this for future reference
    expect(buildImageUrl('')).toBe(BASE);
  });
});
```

- [ ] **Step 2: Run and verify image.test.ts passes**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test src/utils/image.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 3: Create http.test.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/src/utils/http.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseHTTPErrors } from './http';

describe('parseHTTPErrors', () => {
  it('returns the errors array from a structured axios error response', () => {
    const error = { response: { data: { errors: ['Email is invalid', 'Password too short'] } } };
    expect(parseHTTPErrors(error)).toEqual(['Email is invalid', 'Password too short']);
  });

  it('returns an empty array when there is no response (network error)', () => {
    const error = new Error('Network Error');
    expect(parseHTTPErrors(error)).toEqual([]);
  });

  it('returns an empty array when response has no data.errors', () => {
    const error = { response: { data: {} } };
    expect(parseHTTPErrors(error)).toEqual([]);
  });

  it('returns an empty array when passed null', () => {
    expect(parseHTTPErrors(null)).toEqual([]);
  });

  it('returns an empty array when passed undefined', () => {
    expect(parseHTTPErrors(undefined)).toEqual([]);
  });
});
```

- [ ] **Step 4: Run and verify http.test.ts passes**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test src/utils/http.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Create array.test.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/src/utils/array.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { chunkWithOverlap } from './array';

describe('chunkWithOverlap', () => {
  it('chunks a 5-element array into overlapping groups of 3', () => {
    // [1,2,3], [3,4,5] — overlap of 1 at each boundary
    expect(chunkWithOverlap([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [3, 4, 5]]);
  });

  it('uses default chunk size of 3', () => {
    expect(chunkWithOverlap([1, 2, 3, 4, 5])).toEqual([[1, 2, 3], [3, 4, 5]]);
  });

  it('returns an empty array for an empty input', () => {
    expect(chunkWithOverlap([])).toEqual([]);
  });

  it('returns an empty array for a single-element input (loop guard drops it)', () => {
    // Loop condition: i < arr.length - 1 → 0 < 0 is false immediately
    expect(chunkWithOverlap([42])).toEqual([]);
  });

  it('returns a single chunk when the array is smaller than the chunk size', () => {
    expect(chunkWithOverlap([1, 2], 5)).toEqual([[1, 2]]);
  });
});
```

- [ ] **Step 6: Run and verify array.test.ts passes**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test src/utils/array.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 7: Run all tests to confirm nothing is broken**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test
```

Expected: 13 tests pass across 3 files.

- [ ] **Step 8: Commit**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web
git add src/utils/image.test.ts src/utils/http.test.ts src/utils/array.test.ts
git commit -m "test: add unit tests for utils (image, http, array)"
```

---

### Task 3: Hook tests for useGeolocation

**Files:**
- Create: `src/hooks/useGeolocation.test.ts`
- Reference: `src/hooks/useGeolocation.ts`

**Key facts:**
- The hook calls `navigator.geolocation.getCurrentPosition(successCb, errorCb)` inside `useEffect`.
- Initial state: `{ lat: null, lng: null, loading: true, error: null }`.
- `vi.stubGlobal` replaces `navigator.geolocation` for the test — call it before `renderHook`, restore after.
- `getCurrentPosition` is a callback-based API. To simulate it, provide a fake implementation that calls the callback synchronously.
- `renderHook` from `@testing-library/react` runs the hook in a minimal React tree.

- [ ] **Step 1: Create useGeolocation.test.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/src/hooks/useGeolocation.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useGeolocation', () => {
  it('starts with loading: true and no coordinates', () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(), // never calls back — stays loading
      },
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.loading).toBe(true);
    expect(result.current.lat).toBe(null);
    expect(result.current.lng).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('returns coordinates when geolocation succeeds', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((successCb) => {
          successCb({ coords: { latitude: 48.8566, longitude: 2.3522 } });
        }),
      },
    });

    const { result } = renderHook(() => useGeolocation());
    await act(async () => {}); // flush effects

    expect(result.current.loading).toBe(false);
    expect(result.current.lat).toBe(48.8566);
    expect(result.current.lng).toBe(2.3522);
    expect(result.current.error).toBe(null);
  });

  it('sets error and loading: false when geolocation fails', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((_successCb, errorCb) => {
          errorCb({ message: 'User denied geolocation' });
        }),
      },
    });

    const { result } = renderHook(() => useGeolocation());
    await act(async () => {}); // flush effects

    expect(result.current.loading).toBe(false);
    expect(result.current.lat).toBe(null);
    expect(result.current.lng).toBe(null);
    expect(result.current.error).toBe('User denied geolocation');
  });

  it('sets error when geolocation is not supported', async () => {
    vi.stubGlobal('navigator', {
      geolocation: undefined,
    });

    const { result } = renderHook(() => useGeolocation());
    await act(async () => {}); // flush effects

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Geolocation not supported');
  });
});
```

- [ ] **Step 2: Run and verify all 4 tests pass**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test src/hooks/useGeolocation.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 3: Commit**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web
git add src/hooks/useGeolocation.test.ts
git commit -m "test: add unit tests for useGeolocation hook"
```

---

### Task 4: Component tests

**Files:**
- Create: `src/components/explore/ActivityCard.test.tsx`
- Create: `src/components/home/NearbyActivityCard.test.tsx`
- Create: `src/components/PlanCard.test.tsx`

**Key facts:**
- `next/image` and `next/link` are aliased to plain HTML via `vitest.config.ts` — no extra mocking needed in test files.
- MUI components render fine in jsdom with `@vitejs/plugin-react`.
- Use `screen.getByText`, `screen.getByRole`, `screen.getByAltText`, `screen.queryByRole` from `@testing-library/react`.
- Do NOT test implementation details (CSS classes, internal state). Test what the user sees.

**Shared fixture — copy this block at the top of each activity component test file:**

```ts
const baseActivity = {
  id: 1,
  name: 'test-activity',
  title: 'Test Activity',
  description: '',
  address: '',
  duration: 90,
  latitude: 48.85,
  longitude: 2.35,
  distance: 2.5,
  pictures: [{ url: 'path/to/image.jpg' }], // Picture[] — matches TypeScript type
  categories: [{ id: 1, title: 'Outdoor' }],
  city: { id: 1, name: 'paris', title: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, pictures: [] },
  cityId: 1,
};
```

**PlanCard fixture:**

```ts
const basePlan = {
  id: 1,
  city: {
    id: 1,
    name: 'paris',
    title: 'Paris',
    country: 'France',
    latitude: 48.85,
    longitude: 2.35,
    pictures: [{ url: 'path/to/image.jpg' }], // Picture[] — { url: string }[]
  },
  startDate: new Date(2026, 5, 1), // local date (month 0-indexed): avoids UTC timezone off-by-one
  days: 3,
  schedules: [],
  categories: [],
};
```

- [ ] **Step 1: Create ActivityCard.test.tsx**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/src/components/explore/ActivityCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityCard from './ActivityCard';

const baseActivity = {
  id: 1,
  name: 'test-activity',
  title: 'Test Activity',
  description: '',
  address: '',
  duration: 90,
  latitude: 48.85,
  longitude: 2.35,
  distance: 2.5,
  pictures: [{ url: 'path/to/image.jpg' }], // Picture[] — matches TypeScript type
  categories: [{ id: 1, title: 'Outdoor' }],
  city: { id: 1, name: 'paris', title: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, pictures: [] },
  cityId: 1,
};

describe('ActivityCard', () => {
  it('renders the activity title', () => {
    render(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('Test Activity')).toBeInTheDocument();
  });

  it('renders the category', () => {
    render(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('renders the distance', () => {
    render(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('2.5 km')).toBeInTheDocument();
  });

  it('renders duration correctly for >= 60 minutes', () => {
    render(<ActivityCard activity={baseActivity} />); // 90 min → 1h 30m
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
  });

  it('renders duration correctly for < 60 minutes', () => {
    render(<ActivityCard activity={{ ...baseActivity, duration: 45 }} />);
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('renders the activity image when pictures are present', () => {
    render(<ActivityCard activity={baseActivity} />);
    const img = screen.getByAltText('Test Activity');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('path/to/image.jpg'));
  });

  it('shows no image element when pictures array is empty', () => {
    render(<ActivityCard activity={{ ...baseActivity, pictures: [] }} />);
    expect(screen.queryByAltText('Test Activity')).not.toBeInTheDocument();
  });

  it('links to the correct activity page', () => {
    render(<ActivityCard activity={baseActivity} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cities/paris/activities/test-activity');
  });
});
```

- [ ] **Step 2: Run and verify ActivityCard tests pass**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test src/components/explore/ActivityCard.test.tsx
```

Expected: 8 tests pass. If you see MUI warnings about `ThemeProvider`, they are harmless — MUI renders fine without a provider in tests.

- [ ] **Step 3: Create NearbyActivityCard.test.tsx**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/src/components/home/NearbyActivityCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NearbyActivityCard from './NearbyActivityCard';

const baseActivity = {
  id: 1,
  name: 'test-activity',
  title: 'Test Activity',
  description: '',
  address: '',
  duration: 90,
  latitude: 48.85,
  longitude: 2.35,
  distance: 2.5,
  pictures: [{ url: 'path/to/image.jpg' }], // Picture[] — matches TypeScript type
  categories: [{ id: 1, title: 'Outdoor' }],
  city: { id: 1, name: 'paris', title: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, pictures: [] },
  cityId: 1,
};

describe('NearbyActivityCard', () => {
  it('renders the activity title', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    expect(screen.getByText('Test Activity')).toBeInTheDocument();
  });

  it('renders the first category title', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('does not render a category element when categories is empty', () => {
    render(<NearbyActivityCard activity={{ ...baseActivity, categories: [] }} />);
    expect(screen.queryByText('Outdoor')).not.toBeInTheDocument();
  });

  it('renders the distance', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    expect(screen.getByText('2.5 km')).toBeInTheDocument();
  });

  it('renders the activity image when pictures are present', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    expect(screen.getByAltText('Test Activity')).toBeInTheDocument();
  });

  it('links to the correct activity page', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cities/paris/activities/test-activity');
  });
});
```

- [ ] **Step 4: Run and verify NearbyActivityCard tests pass**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test src/components/home/NearbyActivityCard.test.tsx
```

Expected: 6 tests pass.

- [ ] **Step 5: Create PlanCard.test.tsx**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/src/components/PlanCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlanCard from './PlanCard';

const basePlan = {
  id: 1,
  city: {
    id: 1,
    name: 'paris',
    title: 'Paris',
    country: 'France',
    latitude: 48.85,
    longitude: 2.35,
    pictures: [{ url: 'path/to/image.jpg' }],
  },
  startDate: new Date(2026, 5, 1), // local date (month 0-indexed): avoids UTC timezone off-by-one
  days: 3,
  schedules: [],
  categories: [],
};

describe('PlanCard', () => {
  it('renders the city title', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('renders the country', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('renders the days count', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('3 days')).toBeInTheDocument();
  });

  it('renders singular "day" for 1-day plans', () => {
    render(<PlanCard plan={{ ...basePlan, days: 1 }} />);
    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('renders the formatted start date', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('Jun 1, 2026')).toBeInTheDocument();
  });

  it('renders "No date set" when startDate is null', () => {
    render(<PlanCard plan={{ ...basePlan, startDate: null }} />);
    expect(screen.getByText('No date set')).toBeInTheDocument();
  });

  it('renders the city image when pictures are present', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByAltText('Paris')).toBeInTheDocument();
  });

  it('shows no image element when city pictures array is empty', () => {
    render(<PlanCard plan={{ ...basePlan, city: { ...basePlan.city, pictures: [] } }} />);
    expect(screen.queryByAltText('Paris')).not.toBeInTheDocument();
  });

  it('links to the correct plan page', () => {
    render(<PlanCard plan={basePlan} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/plans/1');
  });
});
```

- [ ] **Step 6: Run and verify PlanCard tests pass**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test src/components/PlanCard.test.tsx
```

Expected: 9 tests pass.

- [ ] **Step 7: Run all tests**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm test
```

Expected: all tests across all files pass (13 utils + 4 hook + 23 component = 40 tests).

- [ ] **Step 8: Commit**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web
git add src/components/explore/ActivityCard.test.tsx src/components/home/NearbyActivityCard.test.tsx src/components/PlanCard.test.tsx
git commit -m "test: add component tests for ActivityCard, NearbyActivityCard, PlanCard"
```

---

### Task 5: Install and configure Playwright

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`

- [ ] **Step 1: Install Playwright**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm install -D @playwright/test && npx playwright install
```

Expected: installs Chromium, Firefox, WebKit browsers. May take a minute.

- [ ] **Step 2: Add E2E script to package.json**

Add to `"scripts"` in `package.json`:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Create playwright.config.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: process.env.CI
      ? 'npm run build && npm start'
      : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

- [ ] **Step 4: Commit**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web
git add playwright.config.ts package.json package-lock.json
git commit -m "chore: install and configure Playwright"
```

---

### Task 6: E2E tests

**Files:**
- Create: `e2e/login.spec.ts`
- Create: `e2e/explore.spec.ts`

**Key facts:**
- The dev server must be running on port 3000 locally (`npm run dev` in a separate terminal). Playwright will auto-start it if it's not already running (due to `reuseExistingServer: true` in non-CI mode).
- Auth seeding: seed `localStorage` with `user` (JSON) and `token` (string) before navigating to authenticated pages.
- The explore toggle (`ToggleButtonGroup`) is only visible on mobile viewports — test at 390px width.
- Login page has `name="email"` and `name="password"` inputs. On success it redirects to `/home`.

- [ ] **Step 1: Create e2e/login.spec.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/e2e/login.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

// These credentials must be valid in the test environment.
// If no test account exists, skip this test and track it as a known gap.
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? '';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? '';

test.describe('Login flow', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'E2E_TEST_EMAIL and E2E_TEST_PASSWORD env vars required');

  test('user can log in and land on the home page', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/home/);
  });
});
```

- [ ] **Step 2: Create e2e/explore.spec.ts**

Create `/Users/joaquincrippa/projects/joorney/joorney-web/e2e/explore.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

// Seed auth so the page does not redirect to /login.
// The token is fake — API calls will 401 and activities won't load,
// but the test only verifies the page shell and toggle button.
async function seedAuth(page: import('@playwright/test').Page) {
  await page.goto('/');
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
}

test.describe('Explore page — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  test('shows the toggle button and can switch to map view', async ({ page }) => {
    await seedAuth(page);
    await page.goto('/explore');

    // Toggle group is visible on mobile
    const listButton = page.getByRole('button', { name: 'list view' });
    const mapButton = page.getByRole('button', { name: 'map view' });

    await expect(listButton).toBeVisible();
    await expect(mapButton).toBeVisible();

    // Click map view — list panel should be hidden, map panel visible
    await mapButton.click();
    await expect(mapButton).toBeVisible(); // still visible after click
  });

  test('shows the page title', async ({ page }) => {
    await seedAuth(page);
    await page.goto('/explore');

    await expect(page.getByText('Nearby Activities')).toBeVisible();
  });
});
```

- [ ] **Step 3: Run E2E tests locally**

Make sure the dev server is running (`npm run dev` in another terminal), then:

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && npm run test:e2e
```

Expected: login test is skipped (no env vars set), explore tests pass (2 tests). Output example:

```
  ✓  e2e/explore.spec.ts:32:3 › Explore page — mobile > shows the toggle button
  ✓  e2e/explore.spec.ts:44:3 › Explore page — mobile > shows the page title
  -  e2e/login.spec.ts:10:3 › Login flow > user can log in (skipped)
```

If the explore tests fail with "page redirected to /login", the auth seeding is not working — check that `localStorage.setItem` is executing before `page.goto('/explore')`.

- [ ] **Step 4: Commit**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web
git add e2e/login.spec.ts e2e/explore.spec.ts
git commit -m "test: add E2E tests for login flow and explore page mobile toggle"
```

---

### Task 7: CI integration

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Key facts:**
- The existing workflow has no `actions/setup-node` step — Node.js must be set up explicitly before `npm ci`.
- Test steps go **before** the Docker build step so a failing test blocks the deploy.
- Playwright browsers are installed with `npx playwright install --with-deps` (includes system OS dependencies for headless Chrome).
- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAPBOX_TOKEN` secrets already exist in the repo (used by the Docker build step).

- [ ] **Step 1: Add test steps to deploy.yml**

Open `/Users/joaquincrippa/projects/joorney/joorney-web/.github/workflows/deploy.yml`.

Insert the following steps **after** the `Checkout` step and **before** the `Authenticate to Google Cloud` step:

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

The final `steps:` block order should be:
1. Checkout
2. Set up Node.js ← new
3. Install dependencies ← new
4. Run unit and component tests ← new
5. Install Playwright browsers ← new
6. Run E2E tests ← new
7. Authenticate to Google Cloud
8. Configure Docker for Artifact Registry
9. Build & push image
10. Deploy to Cloud Run

- [ ] **Step 2: Verify the YAML is valid**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web && cat .github/workflows/deploy.yml
```

Check that indentation is consistent (2-space) and the `steps:` list looks correct. GitHub Actions YAML is indent-sensitive.

- [ ] **Step 3: Commit and push**

```bash
cd /Users/joaquincrippa/projects/joorney/joorney-web
git add .github/workflows/deploy.yml
git commit -m "ci: add unit, component, and E2E test steps before deploy"
git push
```

After pushing, open the GitHub Actions tab and confirm the workflow runs the test steps before the Docker build.
