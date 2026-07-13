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
  let maxStart = intervals[0][0];
  for (let i = 1; i < n; i++) {
    const s = intervals[i][0];
    if (s < minStart) minStart = s;
    else if (s > maxStart) maxStart = s;
  }
  // Packed key = (start - minStart) * n + i. Use a 32-bit integer sort when the
  // largest key fits, otherwise fall back to Float64 (exact up to 2^53).
  const keys =
    (maxStart - minStart) * n + n <= 0xffffffff ? new Uint32Array(n) : new Float64Array(n);
  for (let i = 0; i < n; i++) {
    keys[i] = (intervals[i][0] - minStart) * n + i;
  }
  keys.sort(); // typed-array default sort is numeric ascending, no comparator callback

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
