// Set env var BEFORE importing the module (module reads it at evaluation time)
process.env.NEXT_PUBLIC_API_URL = 'http://test-api';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchCityActivities, fetchActivity } from './activity';

describe('fetchCityActivities', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('calls GET /cities/:slug/activities', async () => {
    const mock = [{ id: 1, name: 'eiffel-tower', title: 'Eiffel Tower', pictures: [] }];
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mock } as Response);

    const result = await fetchCityActivities('paris');

    expect(global.fetch).toHaveBeenCalledWith('http://test-api/cities/paris/activities');
    expect(result).toEqual(mock);
  });
});

describe('fetchActivity', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns null on 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 404, ok: false } as Response);
    const result = await fetchActivity('paris', 'nonexistent');
    expect(result).toBeNull();
  });

  it('returns activity data on 200', async () => {
    const mock = { id: 1, name: 'eiffel-tower', title: 'Eiffel Tower', pictures: [] };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => mock } as Response);
    const result = await fetchActivity('paris', 'eiffel-tower');
    expect(result).toEqual(mock);
  });

  it('throws on non-404 error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 } as Response);
    await expect(fetchActivity('paris', 'eiffel-tower')).rejects.toThrow('fetchActivity: 503');
  });
});
