import type { Interval } from "../types/experiment.ts";

/**
 * Obviously-correct reference implementation the gate compares against.
 * Not benchmarked; clarity over speed.
 */
export function mergeIntervalsReference(intervals: readonly Interval[]): Interval[] {
  const sorted = intervals
    .map(([start, end]): Interval => [start, end])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const merged: Interval[] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last !== undefined && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}
