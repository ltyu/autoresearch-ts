import type { Interval } from "../types/experiment.ts";

/** Deterministic PRNG (mulberry32); same seed, same sequence. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform integer in [min, max], inclusive. */
export function pickInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Random intervals with starts in [-maxCoord, maxCoord] and lengths in [0, maxLength]. */
export function generateIntervals(
  rng: () => number,
  count: number,
  maxCoord: number,
  maxLength: number,
): Interval[] {
  const intervals: Interval[] = [];
  for (let i = 0; i < count; i++) {
    const start = pickInt(rng, -maxCoord, maxCoord);
    intervals.push([start, start + pickInt(rng, 0, maxLength)]);
  }
  return intervals;
}
