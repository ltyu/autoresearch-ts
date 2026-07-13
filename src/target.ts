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
  const sorted = intervals
    .map((interval) => ({ start: interval[0], end: interval[1] }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  let merged: Interval[] = [];
  for (const { start, end } of sorted) {
    const last = merged[merged.length - 1];
    if (last !== undefined && start <= last[1]) {
      merged = [...merged.slice(0, -1), [last[0], Math.max(last[1], end)]];
    } else {
      merged = [...merged, [start, end]];
    }
  }
  return merged;
}
