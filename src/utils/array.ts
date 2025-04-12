export function chunkWithOverlap(arr: any[], size = 3) {
  const result = [];
  for (let i = 0; i < arr.length - 1; i += size - 1) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
