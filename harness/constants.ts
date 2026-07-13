/** Number of random cases the correctness gate generates per run. */
export const VERIFY_CASE_COUNT = 300;
/** Largest random input size for the correctness gate. */
export const VERIFY_MAX_INTERVALS = 256;

/** Untimed passes before sampling, to let the JIT settle. */
export const WARMUP_PASSES = 3;
/** Timed passes; the reported metric is their median. */
export const SAMPLE_PASSES = 15;
/** Input sizes benchmarked; each size runs in a dense and a sparse variant. */
export const BENCH_SIZES = [64, 512, 4096] as const;
/** Longest interval the generators produce. */
export const MAX_INTERVAL_LENGTH = 16;

/** An experiment must beat the incumbent by this fraction to be kept. */
export const KEEP_THRESHOLD = 0.02;
/** verify and bench are each killed after this long. */
export const RUN_TIMEOUT_MS = 60_000;

export const RESULTS_FILE = "results.tsv";
