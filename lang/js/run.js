#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const { run } = require("./interpreter");
const [file, entry, ...rawArgs] = process.argv.slice(2);
if (!file || !entry) {
  console.error("Usage: node lang/js/run.js <program.su> <entry-adhikara> [args...]");
  process.exit(2);
}
const args = rawArgs.map(x => {
  if (/^-?\d+$/.test(x)) return Number(x);
  if (x === "guru") return true;
  if (x === "laghu") return false;
  return x;
});
try {
  const result = run(fs.readFileSync(file, "utf8"), entry, args);
  for (const value of result.output) process.stdout.write(`${String(value)}\n`);
  console.error(JSON.stringify({ result: result.result, rewrite_steps: result.trace.length }, null, 2));
} catch (e) {
  console.error(`${e.name}: ${e.message}`);
  process.exit(1);
}
