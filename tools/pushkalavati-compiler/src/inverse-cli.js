#!/usr/bin/env node
/**
 * Canonical inverse-reduction entry. JavaScript is the implementation.
 * Python is a placeholder and is not consulted.
 */
import { analyzeInverseReduction } from "./inverse-reduction.js";

const input = process.argv[2];
if (!input) {
  console.error("usage: node src/inverse-cli.js <devanagari-form>");
  process.exit(2);
}
const result = analyzeInverseReduction(input);
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "ERROR" ? 1 : 0);
