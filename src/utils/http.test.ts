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
