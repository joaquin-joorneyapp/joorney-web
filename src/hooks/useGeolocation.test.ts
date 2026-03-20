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
