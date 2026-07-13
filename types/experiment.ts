/** A closed integer interval. start <= end always holds for valid input. */
export type Interval = [start: number, end: number];

/**
 * Outcome of one experiment:
 * - keep:    correct and faster than the incumbent by at least the keep threshold
 * - discard: correct but not meaningfully faster
 * - broken:  failed the correctness gate
 * - crash:   threw at runtime during verify or bench
 * - timeout: exceeded the per-run time limit
 */
export type RunStatus = "keep" | "discard" | "broken" | "crash" | "timeout";

export interface ExperimentResult {
  /** ISO time the experiment finished. */
  timestamp: string;
  /** Short git hash of the code that was measured. */
  commit: string;
  /** Median benchmark time in ms; absent when the run never reached bench. */
  medianMs?: number;
  status: RunStatus;
  /** The agent's one-line note of the idea tested. */
  description: string;
}
