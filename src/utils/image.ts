const BASE_URL = 'https://storage.googleapis.com/joorney-pictures/'

export function buildImageUrl(url: string) {
    return BASE_URL + url
}

/**
 * Extracts a usable image URL from a Picture value.
 * The API returns pictures as either a plain string path or an object { url: string }.
 * Returns null when no picture is available.
 */
export function getPictureUrl(pic: { url: string } | string | null | undefined): string | null {
  if (!pic) return null;
  const path = typeof pic === 'string' ? pic : pic.url;
  if (!path) return null;
  return path.startsWith('https://') ? path : buildImageUrl(path);
}