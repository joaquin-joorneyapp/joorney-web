import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authAxios } from './axios';

describe('authAxios 401 interceptor', () => {
  let mock: MockAdapter;
  let replaceSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mock = new MockAdapter(authAxios);

    // Mock window.location.replace
    replaceSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { replace: replaceSpy },
      writable: true,
      configurable: true,
    });

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it('removes token and redirects to /login on 401', async () => {
    mock.onGet('/test').reply(401);

    const promise = authAxios.get('/test');

    // Give the interceptor time to fire
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(replaceSpy).toHaveBeenCalledWith('/login');

    // The promise should never resolve or reject
    let settled = false;
    promise.then(() => { settled = true; }).catch(() => { settled = true; });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(settled).toBe(false);
  });

  it('rejects normally on non-401 errors', async () => {
    mock.onGet('/test').reply(403);

    await expect(authAxios.get('/test')).rejects.toMatchObject({
      response: { status: 403 },
    });

    expect(localStorage.removeItem).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('rejects normally on network errors (no response)', async () => {
    mock.onGet('/test').networkError();

    await expect(authAxios.get('/test')).rejects.toThrow();

    expect(localStorage.removeItem).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
