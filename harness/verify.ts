import { mergeIntervals } from "../src/target.ts";
import { mergeIntervalsReference } from "./reference.ts";
import { createRng, generateIntervals, pickInt } from "./generate.ts";
import { VERIFY_CASE_COUNT, VERIFY_MAX_INTERVALS } from "./constants.ts";
import type { Interval } from "../types/experiment.ts";

const SHOWN_CHARS = 400;

function truncate(text: string): string {
  return text.length > SHOWN_CHARS ? `${text.slice(0, SHOWN_CHARS)}…` : text;
}

function checkCase(input: Interval[]): string | null {
  const snapshot = JSON.stringify(input);
  const actual = mergeIntervals(input);
  const expected = mergeIntervalsReference(input);
  if (JSON.stringify(input) !== snapshot) {
    return `input was mutated\n  input: ${truncate(snapshot)}`;
  }
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    return [
      "wrong output",
      `  input:    ${truncate(snapshot)}`,
      `  expected: ${truncate(JSON.stringify(expected))}`,
      `  actual:   ${truncate(JSON.stringify(actual))}`,
    ].join("\n");
  }
  return null;
}

function buildEdgeCases(): Interval[][] {
  return [
    [],
    [[0, 0]],
    [[1, 3], [2, 4]],
    [[1, 2], [2, 3]],
    [[3, 4], [1, 2]],
    [[1, 10], [2, 3], [4, 5]],
    [[5, 5], [5, 5], [5, 5]],
    [[-5, -1], [-2, 3], [7, 7]],
    [[0, 1], [2, 3], [4, 5], [1, 4]],
  ];
}

function main(): void {
  const seed = Number(process.argv[2] ?? Date.now());
  const rng = createRng(seed);

  const cases = buildEdgeCases();
  for (let i = 0; i < VERIFY_CASE_COUNT; i++) {
    const count = pickInt(rng, 0, VERIFY_MAX_INTERVALS);
    const sparse = pickInt(rng, 0, 1) === 1;
    const maxCoord = sparse ? (count + 1) * 32 : count + 1;
    cases.push(generateIntervals(rng, count, maxCoord, pickInt(rng, 0, 24)));
  }

  for (const [index, input] of cases.entries()) {
    const failure = checkCase(input);
    if (failure !== null) {
      console.error(`verify FAILED on case ${index} (seed ${seed}): ${failure}`);
      process.exit(1);
    }
  }
  console.log(`verify passed: ${cases.length} cases (seed ${seed})`);
}

main();
