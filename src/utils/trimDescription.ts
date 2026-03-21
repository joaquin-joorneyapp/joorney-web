/**
 * Trims `text` to fit within a meta description.
 *
 * `maxLength` is the limit on the **text portion** before the ellipsis.
 * The returned string may be up to `maxLength + 1` characters long when
 * truncation occurs (text + the single `…` character).
 *
 * Returns an empty string for null/undefined/empty inputs.
 */
export function trimDescription(
  text: string | null | undefined,
  maxLength: number = 160,
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  return lastSpace > 0 ? trimmed.slice(0, lastSpace) + '…' : trimmed + '…';
}
