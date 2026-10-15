const assert = require('node:assert/strict');
const { functionalExample, imperativeAccumulator } = require('./paradigms');
assert.equal(functionalExample(4), 17); // ((4 + 2) * 3) - 1
const result = imperativeAccumulator(5);
assert.equal(result.state.sum, 15);
assert.equal(result.state.i, 5);
assert.equal(result.trace.length, 5);
console.log('Paradigms PASS: 3-function pure composition; rewrite-driven accumulator (5 steps -> 15)');
console.log('Fit note: pure derivation composition is a natural fit; mutable accumulator is expressible but state-encoding is more awkward.');
