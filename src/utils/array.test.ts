import { describe, it, expect } from 'vitest';
import { chunkWithOverlap } from './array';

describe('chunkWithOverlap', () => {
  it('chunks a 5-element array into overlapping groups of 3', () => {
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
