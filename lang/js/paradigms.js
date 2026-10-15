/** Functional composition and imperative examples built on the Sūtram Engine. */
const { Engine } = require('./engine');

// Pure functions compose right-to-left: compose(f, g)(x) = f(g(x)).
function compose(...fns) {
  return input => fns.reduceRight((value, fn) => fn(value), input);
}
const add2 = x => x + 2;
const times3 = x => x * 3;
const minus1 = x => x - 1;
const functionalExample = compose(minus1, times3, add2);

// Imperative accumulation is encoded as a rewrite over explicit state.
// This is intentionally a demonstration of expressibility, not a claim that
// mutable loops are the most natural representation for Paninian derivation.
function imperativeAccumulator(limit) {
  const engine = new Engine();
  engine.define({
    name: 'accumulate-one-step', adhikara: 'loop', specificity: 0,
    hetu: s => s.i < s.limit,
    nigamana: s => ({ ...s, i: s.i + 1, sum: s.sum + (s.i + 1) }),
    udaharana: { input: { i: 0, sum: 0, limit: 1 }, output: { i: 1, sum: 1, limit: 1 } }
  });
  return engine.run({ i: 0, sum: 0, limit }, 'loop', limit + 1);
}
module.exports = { compose, functionalExample, imperativeAccumulator };
