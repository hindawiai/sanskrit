const assert = require('node:assert/strict');
const { Engine } = require('./engine');
const e = new Engine();
e.define({ name: 'earlier-sutra', adhikara: 'x', specificity: 1, sutraKrama: 101,
  hetu: () => true, nigamana: () => 'earlier', udaharana: { input: 0, output: 'earlier' } });
e.define({ name: 'later-sutra', adhikara: 'x', specificity: 1, sutraKrama: 102,
  hetu: () => true, nigamana: () => 'later', udaharana: { input: 0, output: 'later' } });
assert.equal(e.step(0, 'x').state, 'later');
const noOrder = new Engine();
noOrder.define({ name: 'registered-first', adhikara: 'x', specificity: 1, hetu: () => true, nigamana: () => 'first', udaharana: { input: 0, output: 'first' } });
noOrder.define({ name: 'registered-second', adhikara: 'x', specificity: 1, hetu: () => true, nigamana: () => 'second', udaharana: { input: 0, output: 'second' } });
assert.equal(noOrder.step(0, 'x').state, 'second');
console.log('Engine precedence PASS: explicit sutra order wins equal-specificity ties; registration order is fallback.');
console.log('Scope: specificity remains an explicit project heuristic, not a proven complete implementation of vipratishedha.');
