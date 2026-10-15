#!/usr/bin/env node
/**
 * Local inverse-reduction benchmark. This is the analysis job.
 * It does not generate words and it does not score generation.
 */
import { readFileSync } from "node:fs";
import { analyzeInverseReduction } from "../tools/pushkalavati-compiler/src/inverse-reduction.js";

const fixtures = JSON.parse(readFileSync(new URL("./fixtures/attested.json", import.meta.url), "utf8"));
const rows = [];

for (const item of fixtures.analysis.filter((x) => x.job === "inverse")) {
  const started = process.hrtime.bigint();
  const result = analyzeInverseReduction(item.surface);
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
  const candidates = (result.candidates || []).map((c) => c.stem_surface_candidate);
  const pass = item.expected_status
    ? result.status === item.expected_status
    : result.prefix === item.expected_prefix &&
      item.expected_candidates.every((c) => candidates.includes(c));
  rows.push({
    system: "pushkalavati-inverse",
    job: "analysis",
    id: item.id,
    surface: item.surface,
    status: result.status,
    prefix: result.prefix ?? null,
    candidates,
    rules: (result.trace || []).filter((t) => t.rule).map((t) => t.rule),
    elapsed_ms: Number(elapsedMs.toFixed(3)),
    pass,
  });
}

console.log(JSON.stringify({ system: "pushkalavati-inverse", rows }, null, 2));
process.exit(rows.every((r) => r.pass) ? 0 : 1);
