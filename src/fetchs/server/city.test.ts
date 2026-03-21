// Set env var BEFORE importing the module (module reads it at evaluation time)
process.env.NEXT_PUBLIC_API_URL = 'http://test-api';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchAllCities } from './city';

describe('fetchAllCities', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('calls GET /cities and returns parsed JSON', async () => {
    const mockCities = [
      { id: 1, name: 'paris', title: 'Paris', country: 'France', latitude: 48.8, longitude: 2.3, pictures: [] },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCities,
    } as Response);

    const result = await fetchAllCities();

    expect(global.fetch).toHaveBeenCalledWith('http://test-api/cities');
    expect(result).toEqual(mockCities);
  });

  it('throws when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(fetchAllCities()).rejects.toThrow('fetchAllCities: 500');
  });
});
