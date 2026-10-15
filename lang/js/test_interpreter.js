const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { run, parse } = require("./interpreter");

const source = fs.readFileSync(path.join(__dirname, "../examples/ganana.su"), "utf8");
const parsed = parse(source);
assert.ok(parsed.adhikaras.mula);
assert.ok(parsed.adhikaras.dviguna_karoti);

const result = run(source, "mula");
assert.equal(result.result, 13);
assert.deepEqual(result.output, [12]);
assert.ok(result.trace.length >= 6);
assert.ok(result.trace.some(s => s.rule.startsWith("dviguna_karoti:")));

assert.equal(run(`
adhyaya test:
  pada prathama:
    adhikara add(x):
      karta: x
      yoga 4
      phala
    iti
  iti
iti
`, "add", [3]).result, 7);

assert.throws(() => parse(`adhyaya x:
  pada y:
    adhikara bad():
      karta: unknown
    iti
  iti
iti`), /no phala/);
assert.throws(() => run(source, "mula", [1]), /expects 0 argument/);
console.log("Sūtram interpreter tests passed: ganana.su => output [12], result 13; nested adhikara call and validation passed");
