import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { forward, inverse, roundTrip } from "../src/two-way.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ops = JSON.parse(readFileSync(path.join(root, "data", "operations.json"), "utf8"));
const rule = {
  id: "6.1.94",
  operation: { ...ops.SANDHI_ATTESTED["6.1.94"], status: "executable_tested" },
};
const context = { upasarga: true, dhatu: true };

for (const example of ops.SANDHI_ATTESTED["6.1.94"].examples) {
  const generated = forward(example.left, example.right, context, rule);
  assert.equal(generated.output, example.expected, `${example.left}+${example.right}`);
  const trip = roundTrip(example.left, example.right, context, rule);
  assert.equal(trip.status, "ROUND_TRIP", `${example.expected} must recover ${example.left}+${example.right}`);
}

assert.equal(inverse("prejate", { upasarga: false, dhatu: true }, rule).length, 0, "context is mandatory in both directions");
assert.equal(forward("pra", "ejate", { upasarga: false, dhatu: true }, rule), null);
console.log("two-way 6.1.94 passed");
