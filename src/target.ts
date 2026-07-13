import type { Interval } from "../types/experiment.ts";

/**
 * Merge a list of closed integer intervals.
 *
 * Contract (enforced by harness/verify.ts):
 * - Overlapping or touching intervals are merged: [1,3] and [3,5] become [1,5].
 * - Returns a new array sorted by start, with pairwise disjoint intervals.
 * - Must not mutate the input array or the intervals inside it.
 */
export function mergeIntervals(intervals: readonly Interval[]): Interval[] {
  const n = intervals.length;
  if (n === 0) return [];

  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);

  const merged: Interval[] = [];
  let last: Interval | undefined;
  for (let i = 0; i < n; i++) {
    const iv = sorted[i];
    if (last !== undefined && iv[0] <= last[1]) {
      if (iv[1] > last[1]) last[1] = iv[1];
    } else {
      last = [iv[0], iv[1]];
      merged.push(last);
    }
  }
  return merged;
}
