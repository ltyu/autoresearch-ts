# autoresearch-ts

A TypeScript take on [karpathy/autoresearch](https://github.com/karpathy/autoresearch):
a small harness that lets an AI agent run optimization experiments on one
function, autonomously, with correctness and measurement locked down.

The agent edits `src/target.ts` (interval merging), commits, and runs the
harness. The harness gates on correctness against a reference implementation
using freshly seeded random inputs, benchmarks the median of repeated passes,
appends every experiment to `results.tsv`, and answers KEEP or DISCARD.

## Layout

- `program.md` - standing instructions for the agent (you edit this)
- `src/target.ts` - the only file the agent may edit
- `harness/` - locked: correctness gate, benchmark, experiment runner
- `types/` - shared types
- `results.tsv` - experiment ledger (gitignored, written by the harness)

## Quickstart

```bash
npm install
npm run experiment -- "baseline"   # verify + bench + log one experiment
npm run verify                     # correctness gate only
npm run bench                      # benchmark only
```

## Running an agent on it

Open an agent (e.g. Claude Code) in this directory and say:

> Read program.md and follow it until I stop you.
