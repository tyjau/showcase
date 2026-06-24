/** Wrap a carousel index into [0, length) with modulo — handles negatives (prev from 0)
 * and overflow (next from last) so the carousel loops cleanly. length<=0 → 0. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}
