import { performance } from "node:perf_hooks";
import { mergeIntervals } from "../src/target.ts";
import { createRng, generateIntervals } from "./generate.ts";
import { BENCH_SIZES, MAX_INTERVAL_LENGTH, SAMPLE_PASSES, WARMUP_PASSES } from "./constants.ts";
import type { Interval } from "../types/experiment.ts";

const DENSE_COORD_FACTOR = 2;
const SPARSE_COORD_FACTOR = 64;

function buildWorkloads(seed: number): Interval[][] {
  const rng = createRng(seed);
  const workloads: Interval[][] = [];
  for (const size of BENCH_SIZES) {
    workloads.push(generateIntervals(rng, size, size * DENSE_COORD_FACTOR, MAX_INTERVAL_LENGTH));
    workloads.push(generateIntervals(rng, size, size * SPARSE_COORD_FACTOR, MAX_INTERVAL_LENGTH));
  }
  return workloads;
}

/** Runs every workload once; the checksum keeps outputs observable so calls can't be optimized away. */
function timePass(workloads: Interval[][]): { ms: number; checksum: number } {
  let checksum = 0;
  const startedAt = performance.now();
  for (const workload of workloads) {
    checksum += mergeIntervals(workload).length;
  }
  return { ms: performance.now() - startedAt, checksum };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function main(): void {
  const seed = Number(process.argv[2] ?? Date.now());
  const workloads = buildWorkloads(seed);

  const samples: number[] = [];
  let checksum = 0;
  for (let pass = 0; pass < WARMUP_PASSES + SAMPLE_PASSES; pass++) {
    const result = timePass(workloads);
    checksum = result.checksum;
    if (pass >= WARMUP_PASSES) {
      samples.push(result.ms);
    }
  }

  console.log(JSON.stringify({ medianMs: Number(median(samples).toFixed(3)), checksum, seed }));
}

main();
