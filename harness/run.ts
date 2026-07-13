import { execFileSync, execSync } from "node:child_process";
import { randomInt } from "node:crypto";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KEEP_THRESHOLD, RESULTS_FILE, RUN_TIMEOUT_MS } from "./constants.ts";
import type { ExperimentResult, RunStatus } from "../types/experiment.ts";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const resultsPath = path.join(rootDir, RESULTS_FILE);
const tsxBin = path.join(rootDir, "node_modules", ".bin", "tsx");

const HEADER = "timestamp\tcommit\tmedianMs\tstatus\tdescription";
const REVERT_HINT = "revert with: git reset --hard HEAD~1";

function readCommitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: rootDir, encoding: "utf8" }).trim();
  } catch {
    return "nogit";
  }
}

function runChild(script: string, seed: number): { ok: boolean; stdout: string; timedOut: boolean } {
  try {
    const stdout = execFileSync(tsxBin, [path.join(rootDir, script), String(seed)], {
      cwd: rootDir,
      timeout: RUN_TIMEOUT_MS,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, stdout, timedOut: false };
  } catch (error) {
    const failure = error as { signal?: string; stdout?: string; stderr?: string };
    if (failure.stdout) process.stderr.write(String(failure.stdout));
    if (failure.stderr) process.stderr.write(String(failure.stderr));
    return { ok: false, stdout: "", timedOut: failure.signal === "SIGTERM" };
  }
}

function appendResult(result: ExperimentResult): void {
  if (!existsSync(resultsPath)) {
    writeFileSync(resultsPath, `${HEADER}\n`);
  }
  const description = result.description.replace(/\s+/g, " ").trim();
  const row = [result.timestamp, result.commit, result.medianMs ?? "", result.status, description];
  appendFileSync(resultsPath, `${row.join("\t")}\n`);
}

/** Best (lowest) median among rows already marked keep; the score to beat. */
function readIncumbentMs(): number | undefined {
  if (!existsSync(resultsPath)) return undefined;
  let best: number | undefined;
  for (const row of readFileSync(resultsPath, "utf8").trim().split("\n").slice(1)) {
    const [, , medianMs, status] = row.split("\t");
    const ms = Number(medianMs);
    if (status === "keep" && Number.isFinite(ms)) {
      best = best === undefined ? ms : Math.min(best, ms);
    }
  }
  return best;
}

function recordFailure(commit: string, description: string, status: RunStatus): never {
  appendResult({ timestamp: new Date().toISOString(), commit, status, description });
  console.log(`${status.toUpperCase()} - ${REVERT_HINT}`);
  process.exit(1);
}

function main(): void {
  const description = process.argv.slice(2).join(" ").trim();
  if (description === "") {
    console.error('usage: npm run experiment -- "<one-line description of the idea>"');
    process.exit(1);
  }

  const commit = readCommitHash();
  const seed = randomInt(2 ** 31);

  const verify = runChild("harness/verify.ts", seed);
  if (!verify.ok) {
    recordFailure(commit, description, verify.timedOut ? "timeout" : "broken");
  }

  const bench = runChild("harness/bench.ts", seed);
  if (!bench.ok) {
    recordFailure(commit, description, bench.timedOut ? "timeout" : "crash");
  }

  const { medianMs } = JSON.parse(bench.stdout.trim()) as { medianMs: number };
  const incumbentMs = readIncumbentMs();
  const keep = incumbentMs === undefined || medianMs < incumbentMs * (1 - KEEP_THRESHOLD);
  const status: RunStatus = keep ? "keep" : "discard";

  appendResult({ timestamp: new Date().toISOString(), commit, medianMs, status, description });

  const incumbentNote = incumbentMs === undefined ? "no incumbent" : `incumbent ${incumbentMs} ms`;
  if (keep) {
    console.log(`KEEP - median ${medianMs} ms (${incumbentNote}); keep the commit`);
  } else {
    console.log(`DISCARD - median ${medianMs} ms (${incumbentNote}); ${REVERT_HINT}`);
  }
}

main();
