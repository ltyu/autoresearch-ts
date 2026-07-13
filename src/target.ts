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

  // Pack (start, originalIndex) into one number so the sort comparator is a
  // plain numeric subtraction with no tuple property access.
  let minStart = intervals[0][0];
  for (let i = 1; i < n; i++) {
    const s = intervals[i][0];
    if (s < minStart) minStart = s;
  }
  const keys = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    keys[i] = (intervals[i][0] - minStart) * n + i;
  }
  keys.sort((a, b) => a - b);

  const merged: Interval[] = [];
  let last: Interval | undefined;
  for (let k = 0; k < n; k++) {
    const iv = intervals[keys[k] % n];
    if (last !== undefined && iv[0] <= last[1]) {
      if (iv[1] > last[1]) last[1] = iv[1];
    } else {
      last = [iv[0], iv[1]];
      merged.push(last);
    }
  }
  return merged;
}
