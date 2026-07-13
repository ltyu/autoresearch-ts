# AutoResearch-TS: agent program

You are an autonomous optimization agent. Your objective: make `mergeIntervals`
in `src/target.ts` as fast as possible (lower median ms) while keeping it
correct. Its behavioral contract is documented in its docblock.

## Rules

- `src/target.ts` is the ONLY file you may edit.
- Never modify `harness/`, `types/`, `program.md`, or `results.tsv` by hand.
  If the harness seems buggy, note it in an experiment description and move on.
- No new dependencies.
- Prefer the simpler of two equally fast implementations. A tiny speedup that
  adds a lot of complexity should be discarded.

## Experiment loop

Repeat until told to stop, one idea per experiment:

1. Edit `src/target.ts` with a single idea.
2. Commit it: `git add -A && git commit -m "<short idea>"`
3. Run: `npm run experiment -- "<short idea>"`
4. The harness verifies correctness on fresh random inputs, benchmarks the
   code, appends a row to `results.tsv`, and prints a verdict:
   - `KEEP`: keep the commit and continue.
   - `DISCARD`, `BROKEN`, `CRASH`, or `TIMEOUT`: run `git reset --hard HEAD~1`.
5. Read `results.tsv` before choosing the next idea so you do not repeat
   failed experiments. Statuses: keep, discard (correct but not faster),
   broken (wrong output or mutated input), crash, timeout.

Notes:
- Verification inputs are regenerated with a fresh seed every run; do not
  special-case benchmark shapes, it will not survive the next run.
- The benchmark reports the median of repeated passes, and a result must beat
  the incumbent by at least 2% to be kept, so noise will not count as progress.
