export type Addon = { code: string; label: string; rate: number };

/** Sum of the per-seat monthly rates of the staged (selected) add-ons. */
export function addedRate(addons: Addon[], selected: Set<string>): number {
  return addons.reduce((sum, a) => (selected.has(a.code) ? sum + a.rate : sum), 0);
}

/** Period total after staging = current total + (added per-seat rate × seats). */
export function stagedTotal(currentTotal: number, addons: Addon[], selected: Set<string>, seats: number): number {
  return currentTotal + addedRate(addons, selected) * seats;
}

/** Signed delta vs the current total (0 when nothing is staged). */
export function stagedDelta(currentTotal: number, addons: Addon[], selected: Set<string>, seats: number): number {
  return stagedTotal(currentTotal, addons, selected, seats) - currentTotal;
}
